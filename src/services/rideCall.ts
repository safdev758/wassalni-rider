/**
 * In-ride WebRTC calls (audio/video). Media is peer-to-peer; server only relays signaling.
 * Requires a dev build with react-native-webrtc (not Expo Go).
 */
import { Platform } from 'react-native';
import { webrtcAPI, addWSHandler, removeWSHandler, type WSMessage } from './api';
import { wsEventData } from '../utils/wsPayload';

export type CallMode = 'audio' | 'video';
export type CallPhase = 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'connected' | 'ended';

export type CallSignal =
  | { type: 'call_init'; callType: CallMode }
  | { type: 'call_accept' }
  | { type: 'call_reject' }
  | { type: 'call_end' }
  | { type: 'offer'; sdp: RTCSessionDescriptionInit }
  | { type: 'answer'; sdp: RTCSessionDescriptionInit }
  | { type: 'ice'; candidate: RTCIceCandidateInit };

export type RideCallSnapshot = {
  phase: CallPhase;
  mode: CallMode;
  peerName: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  error: string | null;
  nativeAvailable: boolean;
};

type PeerUserType = 'rider' | 'driver';

let RTC: {
  RTCPeerConnection: typeof RTCPeerConnection;
  RTCSessionDescription: typeof RTCSessionDescription;
  RTCIceCandidate: typeof RTCIceCandidate;
  mediaDevices: MediaDevices;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RTCView: any;
} | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require('react-native-webrtc');
  if (m.registerGlobals) m.registerGlobals();
  RTC = {
    RTCPeerConnection: m.RTCPeerConnection,
    RTCSessionDescription: m.RTCSessionDescription,
    RTCIceCandidate: m.RTCIceCandidate,
    mediaDevices: m.mediaDevices,
    RTCView: m.RTCView,
  };
} catch {
  RTC = null;
}

const listeners = new Set<(s: RideCallSnapshot) => void>();

let snapshot: RideCallSnapshot = {
  phase: 'idle',
  mode: 'audio',
  peerName: '',
  localStream: null,
  remoteStream: null,
  error: null,
  nativeAvailable: RTC != null,
};

let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let ctx: {
  rideId: string;
  localType: PeerUserType;
  targetType: PeerUserType;
  targetId: string;
  mode: CallMode;
} | null = null;
let wsRegistered = false;

function emit() {
  snapshot = { ...snapshot, localStream, remoteStream: snapshot.remoteStream };
  listeners.forEach((fn) => fn(snapshot));
}

function setPartial(p: Partial<RideCallSnapshot>) {
  snapshot = { ...snapshot, ...p };
  emit();
}

async function iceServers(): Promise<RTCIceServer[]> {
  try {
    const res = await webrtcAPI.getICEServers();
    return (res?.ice_servers as RTCIceServer[]) ?? [{ urls: 'stun:stun.l.google.com:19302' }];
  } catch {
    return [{ urls: 'stun:stun.l.google.com:19302' }];
  }
}

async function sendSignal(signal: CallSignal) {
  if (!ctx) return;
  await webrtcAPI.signal(ctx.rideId, ctx.targetType, ctx.targetId, signal);
}

async function createPeer(): Promise<RTCPeerConnection> {
  if (!RTC) throw new Error('WebRTC requires a development build (not Expo Go)');
  const servers = await iceServers();
  const conn = new RTC.RTCPeerConnection({ iceServers: servers });

  conn.onicecandidate = (ev) => {
    if (ev.candidate) {
      sendSignal({ type: 'ice', candidate: ev.candidate.toJSON() }).catch(() => {});
    }
  };

  conn.ontrack = (ev) => {
    const stream = ev.streams?.[0];
    if (stream) setPartial({ remoteStream: stream });
  };

  conn.onconnectionstatechange = () => {
    if (conn.connectionState === 'connected') {
      setPartial({ phase: 'connected' });
    }
    if (conn.connectionState === 'failed' || conn.connectionState === 'disconnected') {
      setPartial({ error: 'Connection lost', phase: 'ended' });
      cleanup();
    }
  };

  return conn;
}

async function attachLocalMedia(mode: CallMode) {
  if (!RTC) throw new Error('WebRTC unavailable');
  const stream = await RTC.mediaDevices.getUserMedia({
    audio: true,
    video: mode === 'video',
  });
  localStream = stream;
  stream.getTracks().forEach((track) => pc?.addTrack(track, stream));
  setPartial({ localStream: stream });
}

function cleanup() {
  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;
  pc?.close();
  pc = null;
  ctx = null;
  setPartial({
    phase: 'idle',
    localStream: null,
    remoteStream: null,
    error: null,
  });
}

