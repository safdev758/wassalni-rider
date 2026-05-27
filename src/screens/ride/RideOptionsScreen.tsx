import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/format';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const RideOptionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const {
    options, selectOption, confirmRide, pickup, dropoff,
    paymentMethod, setPaymentMethod, womenOnly, setWomenOnly, walletBalanceDzd,
    tripDistanceKm, tripDurationMin,
  } = useRide();
  const { isAuthenticated } = useAuth();

  const selected = options.find((o) => o.selected);
  const tripSummary =
    tripDistanceKm != null && tripDurationMin != null
      ? t('rideOptions.tripSummary', {
          distance: tripDistanceKm.toFixed(1),
          duration: tripDurationMin,
        })
      : t('rideOptions.findingOptimalRoute');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.routeBadge}>
          <View style={styles.routeDot} />
          <Text style={styles.routeBadgeText} numberOfLines={1}>{tripSummary}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Route summary */}
        <View style={styles.routeCard}>
          <View style={styles.routeLineContainer}>
            <Ionicons name="radio-button-on" size={14} color={colors.primary} />
            <View style={styles.routeLine} />
            <Ionicons name="location" size={14} color={colors.onSurface} />
          </View>
          <View style={styles.routeTextContainer}>
            <View style={styles.routePoint}>
              <Text style={styles.routeLabel}>{t('ride.pickup')}</Text>
              <Text style={styles.routeAddress}>{pickup || t('home.currentLocation')}</Text>
            </View>
            <View style={styles.routePoint}>
              <Text style={styles.routeLabel}>{t('ride.dropoff')}</Text>
              <Text style={styles.routeAddress}>{dropoff || t('home.enterDestination')}</Text>
            </View>
          </View>
        </View>

        {/* Ride options */}
        <View style={styles.optionsContainer}>
          {options.length === 0 && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>{t('rideOptions.loadingPrices')}</Text>
            </View>
          )}
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                option.selected && styles.optionCardSelected,
              ]}
              onPress={() => selectOption(option)}
              activeOpacity={0.9}
              accessibilityRole="radio"
              accessibilityState={{ checked: option.selected }}
              accessibilityLabel={`${option.name}, ${option.seats} seats, ${formatCurrency(option.priceDzd)}, ${option.eta} away`}
            >
              {option.selected && <View style={styles.selectedGradient} />}
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionImageContainer}>
                    <Ionicons name="car" size={24} color={option.selected ? colors.primary : colors.onSurfaceVariant} />
                  </View>
                  <View>
                    <View style={styles.optionNameRow}>
                      <Text style={[styles.optionName, option.selected && styles.optionNameSelected]}>
                        {option.name}
                      </Text>
                      {option.selected && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                      )}
                    </View>
                    {option.description ? (
                      <Text style={styles.optionDescription} numberOfLines={2}>{option.description}</Text>
                    ) : null}
                    <View style={styles.optionBadges}>
                      <View style={styles.seatBadge}>
                        <Text style={styles.seatBadgeText}>{option.seats} {t('rideOptions.seatsSuffix')}</Text>
                      </View>
                      <Text style={styles.etaText}>
                        {t('rideOptions.driverEta', { eta: option.eta.replace(/\s*min$/, '') })}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.optionPrice}>
                  <Text style={styles.priceText}>{formatCurrency(option.priceDzd)}</Text>
                  {option.originalPriceDzd != null && option.originalPriceDzd > option.priceDzd && (
                    <Text style={styles.originalPrice}>{formatCurrency(option.originalPriceDzd)}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Payment & CTA */}
      <View style={styles.bottomCard}>
        <View style={styles.paymentRow}>
          <View style={styles.paymentLeft}>
            <View style={styles.paymentIconContainer}>
              <Ionicons name="card" size={20} color={colors.onSurface} />
            </View>
            <Text style={styles.paymentName}>
              {paymentMethod === 'wallet' ? t('rideOptions.walletPayment') : t('rideOptions.cashPayment')}
            </Text>
            {paymentMethod === 'wallet' && walletBalanceDzd != null && (
              <Text style={styles.walletBalanceHint}>
                {t('wallet.balance')}: {walletBalanceDzd} DZD
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(t('rideOptions.changePayment'), undefined, [
                { text: t('rideOptions.cashPayment'), onPress: () => setPaymentMethod('cash') },
                { text: t('rideOptions.walletPayment'), onPress: () => setPaymentMethod('wallet') },
                { text: t('common.cancel'), style: 'cancel' },
              ]);
            }}
          >
            <Text style={styles.changePaymentText}>{t('rideOptions.changePayment')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.womenOnlyRow, womenOnly && styles.womenOnlyRowActive]}
          onPress={() => setWomenOnly(!womenOnly)}
          accessibilityRole="switch"
          accessibilityState={{ checked: womenOnly }}
        >
          <Ionicons name="shield-checkmark" size={22} color={womenOnly ? colors.primary : colors.onSurfaceVariant} />
          <View style={styles.womenOnlyText}>
            <Text style={styles.womenOnlyTitle}>{t('rideOptions.womenOnlyTitle')}</Text>
            <Text style={styles.womenOnlySub}>{t('rideOptions.womenOnlySub')}</Text>
          </View>
          <Ionicons name={womenOnly ? 'checkbox' : 'square-outline'} size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => {
            if (!isAuthenticated) {
              navigation.navigate('Login');
              return;
            }
            confirmRide();
          }}
          activeOpacity={0.95}
          accessibilityRole="button"
          accessibilityLabel={`Confirm ${selected?.name ?? 'ride'}`}
          disabled={!selected || selected.priceDzd <= 0}
        >
          <Text style={styles.confirmButtonText}>
            {t('ride.confirm')} {selected?.name ?? ''}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.surface} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHighest + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest + 'CC',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  routeBadgeText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  routeCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow + 'E6',
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  routeLineContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
    paddingTop: 2,
    paddingBottom: 2,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginVertical: 4,
  },
  routeTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routePoint: {
    marginBottom: spacing.md,
  },
  routeLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  routeAddress: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '600' as any,
    color: colors.onSurface,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  optionCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  selectedGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: colors.primary + '1A',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionImageContainer: {
    width: 64,
    height: 48,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  optionName: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '600' as any,
    color: colors.onSurface,
  },
  optionNameSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    maxWidth: 200,
  },
  optionBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  seatBadge: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  seatBadgeText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  etaText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 10,
    color: colors.primary,
  },
  optionPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 20,
    fontWeight: '700' as any,
    color: colors.onSurface,
  },
  originalPrice: {
    fontFamily: typography.fontFamily.body,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  bottomCard: {
    backgroundColor: colors.surfaceContainerLow + 'F2',
    borderTopLeftRadius: spacing.borderRadius.xxl,
    borderTopRightRadius: spacing.borderRadius.xxl,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  paymentIconContainer: {
    width: 40,
    height: 32,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletBalanceHint: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  paymentName: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '600' as any,
    color: colors.onSurface,
  },
  changePaymentText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '500' as any,
    color: colors.primary,
  },
  womenOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  womenOnlyRowActive: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  womenOnlyText: { flex: 1 },
  womenOnlyTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '600' as never,
    color: colors.onSurface,
  },
  womenOnlySub: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.lg,
    shadowColor: colors.onPrimaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 4,
  },
  confirmButtonText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '700' as any,
    color: colors.surface,
    marginRight: spacing.sm,
  },
});
