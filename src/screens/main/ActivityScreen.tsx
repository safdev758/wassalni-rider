import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/format';
import { rideAPI } from '../../services/api';

export const ActivityScreen: React.FC = () => {
  const { t } = useTranslation();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await rideAPI.history(20, 0);
      setRides(res?.rides ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('activity.title')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} size="large" />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity onPress={() => load()} style={styles.retryButton}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color={colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>{t('activity.noTripsYet')}</Text>
            </View>
          }
          renderItem={({ item: activity }) => (
            <View style={[styles.activityCard, activity.status === 'cancelled' && styles.activityCardCanceled]}>
              <View style={styles.activityTop}>
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Text style={styles.activityDate}>{new Date(activity.created_at).toLocaleString()}</Text>
                  <Text style={styles.activityDestination} numberOfLines={1}>{activity.dropoff_address}</Text>
                  <Text style={styles.activityAddress} numberOfLines={1}>{activity.pickup_address}</Text>
                </View>
                <View style={styles.activityPrice}>
                  <Text style={styles.priceText}>{formatCurrency(activity.final_price ?? activity.rider_price ?? 0)}</Text>
                  <View style={[styles.statusBadge, activity.status === 'completed' ? styles.statusCompleted : styles.statusCanceled]}>
                    <Ionicons
                      name={activity.status === 'completed' ? 'checkmark' : 'close'}
                      size={12}
                      color={activity.status === 'completed' ? colors.primary : colors.error}
                    />
                    <Text style={[styles.statusText, activity.status === 'completed' ? styles.statusTextCompleted : styles.statusTextCanceled]}>
                      {activity.status === 'completed' ? t('ride.tripCompleted') : t('common.cancel')}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.vehicleInfo}>
                <View style={styles.vehicleIconContainer}>
                  <Ionicons name="car" size={20} color={activity.status === 'completed' ? colors.onSurface : colors.onSurfaceVariant} />
                </View>
                <View style={styles.vehicleTextContainer}>
                  <Text style={[styles.vehicleName, activity.status === 'cancelled' && styles.vehicleNameCanceled]}>
                    {activity.vehicle_type ?? '—'}
                  </Text>
                  <Text style={[styles.carType, activity.status === 'cancelled' && styles.carTypeCanceled]}>
                    {activity.driver_name ?? '—'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
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
    fontSize: 28,
    fontWeight: '700' as any,
    color: colors.onSurface,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
  },
  activityCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  activityCardCanceled: {
    opacity: 0.75,
  },
  activityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  activityDate: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  activityDestination: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 20,
    fontWeight: '600' as any,
    color: colors.onSurface,
  },
  activityAddress: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  activityPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 20,
    fontWeight: '600' as any,
    color: colors.onSurface,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: 4,
  },
  statusCompleted: {
    backgroundColor: colors.primary + '1A',
  },
  statusCanceled: {
    backgroundColor: colors.error + '1A',
  },
  statusText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500' as any,
  },
  statusTextCompleted: {
    color: colors.primary,
  },
  statusTextCanceled: {
    color: colors.error,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  vehicleTextContainer: {
    flex: 1,
  },
  vehicleName: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  vehicleNameCanceled: {
    color: colors.onSurfaceVariant,
  },
  carType: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  carTypeCanceled: {
    color: colors.onSurfaceVariant,
  },
  receiptText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '500' as any,
    color: colors.primary,
  },
  loadMoreButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loadMoreButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '500' as any,
    color: colors.onSurfaceVariant,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
  },
  retryText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '600' as any,
    color: colors.surface,
  },
});
