import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, I18nManager, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { decodePolyline } from '../../utils/polyline';
import { useRideCallActions } from '../../hooks/useRideCallActions';
import { SAFETY_SEVERITY_COLORS } from '../../constants/safetySeverity';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const SEVERITY_COLORS = SAFETY_SEVERITY_COLORS;

export const RideTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { driver, safetyAlert, clearSafetyAlert, eta, progressPct, driverCoords, pickupCoords, dropoffCoords, routePolyline, rideId } = useRide();
  const { t } = useTranslation();

  const routeCoordinates = routePolyline
    ? decodePolyline(routePolyline)
    : pickupCoords && dropoffCoords
      ? [
          { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude },
          { latitude: dropoffCoords.latitude, longitude: dropoffCoords.longitude },
        ]
      : [];
  const { startAudioCall, startVideoCall } = useRideCallActions({
    rideId,
    peerType: 'driver',
    peerId: driver?.id,
    peerName: driver?.name ?? t('ride.driver'),
  });

  const mapRegion = driverCoords
    ? { latitude: driverCoords.latitude, longitude: driverCoords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : pickupCoords
    ? { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 36.7538, longitude: 3.0588, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  useEffect(() => {
    if (!safetyAlert || safetyAlert.severity === 'high') return;
    const timer = setTimeout(clearSafetyAlert, 8000);
    return () => clearTimeout(timer);
  }, [safetyAlert, clearSafetyAlert]);

  if (!driver) return null;

  const alertColor = safetyAlert ? (SEVERITY_COLORS[safetyAlert.severity] ?? SEVERITY_COLORS.high) : SEVERITY_COLORS.high;

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.mapArea}
        provider={Platform.OS === 'android' ? 'google' : PROVIDER_DEFAULT}
        region={mapRegion}
        showsUserLocation={false}
        showsCompass={false}
      >
        {driverCoords && (
          <Marker coordinate={driverCoords} title={driver?.name ?? 'Driver'} pinColor={colors.primary} />
        )}
        {pickupCoords && (
          <Marker coordinate={{ latitude: pickupCoords.latitude, longitude: pickupCoords.longitude }} title={t('ride.pickup') ?? 'Pickup'} pinColor={colors.secondary} />
        )}
        {dropoffCoords && (
          <Marker coordinate={{ latitude: dropoffCoords.latitude, longitude: dropoffCoords.longitude }} title={t('ride.dropoff') ?? 'Dropoff'} pinColor={colors.error} />
        )}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        )}
        {driverCoords && (
          <Polyline
            coordinates={[
              { latitude: driverCoords.latitude, longitude: driverCoords.longitude },
              ...(routeCoordinates[0] ? [routeCoordinates[0]] : pickupCoords ? [{ latitude: pickupCoords.latitude, longitude: pickupCoords.longitude }] : []),
            ]}
            strokeColor={colors.secondary}
            strokeWidth={3}
            lineDashPattern={[8, 6]}
          />
        )}
      </MapView>

      {/* Safety alert banner */}
      {safetyAlert && (
        <View style={[styles.alertBanner, { backgroundColor: alertColor }]}>
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.alertText} numberOfLines={2}>{safetyAlert.detail}</Text>
          <TouchableOpacity
            onPress={clearSafetyAlert}
            style={styles.alertClose}
            accessibilityLabel={t('common.close')}
            accessibilityRole="button"
          >
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Top status pill */}
      <View style={styles.statusPill}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{t('ride.onTheWay')}</Text>
      </View>

      {/* Floating ETA */}
      <View style={styles.etaContainer}>
        {eta ? (
          <Text style={styles.etaText}>
            {eta.replace(' min', '')}<Text style={styles.etaUnit}> min</Text>
          </Text>
        ) : (
          <Text style={styles.etaText}><Text style={styles.etaUnit}>--</Text></Text>
        )}
        {eta && (
          <Text style={styles.etaSubtitle}>
            {t('ride.arrivingAt')} {new Date(Date.now() + parseInt(eta) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {/* Bottom trip card */}
      <View style={styles.bottomCard}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <View style={[styles.progressMarker, { left: `${progressPct}%` }]}>
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
                <Text style={styles.ratingText}>{driver?.rating?.toFixed(1) ?? ''}</Text>
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
          <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('Chat')}>
            <Ionicons name="chatbubble" size={18} color={colors.surface} />
            <Text style={styles.contactButtonText}>{t('ride.message')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={startAudioCall}>
            <Ionicons name="call" size={18} color={colors.surface} />
            <Text style={styles.contactButtonText}>{t('ride.audioCall')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={startVideoCall}>
            <Ionicons name="videocam" size={18} color={colors.surface} />
            <Text style={styles.contactButtonText}>{t('ride.videoCall')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.safetyButton}
            onPress={() => navigation.navigate('Report')}
            accessibilityLabel={t('ride.safety')}
            accessibilityRole="button"
          >
            <Ionicons name="shield" size={20} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

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
  alertBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  alertText: {
    flex: 1,
    color: '#fff',
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '600' as any,
  },
  alertClose: {
    padding: 4,
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
