import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const DriverFoundScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { driver, state, cancelRide, selectedOption } = useRide();

  useEffect(() => {
    if (state === 'tracking') {
      navigation.replace('RideTracking');
    }
  }, [state, navigation]);

  if (!driver) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top overlay */}
      <View style={styles.topOverlay}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            cancelRide();
            navigation.navigate('Main');
          }}
        >
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.etaBadge}>
          <Text style={styles.etaBadgeText}>{t('ride.estimatedTime')} {selectedOption?.eta || '5 min'} {t('ride.minAway')}</Text>
        </View>
      </View>

      {/* Map area (placeholder) */}
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

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        <Text style={styles.bottomTitle}>{t('ride.yourDriverIsArriving')}</Text>

        {/* Driver details */}
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

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Chat' as never)}>
            <Ionicons name="chatbubble" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>{t('ride.message')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Call' as never)}>
            <Ionicons name="call" size={20} color={colors.surface} />
            <Text style={styles.primaryButtonText}>{t('ride.callDriver')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert(t('ride.shareTripStatus'), t('common.loading'))}>
          <Text style={styles.shareButtonText}>{t('ride.shareTripStatus')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaBadge: {
    backgroundColor: colors.surfaceContainerHigh + 'CC',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  etaBadgeText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '600' as any,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapArea: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  driverPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    alignItems: 'center',
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivingBadge: {
    backgroundColor: colors.surfaceContainerHigh + 'E6',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: spacing.sm,
  },
  arrivingBadgeText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 10,
    fontWeight: '700' as any,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomSheet: {
    backgroundColor: colors.surfaceContainerLow,
    borderTopLeftRadius: spacing.borderRadius.xxl,
    borderTopRightRadius: spacing.borderRadius.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 16,
  },
  dragHandle: {
    width: 48,
    height: 6,
    backgroundColor: colors.outlineVariant + '4D',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  bottomTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '700' as any,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  driverDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  driverPhotoContainer: {
    position: 'relative',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  ratingText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700' as any,
    color: colors.onSurface,
  },
  driverName: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '600' as any,
    color: colors.onSurface,
  },
  driverVehicle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  plateContainer: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 100,
  },
  plateText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '800' as any,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  plateLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.md,
    shadowColor: colors.onPrimaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.surface,
  },
  shareButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  shareButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
});