async function handleRemoteSignal(
  rideId: string,
  fromType: PeerUserType,
  fromId: string,
  raw: CallSignal,
) {
  switch (raw.type) {
    case 'call_init':
      if (snapshot.phase !== 'idle') return;
      ctx = {
        rideId,
        localType: fromType === 'driver' ? 'rider' : 'driver',
        targetType: fromType,
        targetId: fromId,
        mode: raw.callType ?? 'audio',
      };
      setPartial({
        phase: 'incoming',
        mode: raw.callType ?? 'audio',
        peerName: snapshot.peerName || 'Contact',
      });
      return;
    case 'call_reject':
      setPartial({ phase: 'ended', error: 'Call declined' });
      cleanup();
      return;
    case 'call_end':
      setPartial({ phase: 'ended' });
      cleanup();
      return;
    case 'call_accept':
      if (snapshot.phase === 'outgoing') setPartial({ phase: 'connecting' });
      return;
    case 'offer':
      if (!RTC) return;
      if (!ctx) {
        ctx = {
          rideId,
          localType: fromType === 'driver' ? 'rider' : 'driver',
          targetType: fromType,
          targetId: fromId,
          mode: snapshot.mode || 'audio',
        };
      }
      if (!pc) {
        pc = await createPeer();
        await attachLocalMedia(ctx.mode);
      }
      await pc.setRemoteDescription(new RTC.RTCSessionDescription(raw.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal({ type: 'answer', sdp: answer });
      setPartial({ phase: 'connecting' });
      return;
    case 'answer':
      if (pc && raw.sdp) {
        await pc.setRemoteDescription(new RTC.RTCSessionDescription(raw.sdp));
      }
      return;
    case 'ice':
      if (pc && raw.candidate) {
        try {
          await pc.addIceCandidate(new RTC!.RTCIceCandidate(raw.candidate));
        } catch {
          /* ignore stale candidates */
        }
      }
      return;
    default:
      return;
  }
}

function onWS(msg: WSMessage) {
  if (msg.type !== 'webrtc_signal') return;
  const data = wsEventData(msg);
  const signal = data.signal as CallSignal | undefined;
  if (!signal?.type || !data.ride_id) return;
  handleRemoteSignal(
    data.ride_id as string,
    data.from_type as PeerUserType,
    data.from_id as string,
    signal,
  ).catch(() => {});
}

function ensureWS() {
  if (wsRegistered) return;
  addWSHandler(onWS);
  wsRegistered = true;
}

export const rideCall = {
  get RTCView() {
    return RTC?.RTCView ?? null;
  },

  getSnapshot(): RideCallSnapshot {
    return snapshot;
  },

  subscribe(fn: (s: RideCallSnapshot) => void) {
    ensureWS();
    listeners.add(fn);
    fn(snapshot);
    return () => listeners.delete(fn);
  },

  async startOutgoing(opts: {
    rideId: string;
    localType: PeerUserType;
    targetType: PeerUserType;
    targetId: string;
    mode: CallMode;
    peerName: string;
  }) {
    ensureWS();
    if (!RTC) {
      setPartial({ error: 'Install a dev build with WebRTC to place in-app calls.', phase: 'idle' });
      return;
    }
    if (snapshot.phase !== 'idle') await this.endCall();

    ctx = {
      rideId: opts.rideId,
      localType: opts.localType,
      targetType: opts.targetType,
      targetId: opts.targetId,
      mode: opts.mode,
    };
    setPartial({
      phase: 'outgoing',
      mode: opts.mode,
      peerName: opts.peerName,
      error: null,
    });

    try {
      await sendSignal({ type: 'call_init', callType: opts.mode });
      pc = await createPeer();
      await attachLocalMedia(opts.mode);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal({ type: 'offer', sdp: offer });
      setPartial({ phase: 'connecting' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Call failed';
      setPartial({ phase: 'ended', error: message });
      cleanup();
    }
  },

  async acceptIncoming() {
    if (snapshot.phase !== 'incoming' || !ctx || !RTC) return;
    try {
      setPartial({ phase: 'connecting' });
      await sendSignal({ type: 'call_accept' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not accept call';
      setPartial({ phase: 'ended', error: message });
      cleanup();
    }
  },

  async rejectIncoming() {
    if (snapshot.phase !== 'incoming') return;
    try {
      await sendSignal({ type: 'call_reject' });
    } catch {
      /* best-effort */
    }
    cleanup();
  },

  async endCall() {
    try {
      if (ctx) await sendSignal({ type: 'call_end' });
    } catch {
      /* best-effort */
    }
    cleanup();
  },

  toggleMute() {
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
  },

  toggleCamera() {
    localStream?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
  },
};

export function useRideCallSupported(): boolean {
  return RTC != null && Platform.OS !== 'web';
}
