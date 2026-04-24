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

const MOCK_BALANCE = 4250;
const MOCK_PAYMENT_METHODS = [
  { id: '1', type: 'card', name: 'Black Card', last4: '4921', isDefault: true },
  { id: '2', type: 'wallet', name: 'Apple Pay', isDefault: false },
];
const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'debit',
    description: 'S-Class Transfer',
    date: 'Today, 2:45 PM • JFK Airport',
    amount: '-$145.00',
  },
  {
    id: '2',
    type: 'credit',
    description: 'Funds Added',
    date: 'Yesterday, 9:00 AM • Black Card',
    amount: '+$500.00',
  },
  {
    id: '3',
    type: 'debit',
    description: 'Phantom Evening',
    date: 'Oct 12, 8:30 PM • Midtown',
    amount: '-$320.00',
  },
];

export const WalletScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WESSALNI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceGradient} />
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceAmount}>${MOCK_BALANCE.toLocaleString()}.00</Text>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Add Funds', 'Add funds feature coming soon.')}>
                <Ionicons name="add" size={18} color={colors.surfaceContainerLowest} />
                <Text style={styles.addButtonText}>Add Funds</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.withdrawButton} onPress={() => Alert.alert('Withdraw', 'Withdraw feature coming soon.')}>
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentGrid}>
            {MOCK_PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentCard,
                  method.isDefault && styles.paymentCardDefault,
                ]}
                onPress={() => Alert.alert(method.name, method.isDefault ? 'This is your default payment method.' : 'Payment method details coming soon.')}
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
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
                {!method.isDefault && (
                  <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addPaymentButton} onPress={() => Alert.alert('Add Payment', 'Add payment method feature coming soon.')}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={styles.addPaymentText}>Add New Method</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
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
                {transaction.amount}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.viewAllButton} onPress={() => Alert.alert('Activity', 'Full activity history coming soon.')}>
            <Text style={styles.viewAllText}>View All Activity</Text>
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
