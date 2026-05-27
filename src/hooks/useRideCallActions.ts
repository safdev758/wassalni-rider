import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { rideCall, type CallMode, useRideCallSupported } from '../services/rideCall';

export function useRideCallActions(opts: {
  rideId: string | null;
  peerType: 'driver';
  peerId: string | undefined;
  peerName: string;
}) {
  const { t } = useTranslation();
  const supported = useRideCallSupported();

  const startCall = useCallback(
    (mode: CallMode) => {
      if (!opts.rideId || !opts.peerId) return;
      if (!supported) {
        Alert.alert(t('common.error'), t('ride.webrtcDevBuildRequired'));
        return;
      }
      rideCall.startOutgoing({
        rideId: opts.rideId,
        localType: 'rider',
        targetType: opts.peerType,
        targetId: opts.peerId,
        mode,
        peerName: opts.peerName,
      });
    },
    [opts.rideId, opts.peerId, opts.peerName, supported, t],
  );

  return { startAudioCall: () => startCall('audio'), startVideoCall: () => startCall('video'), supported };
}
