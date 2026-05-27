import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/format';
import { walletAPI } from '../../services/api';

type Transaction = {
  id: string;
  amount_dzd: number;
  type: 'credit' | 'debit';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
};

export const WalletScreen: React.FC = () => {
  const { t } = useTranslation();

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topupVisible, setTopupVisible] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(20, 0),
      ]);
      setBalance(balRes.balance_dzd);
      setTransactions(txRes.transactions);
    } catch {
      Alert.alert(t('common.error'), t('wallet.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 100) {
      Alert.alert(t('common.error'), t('wallet.minAmount'));
      return;
    }
    setTopupLoading(true);
    try {
      const res = await walletAPI.createTopup(amount);
      setTopupVisible(false);
      setTopupAmount('');
      await Linking.openURL(res.checkout_url);
    } catch {
      Alert.alert(t('common.error'), t('wallet.topupError'));
    } finally {
      setTopupLoading(false);
    }
  };

  const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

  const txIcon = (tx: Transaction) => {
    if (tx.status === 'pending') return 'time-outline';
    if (tx.status === 'failed') return 'close-circle-outline';
    return tx.type === 'credit' ? 'arrow-down-circle-outline' : 'car-outline';
  };

  const txColor = (tx: Transaction) => {
    if (tx.status === 'pending') return colors.onSurfaceVariant;
    if (tx.status === 'failed') return colors.error;
    return tx.type === 'credit' ? colors.primary : colors.onSurface;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('appName')}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        >
          {/* Balance card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceGlow} />
            <Text style={styles.balanceLabel}>{t('wallet.balance')}</Text>
            <Text style={styles.balanceAmount}>
              {balance !== null ? formatCurrency(balance) : '—'}
            </Text>
            <TouchableOpacity style={styles.topupButton} onPress={() => setTopupVisible(true)}>
              <Ionicons name="add" size={18} color={colors.surfaceContainerLowest} />
              <Text style={styles.topupButtonText}>{t('wallet.addFunds')}</Text>
            </TouchableOpacity>
          </View>

          {/* Payment methods note */}
          <View style={styles.methodsRow}>
            <View style={styles.methodChip}>
              <Ionicons name="card-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.methodChipText}>EDAHABIA</Text>
            </View>
            <View style={styles.methodChip}>
              <Ionicons name="card-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.methodChipText}>CIB</Text>
            </View>
            <Text style={styles.poweredBy}>{t('wallet.poweredBy')}</Text>
          </View>

          {/* Transactions */}
          <Text style={styles.sectionTitle}>{t('wallet.recentActivity')}</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyTxns}>
              <Ionicons name="receipt-outline" size={40} color={colors.onSurfaceVariant} />
              <Text style={styles.emptyTxnsText}>{t('wallet.noTransactions')}</Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIconWrap, { backgroundColor: txColor(tx) + '22' }]}>
                  <Ionicons name={txIcon(tx) as any} size={20} color={txColor(tx)} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.created_at).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {tx.status === 'pending' && <Text style={styles.pendingBadge}>  {t('wallet.pending')}</Text>}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color: txColor(tx) }]}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount_dzd)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Top-up modal */}
      <Modal visible={topupVisible} transparent animationType="slide" onRequestClose={() => setTopupVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setTopupVisible(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{t('wallet.addFunds')}</Text>
          <Text style={styles.modalSubtitle}>{t('wallet.topupHint')}</Text>

          {/* Quick amounts */}
          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.quickChip, topupAmount === String(a) && styles.quickChipActive]}
                onPress={() => setTopupAmount(String(a))}
              >
                <Text style={[styles.quickChipText, topupAmount === String(a) && styles.quickChipTextActive]}>
                  {formatCurrency(a)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom amount */}
          <View style={styles.amountInputRow}>
            <TextInput
              style={styles.amountInput}
              placeholder={t('wallet.customAmount')}
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="numeric"
              value={topupAmount}
              onChangeText={setTopupAmount}
            />
            <Text style={styles.amountCurrency}>DZD</Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, topupLoading && { opacity: 0.6 }]}
            onPress={handleTopup}
            disabled={topupLoading}
          >
            {topupLoading
              ? <ActivityIndicator color={colors.surfaceContainerLowest} />
              : <Text style={styles.confirmButtonText}>{t('wallet.proceedToPayment')}</Text>
            }
          </TouchableOpacity>

          <View style={styles.chargilyBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.chargilyBadgeText}>{t('wallet.securedByChargily')}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.screenPadding, paddingVertical: spacing.md },
  headerTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '700' as any,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.primary,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: spacing.xxl },

  // Balance card
  balanceCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    minHeight: 180,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  balanceGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.primary + '18' },
  balanceLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 44,
    fontWeight: '500' as any,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  topupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topupButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '600' as any,
    color: colors.surfaceContainerLowest,
  },

  // Payment methods chips
  methodsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  methodChipText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: '600' as any,
  },
  poweredBy: {
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginLeft: 'auto',
    opacity: 0.6,
  },

  // Transactions
  sectionTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 20,
    fontWeight: '600' as any,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  emptyTxns: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  emptyTxnsText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurface,
    fontWeight: '500' as any,
  },
  txDate: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  pendingBadge: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  txAmount: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '600' as any,
  },

  // Modal sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: colors.surfaceContainerLow,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 22,
    fontWeight: '700' as any,
    color: colors.onSurface,
  },
  modalSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  quickChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '22',
  },
  quickChipText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurface,
    fontWeight: '500' as any,
  },
  quickChipTextActive: { color: colors.primary, fontWeight: '700' as any },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.titleMedium,
    color: colors.onSurface,
    paddingVertical: spacing.md,
  },
  amountCurrency: {
    fontFamily: typography.fontFamily.label,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontWeight: '600' as any,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  confirmButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '700' as any,
    color: colors.surfaceContainerLowest,
  },
  chargilyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    opacity: 0.6,
  },
  chargilyBadgeText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
});
