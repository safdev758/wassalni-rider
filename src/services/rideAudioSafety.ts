/**
 * Real-time in-ride cabin safety (rider phone only).
 *
 * ML detections are NOT auto-reported: the rider must confirm or dismiss
 * to avoid false positives. Confirmed reports attach the retained WAV.
 */
import { getAccessToken } from './api';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  ((__DEV__) ? 'http://10.0.2.2:8080/api/v1' : 'https://api.wasselni.dz/api/v1');

const CHUNK_MS = 2500;

let activeRideId: string | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let isUploading = false;

export type HarassmentPrompt = {
  rideId: string;
  pendingEvidenceId: string;
  label: string;
  confidence: number;
  reasonCode?: string;
};

let onHarassmentPrompt: ((p: HarassmentPrompt) => void) | null = null;

export function setHarassmentPromptHandler(handler: ((p: HarassmentPrompt) => void) | null) {
  onHarassmentPrompt = handler;
}

type ClassifyResponse = {
  label: string;
  confidence: number;
  pending_evidence_id?: string;
  requires_confirmation?: boolean;
};

async function uploadAndClassify(rideId: string, uri: string): Promise<ClassifyResponse | null> {
  const token = getAccessToken();
  if (!token) return null;

  const res = await fetch(uri);
  const blob = await res.blob();
  const buf = await blob.arrayBuffer();

  const httpRes = await fetch(`${API_BASE}/rides/${rideId}/safety/audio`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    body: buf,
  });
  if (!httpRes.ok) return null;
  return httpRes.json().catch(() => null);
}

function onClassification(rideId: string, result: ClassifyResponse) {
  if (!result?.label || result.label === 'normal' || result.label === 'skipped') return;

  if (result.requires_confirmation && result.pending_evidence_id) {
    onHarassmentPrompt?.({
      rideId,
      pendingEvidenceId: result.pending_evidence_id,
      label: result.label,
      confidence: result.confidence ?? 0,
    });
    return;
  }

}

async function recordAndUpload(rideId: string) {
  if (isUploading) return;
  isUploading = true;
  try {
    const { Audio } = await import('expo-av');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
    await recording.startAsync();
    await new Promise(r => setTimeout(r, CHUNK_MS));
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) {
      const result = await uploadAndClassify(rideId, uri);
      if (result) onClassification(rideId, result);
    }
  } catch {
    // expo-av not installed or mic denied
  } finally {
    isUploading = false;
  }
}

export function startRideAudioSafety(rideId: string) {
  if (activeRideId === rideId) return;
  stopRideAudioSafety();
  activeRideId = rideId;
  recordAndUpload(rideId);
  intervalId = setInterval(() => {
    if (activeRideId) recordAndUpload(activeRideId);
  }, CHUNK_MS + 800);
}

export function stopRideAudioSafety() {
  activeRideId = null;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
