import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatCurrency, formatSignedCurrency } from '../../utils/format';

const MOCK_BALANCE_DZD = 4250;
const MOCK_PAYMENT_METHODS = [
  { id: '1', type: 'card', nameKey: 'wallet.defaultCard', name: 'CIB Card', last4: '4921', isDefault: true },
  { id: '2', type: 'wallet', nameKey: 'rideOptions.cashPayment', name: 'Cash', isDefault: false },
];
const MOCK_TRANSACTIONS: Array<{
  id: string;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  amountDzd: number;
}> = [
  {
    id: '1',
    type: 'debit',
    description: 'Airport run',
    date: 'Today, 2:45 PM • Houari Boumediene Airport',
    amountDzd: -1400,
  },
  {
    id: '2',
    type: 'credit',
    description: 'Funds Added',
    date: 'Yesterday, 9:00 AM • CIB Card',
    amountDzd: 3000,
  },
  {
    id: '3',
    type: 'debit',
    description: 'Evening ride',
    date: 'Oct 12, 8:30 PM • Hydra',
    amountDzd: -850,
  },
];

export const WalletScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('appName')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceGradient} />
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>{t('wallet.balance')}</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(MOCK_BALANCE_DZD)}</Text>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert(t('wallet.addFunds'), t('common.loading'))}>
                <Ionicons name="add" size={18} color={colors.surfaceContainerLowest} />
                <Text style={styles.addButtonText}>{t('wallet.addFunds')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.withdrawButton} onPress={() => Alert.alert(t('wallet.withdraw'), t('common.loading'))}>
                <Text style={styles.withdrawButtonText}>{t('wallet.withdraw')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('wallet.paymentMethods')}</Text>
          <View style={styles.paymentGrid}>
            {MOCK_PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentCard,
                  method.isDefault && styles.paymentCardDefault,
                ]}
                onPress={() => Alert.alert(method.name, method.isDefault ? t('wallet.default') : t('common.loading'))}
              >
                <View style={styles.paymentLeft}>
                  <View style={styles.paymentIconContainer}>
                    <Ionicons
                      name={method.type === 'card' ? 'card' : 'wallet'}
                      size={20}
                      color={method.isDefault ? colors.primary : colors.onSurface}
                    />
                  </View>
                  <View>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    {method.last4 && (
                      <Text style={styles.paymentLast4}>•••• {method.last4}</Text>
                    )}
                  </View>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>{t('wallet.default')}</Text>
                  </View>
                )}
                {!method.isDefault && (
                  <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addPaymentButton} onPress={() => Alert.alert(t('wallet.addNewMethod'), t('common.loading'))}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={styles.addPaymentText}>{t('wallet.addNewMethod')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('wallet.recentActivity')}</Text>
          {MOCK_TRANSACTIONS.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIconContainer}>
                <Ionicons
                  name={transaction.type === 'credit' ? 'arrow-down' : 'car'}
                  size={20}
                  color={transaction.type === 'credit' ? colors.primary : colors.onSurface}
                />
              </View>
              <View style={styles.transactionTextContainer}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.type === 'credit' && styles.creditAmount,
              ]}>
                {formatSignedCurrency(transaction.amountDzd)}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.viewAllButton} onPress={() => Alert.alert(t('activity.title'), t('common.loading'))}>
            <Text style={styles.viewAllText}>{t('wallet.viewAllActivity')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '700' as any,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
  },
  balanceCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    minHeight: 200,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  balanceGradient: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colors.primary + '1A',
  },
  balanceContent: {
    position: 'relative',
    zIndex: 1,
  },
  balanceLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 48,
    fontWeight: '500' as any,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '500' as any,
    color: colors.surfaceContainerLowest,
  },
  withdrawButton: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  withdrawButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 24,
    fontWeight: '500' as any,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  paymentGrid: {
    gap: spacing.md,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
  },
  paymentCardDefault: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  paymentIconContainer: {
    width: 48,
    height: 32,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentName: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  paymentLast4: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
  },
  defaultBadge: {
    backgroundColor: colors.primary + '1A',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.primary,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant + '4D',
    borderRadius: spacing.borderRadius.xl,
  },
  addPaymentText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.primary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionTextContainer: {
    flex: 1,
  },
  transactionDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  transactionDate: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  transactionAmount: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  creditAmount: {
    color: colors.primary,
  },
  viewAllButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '500' as any,
    color: colors.primary,
  },
});
