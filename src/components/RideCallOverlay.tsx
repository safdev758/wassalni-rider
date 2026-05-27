import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { rideCall } from '../services/rideCall';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function RideCallOverlay() {
  const { t } = useTranslation();
  const [snap, setSnap] = useState(rideCall.getSnapshot());

  useEffect(() => rideCall.subscribe(setSnap), []);

  const visible = snap.phase !== 'idle';
  const RTCView = rideCall.RTCView;

  const streamURL = (stream: MediaStream | null) =>
    stream ? (stream as unknown as { toURL: () => string }).toURL() : '';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {snap.mode === 'video' && RTCView && snap.remoteStream ? (
          <RTCView streamURL={streamURL(snap.remoteStream)} style={styles.remoteVideo} objectFit="cover" />
        ) : (
          <View style={styles.audioBackdrop}>
            <Ionicons name="person" size={72} color={colors.onSurfaceVariant} />
          </View>
        )}

        {snap.mode === 'video' && RTCView && snap.localStream && (
          <RTCView streamURL={streamURL(snap.localStream)} style={styles.localVideo} objectFit="cover" />
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{snap.peerName}</Text>
          <Text style={styles.status}>
            {snap.phase === 'outgoing' && t('ride.calling')}
            {snap.phase === 'incoming' && t('ride.incomingCall')}
            {snap.phase === 'connecting' && t('ride.connectingCall')}
            {snap.phase === 'connected' && t('ride.connectedCall')}
            {snap.phase === 'ended' && (snap.error || t('ride.callEnded'))}
          </Text>
        </View>

        <View style={styles.controls}>
          {snap.phase === 'incoming' ? (
            <>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => rideCall.rejectIncoming()}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => rideCall.acceptIncoming()}>
                <Ionicons name="call" size={28} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {snap.phase === 'connected' && (
                <>
                  <TouchableOpacity style={styles.toolBtn} onPress={() => rideCall.toggleMute()}>
                    <Ionicons name="mic-off" size={22} color={colors.onSurface} />
                  </TouchableOpacity>
                  {snap.mode === 'video' && (
                    <TouchableOpacity style={styles.toolBtn} onPress={() => rideCall.toggleCamera()}>
                      <Ionicons name="videocam-off" size={22} color={colors.onSurface} />
                    </TouchableOpacity>
                  )}
                </>
              )}
              {(snap.phase === 'outgoing' || snap.phase === 'connecting') && (
                <ActivityIndicator color={colors.primary} style={{ marginRight: spacing.lg }} />
              )}
              <TouchableOpacity style={styles.hangupBtn} onPress={() => rideCall.endCall()}>
                <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {!snap.nativeAvailable && (
          <Text style={styles.hint}>{t('ride.webrtcDevBuildRequired')}</Text>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  remoteVideo: { ...StyleSheet.absoluteFillObject },
  localVideo: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.md,
    width: 120,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  audioBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
  },
  info: { padding: spacing.lg, alignItems: 'center' },
  name: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.headlineSmall,
    color: colors.onSurface,
    fontWeight: '700' as never,
  },
  status: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  acceptBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangupBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    textAlign: 'center',
    padding: spacing.md,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
});
