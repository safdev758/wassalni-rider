import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
import { formatCurrency } from '../../utils/format';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const RideOptionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { options, selectOption, confirmRide, pickup, dropoff } = useRide();

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
          <Text style={styles.routeBadgeText}>{t('rideOptions.findingOptimalRoute')}</Text>
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
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                option.selected && styles.optionCardSelected,
              ]}
              onPress={() => selectOption(option)}
              activeOpacity={0.9}
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
                    <View style={styles.optionBadges}>
                      <View style={styles.seatBadge}>
                        <Text style={styles.seatBadgeText}>{option.seats} {t('rideOptions.seatsSuffix')}</Text>
                      </View>
                      <Text style={styles.etaText}>{option.eta} {t('rideOptions.etaAway')}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.optionPrice}>
                  <Text style={styles.priceText}>{formatCurrency(option.priceDzd)}</Text>
                  {option.originalPriceDzd !== undefined && (
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
            <Text style={styles.paymentName}>{t('rideOptions.cashPayment')}</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert(t('wallet.paymentMethods'), t('common.loading'))}>
            <Text style={styles.changePaymentText}>{t('rideOptions.changePayment')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmRide}
          activeOpacity={0.95}
        >
          <Text style={styles.confirmButtonText}>
            {t('ride.confirm')} {options.find(o => o.selected)?.name ?? ''}
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
  optionCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
    overflow: 'hidden',
  },
  optionCardSelected: {
    backgroundColor: colors.surfaceContainerHigh,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
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
