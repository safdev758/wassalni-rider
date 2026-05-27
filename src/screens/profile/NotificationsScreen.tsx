import React, { useState, useEffect, useCallback } from 'react';
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
import { notificationAPI } from '../../services/api';

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

const PREF_KEYS = ['rides', 'promos', 'safety'] as const;
type PrefKey = (typeof PREF_KEYS)[number];

const DEFAULT_PREFS: Record<PrefKey, boolean> = { rides: true, promos: true, safety: true };

export const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>(DEFAULT_PREFS);

  useEffect(() => {
    notificationAPI.getPreferences()
      .then((data: Record<PrefKey, boolean>) => setPrefs({ ...DEFAULT_PREFS, ...data }))
      .catch(() => {});
  }, []);

  const togglePref = useCallback(async (key: PrefKey) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await notificationAPI.updatePreferences(updated).catch(() => {});
  }, [prefs]);

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
        <Text style={styles.sectionTitle}>{t('notifications.preferences')}</Text>
        {PREF_KEYS.map((key) => (
          <View key={key} style={styles.notificationItem}>
            <View style={styles.notificationTextContainer}>
              <Text style={styles.notificationTitle}>{t(`notifications.${key}`)}</Text>
              <Text style={styles.notificationDescription}>{t(`notifications.${key}Desc`)}</Text>
            </View>
            <Switch
              value={prefs[key]}
              onValueChange={() => togglePref(key)}
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
              thumbColor={prefs[key] ? colors.onPrimary : colors.onSurfaceVariant}
            />
          </View>
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
