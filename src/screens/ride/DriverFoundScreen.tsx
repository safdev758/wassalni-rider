import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { useRideCallActions } from '../../hooks/useRideCallActions';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const DriverFoundScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { driver, state, cancelRide, selectedOption, rideId } = useRide();
  const { startAudioCall, startVideoCall } = useRideCallActions({
    rideId,
    peerType: 'driver',
    peerId: driver?.id,
    peerName: driver?.name ?? t('ride.driver'),
  });

  useEffect(() => {
    if (state === 'tracking') {
      navigation.replace('RideTracking');
    }
  }, [state, navigation]);

  if (!driver) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topOverlay}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            cancelRide();
            navigation.navigate('Main');
          }}
          accessibilityLabel={t('ride.cancelRide')}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.etaBadge}>
          <Text style={styles.etaBadgeText}>{t('ride.estimatedTime')} {selectedOption?.eta || '5 min'}</Text>
        </View>
      </View>

      <View style={styles.mapArea}>
        <View style={styles.driverPin}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={24} color={colors.onSurface} />
          </View>
          <View style={styles.arrivingBadge}>
            <Text style={styles.arrivingBadgeText}>{(driver?.name ?? '').toUpperCase()} {t('ride.onTheWay').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        <Text style={styles.bottomTitle}>{t('ride.yourDriverIsArriving')}</Text>

        <View style={styles.driverDetails}>
          <View style={styles.driverLeft}>
            <View style={styles.driverPhotoContainer}>
              <Ionicons name="person" size={28} color={colors.onSurface} />
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
                <Ionicons name="star" size={10} color={colors.primary} />
              </View>
            </View>
            <View>
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.driverVehicle}>{driver.vehicle}</Text>
            </View>
          </View>
          <View style={styles.plateContainer}>
            <Text style={styles.plateText}>{driver.plate}</Text>
            <Text style={styles.plateLabel}>{t('ride.licensePlate')}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Chat')}>
            <Ionicons name="chatbubble" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>{t('ride.message')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={startAudioCall}>
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>{t('ride.audioCall')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={startVideoCall}>
            <Ionicons name="videocam" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>{t('ride.videoCall')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => Alert.alert(t('ride.shareTripStatus'), t('common.loading'))}
        >
          <Text style={styles.shareButtonText}>{t('ride.shareTripStatus')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
  },
  closeButton: {
    width: 48, height: 48, borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh + 'CC',
    alignItems: 'center', justifyContent: 'center',
  },
  etaBadge: {
    backgroundColor: colors.surfaceContainerHigh + 'CC',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  etaBadgeText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '600' as never,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  mapArea: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  driverPin: {
    position: 'absolute', top: '50%', left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    alignItems: 'center',
  },
  driverAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  arrivingBadge: {
    backgroundColor: colors.surfaceContainerHigh + 'E6',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 4, marginTop: spacing.sm,
  },
  arrivingBadgeText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 10, fontWeight: '700' as never, color: colors.onSurface,
  },
  bottomSheet: {
    backgroundColor: colors.surfaceContainerLow,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    padding: spacing.lg,
  },
  dragHandle: {
    width: 40, height: 4, backgroundColor: colors.onSurfaceVariant,
    borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md,
  },
  bottomTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.titleMedium,
    fontWeight: '700' as never,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  driverDetails: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.lg,
  },
  driverLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  driverPhotoContainer: { position: 'relative' },
  ratingBadge: {
    position: 'absolute', bottom: -4, right: -4,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 4,
  },
  ratingText: { fontSize: 10, fontWeight: '700' as never },
  driverName: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '600' as never,
  },
  driverVehicle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
  },
  plateContainer: { alignItems: 'flex-end' },
  plateText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.titleMedium,
    fontWeight: '800' as never,
  },
  plateLabel: { fontSize: 10, color: colors.onSurfaceVariant },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  secondaryButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.surfaceContainerHigh,
    flexGrow: 1,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.primary,
    fontWeight: '600' as never,
  },
  shareButton: { alignItems: 'center', paddingVertical: spacing.sm },
  shareButtonText: {
    fontFamily: typography.fontFamily.body,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
