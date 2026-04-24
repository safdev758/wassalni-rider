import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const RideTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { driver, completeRide } = useRide();

  if (!driver) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Map background */}
      <View style={styles.mapArea} />

      {/* Top status pill */}
      <View style={styles.statusPill}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>On the way</Text>
      </View>

      {/* Floating ETA */}
      <View style={styles.etaContainer}>
        <Text style={styles.etaText}>
          4<Text style={styles.etaUnit}>min</Text>
        </Text>
        <Text style={styles.etaSubtitle}>Arriving at 8:42 PM</Text>
      </View>

      {/* Bottom trip card */}
      <View style={styles.bottomCard}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <View style={[styles.progressMarker, { left: '75%' }]}>
            <Ionicons name="car" size={14} color={colors.primary} />
          </View>
        </View>

        {/* Driver info */}
        <View style={styles.driverInfo}>
          <View style={styles.driverLeft}>
            <View style={styles.driverPhotoContainer}>
              <Ionicons name="person" size={24} color={colors.onSurface} />
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={10} color={colors.primary} />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>
            <View>
              <Text style={styles.driverName}>{driver?.name ?? ''}</Text>
              <Text style={styles.driverVehicle}>{driver?.plate ?? ''} • {driver?.vehicle ?? ''}</Text>
            </View>
          </View>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car" size={32} color={colors.onSurfaceVariant} />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.contactButton} onPress={() => Alert.alert('Contact Driver', 'Calling feature coming soon.')}>
            <Ionicons name="call" size={18} color={colors.surface} />
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.safetyButton} onPress={() => Alert.alert('Safety', 'Emergency safety features coming soon.')}>
            <Ionicons name="shield" size={20} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Complete ride button (for testing) */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => {
            completeRide();
            navigation.replace('RateTrip');
          }}
          activeOpacity={0.95}
        >
          <Text style={styles.completeButtonText}>Complete Ride (Test)</Text>
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
  mapArea: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  statusPill: {
    position: 'absolute',
    top: 48,
    left: '50%',
    transform: [{ translateX: -80 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer + 'B3',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  etaContainer: {
    position: 'absolute',
    top: 128,
    left: 24,
  },
  etaText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 56,
    fontWeight: '800' as any,
    color: colors.onSurface,
    lineHeight: 56,
  },
  etaUnit: {
    fontSize: 24,
    color: colors.onSurfaceVariant,
    fontWeight: '500' as any,
    marginLeft: 4,
  },
  etaSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    fontWeight: '500' as any,
    letterSpacing: 0.5,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerHigh + 'DA',
    borderTopLeftRadius: spacing.borderRadius.xxl,
    borderTopRightRadius: spacing.borderRadius.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 16,
  },
  progressContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressMarker: {
    position: 'absolute',
    top: 0,
    transform: [{ translateX: -12 }, { translateY: -6 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  driverInfo: {
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
    bottom: -2,
    right: -2,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: 4,
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
    fontWeight: '700' as any,
    color: colors.onSurface,
  },
  driverVehicle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  vehicleIcon: {
    width: 64,
    height: 48,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.md,
    shadowColor: colors.onPrimaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  contactButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '600' as any,
    color: colors.surface,
    letterSpacing: 0.5,
  },
  safetyButton: {
    width: 52,
    height: 52,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    marginTop: spacing.md,
    backgroundColor: colors.error,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  completeButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '600' as any,
    color: colors.onError,
  },
});
