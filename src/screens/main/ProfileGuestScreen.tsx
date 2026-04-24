import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

const LOCKED_ITEMS = [
  { id: 'history', icon: 'time', title: 'Ride History', subtitle: 'View past journeys' },
  { id: 'wallet', icon: 'wallet', title: 'Payment Methods', subtitle: 'Manage cards and promos' },
  { id: 'saved', icon: 'heart', title: 'Saved Locations', subtitle: 'Home, work, and favorites' },
  { id: 'settings', icon: 'settings', title: 'Preferences', subtitle: 'Account settings' },
];

export const ProfileGuestScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Guest Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-outline" size={40} color={colors.onSurfaceVariant} />
          </View>
          <Text style={styles.heroTitle}>Unlock the full experience</Text>
          <Text style={styles.heroSubtitle}>
            Sign in to save your preferred routes, access exclusive premium fleets, and manage your payments seamlessly.
          </Text>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.95}
          >
            <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>

        {/* Locked Sections */}
        <View style={styles.lockedSection}>
          <Text style={styles.sectionTitle}>Your Dashboard</Text>
          {LOCKED_ITEMS.map((item) => (
            <View key={item.id} style={styles.lockedCard}>
              <View style={styles.lockedCardLeft}>
                <View style={styles.lockedIconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={colors.onSurfaceVariant} />
                </View>
                <View>
                  <Text style={styles.lockedCardTitle}>{item.title}</Text>
                  <Text style={styles.lockedCardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="lock-closed" size={20} color={colors.onSurfaceVariant} />
            </View>
          ))}
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
    fontSize: typography.fontSize.titleMedium,
    fontWeight: '700' as any,
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 24,
    fontWeight: '700' as any,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  signInButton: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    paddingVertical: spacing.lg,
    shadowColor: colors.onPrimaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 4,
  },
  signInButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '600' as any,
    color: colors.surface,
    marginRight: spacing.sm,
  },
  lockedSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.titleSmall,
    fontWeight: '600' as any,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
    opacity: 0.7,
  },
  lockedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  lockedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCardTitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  lockedCardSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
