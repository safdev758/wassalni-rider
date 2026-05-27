import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

export const SearchingScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { cancelRide, state, counterOffers, acceptCounterOffer, selectedOption } = useRide();

  useEffect(() => {
    if (state === 'ride_options') {
      navigation.replace('RideOptions');
    }
    if (state === 'driver_found') {
      navigation.replace('DriverFound');
    }
  }, [state, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Close button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            cancelRide();
            navigation.navigate('Main');
          }}
        >
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Pulse rings */}
        <View style={styles.pulseContainer}>
          <View style={styles.pulseRing1} />
          <View style={styles.pulseRing2} />
          <View style={styles.pulseRing3} />
          <View style={styles.pulseCore}>
            <Ionicons name="search" size={32} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>{t('ride.searchingTitle')}</Text>
        <Text style={styles.subtitle}>{t('ride.searchingSubtitle')}</Text>

        {counterOffers.length > 0 && (
          <View style={styles.offersBox}>
            {counterOffers.map((offer) => (
              <TouchableOpacity
                key={offer.offerId}
                style={styles.offerCard}
                onPress={() => acceptCounterOffer(offer)}
              >
                <Text style={styles.offerName}>{offer.driverName}</Text>
                <Text style={styles.offerPrice}>{offer.offeredPrice} DZD</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Context card */}
        <View style={styles.contextCard}>
          <View style={styles.contextIconContainer}>
            <Ionicons name="car" size={20} color={colors.onSurfaceVariant} />
          </View>
          <View>
            <Text style={styles.contextTitle}>
              {selectedOption?.name ?? t('rideOptions.wasselniCore')}
            </Text>
            <Text style={styles.contextSubtitle}>
              {selectedOption
                ? t('rideOptions.driverEta', { eta: selectedOption.eta.replace(/\s*min$/, '') })
                : t('ride.searchingSubtitle')}
            </Text>
          </View>
        </View>
      </View>

      {/* Cancel button */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            cancelRide();
            navigation.navigate('Main');
          }}
          activeOpacity={0.95}
        >
          <Text style={styles.cancelButtonText}>{t('ride.cancelRide')}</Text>
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
  topBar: {
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  pulseContainer: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  pulseRing1: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: colors.primary + '1A',
  },
  pulseRing2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primary + '33',
  },
  pulseRing3: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.primary + '4D',
  },
  pulseCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 28,
    fontWeight: '700' as any,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 250,
    marginBottom: spacing.xl,
  },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer + 'B3',
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
    width: '100%',
    maxWidth: 320,
  },
  contextIconContainer: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contextTitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  contextSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  bottomArea: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  cancelButton: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  offersBox: {
    width: '100%',
    maxWidth: 320,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  offerCard: {
    backgroundColor: colors.primary + '22',
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  offerName: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    fontWeight: '600' as const,
  },
  offerPrice: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700' as const,
  },
  cancelButtonText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '600' as any,
    color: colors.onSurface,
  },
});
