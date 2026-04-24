import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const MOCK_ACTIVITIES = [
  {
    id: '1',
    date: 'Oct 24, 2023 • 9:42 PM',
    destination: 'The Ritz-Carlton',
    address: '10 Avenue des Arts',
    price: '$142.50',
    vehicle: 'Wessalni Plus',
    carType: 'Mercedes-Benz S-Class',
    status: 'completed',
  },
  {
    id: '2',
    date: 'Oct 22, 2023 • 2:15 PM',
    destination: 'International Airport',
    address: 'Terminal 1 Arrivals',
    price: '$215.00',
    vehicle: 'Wessalni XL',
    carType: 'Cadillac Escalade',
    status: 'completed',
  },
  {
    id: '3',
    date: 'Oct 18, 2023 • 7:30 AM',
    destination: 'Financial District',
    address: '450 Montgomery St',
    price: '$0.00',
    vehicle: 'Wessalni Plus',
    carType: 'Audi A8',
    status: 'canceled',
  },
];

export const ActivityScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {MOCK_ACTIVITIES.map((activity) => (
          <View key={activity.id} style={[styles.activityCard, activity.status === 'canceled' && styles.activityCardCanceled]}>
            <View style={styles.activityTop}>
              <View>
                <Text style={styles.activityDate}>{activity.date}</Text>
                <Text style={styles.activityDestination}>{activity.destination}</Text>
                <Text style={styles.activityAddress}>{activity.address}</Text>
              </View>
              <View style={styles.activityPrice}>
                <Text style={styles.priceText}>{activity.price}</Text>
                <View style={[
                  styles.statusBadge,
                  activity.status === 'completed' ? styles.statusCompleted : styles.statusCanceled,
                ]}>
                  <Ionicons
                    name={activity.status === 'completed' ? 'checkmark' : 'close'}
                    size={12}
                    color={activity.status === 'completed' ? colors.primary : colors.error}
                  />
                  <Text style={[
                    styles.statusText,
                    activity.status === 'completed' ? styles.statusTextCompleted : styles.statusTextCanceled,
                  ]}>
                    {activity.status === 'completed' ? 'Completed' : 'Canceled'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleIconContainer}>
                <Ionicons
                  name="car"
                  size={20}
                  color={activity.status === 'completed' ? colors.onSurface : colors.onSurfaceVariant}
                />
              </View>
              <View style={styles.vehicleTextContainer}>
                <Text style={[
                  styles.vehicleName,
                  activity.status === 'canceled' && styles.vehicleNameCanceled,
                ]}>
                  {activity.vehicle}
                </Text>
                <Text style={[
                  styles.carType,
                  activity.status === 'canceled' && styles.carTypeCanceled,
                ]}>
                  {activity.carType}
                </Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Receipt', 'Receipt details coming soon.')}>
                <Text style={styles.receiptText}>Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.loadMoreButton} onPress={() => Alert.alert('Activity', 'More ride history coming soon.')}>
          <Text style={styles.loadMoreButtonText}>Load More Activity</Text>
        </TouchableOpacity>
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
});
