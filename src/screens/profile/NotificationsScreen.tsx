import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'ride' | 'promotion' | 'account';
  read: boolean;
}

export const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: 'Ride Updates', description: 'Get notified about your ride status', enabled: true },
    { id: '2', title: 'Promotions', description: 'Receive special offers and discounts', enabled: true },
    { id: '3', title: 'Messages', description: 'Driver and support messages', enabled: true },
    { id: '4', title: 'Account Activity', description: 'Security and account updates', enabled: true },
  ]);

  const [history, setHistory] = useState<NotificationHistory[]>([
    { id: '1', title: 'Ride Completed', message: 'Your ride to JFK Airport was completed', time: '2 hours ago', type: 'ride', read: true },
    { id: '2', title: 'Special Offer', message: 'Get 20% off your next ride with code WASSALNI20', time: 'Yesterday', type: 'promotion', read: false },
    { id: '3', title: 'Payment Successful', message: 'Your payment of 1,400 DA was processed', time: '2 days ago', type: 'account', read: true },
    { id: '4', title: 'Driver Arrived', message: 'Your driver has arrived at pickup location', time: '3 days ago', type: 'ride', read: true },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        {notifications.map((item) => (
          <View key={item.id} style={styles.notificationItem}>
            <View style={styles.notificationTextContainer}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationDescription}>{item.description}</Text>
            </View>
            <Switch
              value={item.enabled}
              onValueChange={() => toggleNotification(item.id)}
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
              thumbColor={item.enabled ? colors.onPrimary : colors.onSurfaceVariant}
            />
          </View>
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>Notification History</Text>
        {history.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.historyItem, !item.read && styles.historyItemUnread]}>
            <View style={styles.historyIconContainer}>
              <Ionicons
                name={
                  item.type === 'ride'
                    ? 'car'
                    : item.type === 'promotion'
                    ? 'pricetag'
                    : 'shield-checkmark'
                }
                size={20}
                color={item.read ? colors.onSurfaceVariant : colors.primary}
              />
            </View>
            <View style={styles.historyTextContainer}>
              <Text style={[styles.historyTitle, !item.read && styles.historyTitleUnread]}>{item.title}</Text>
              <Text style={styles.historyMessage}>{item.message}</Text>
              <Text style={styles.historyTime}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 18,
    fontWeight: '600' as any,
    color: colors.onSurface,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 100,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 16,
    fontWeight: '500' as any,
    color: colors.onSurface,
    marginBottom: 4,
  },
  notificationDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  sectionTitleMargin: {
    marginTop: spacing.xl,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyItemUnread: {
    backgroundColor: colors.primary + '0D',
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  historyTextContainer: {
    flex: 1,
  },
  historyTitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    fontWeight: '500' as any,
    color: colors.onSurface,
    marginBottom: 2,
  },
  historyTitleUnread: {
    color: colors.primary,
  },
  historyMessage: {
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  historyTime: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
