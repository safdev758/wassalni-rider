import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export const ProfileScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { user, logout } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const menuItems: MenuItem[] = [
    { icon: 'person-outline', title: t('profile.editProfile'), onPress: () => navigation.navigate('EditProfile') },
    { icon: 'notifications-outline', title: t('profile.notifications'), onPress: () => navigation.navigate('Notifications') },
    { icon: 'language-outline', title: t('profile.language'), subtitle: i18n.language === 'ar' ? t('profile.arabic') : t('profile.english'), onPress: () => setShowLanguageModal(true) },
    { icon: 'shield-outline', title: t('profile.privacyPolicy'), onPress: () => navigation.navigate('PrivacyPolicy') },
    { icon: 'document-text-outline', title: t('profile.termsOfService'), onPress: () => navigation.navigate('TermsOfService') },
    { icon: 'help-circle-outline', title: t('profile.help'), onPress: () => navigation.navigate('Help') },
  ];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleLogout = () => {
    logout();
    navigation.navigate('Main');
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>

        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.9}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={colors.onSurface} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.phone}>{user.phone}</Text>
            <Text style={styles.stats}>{user.totalRides} rides</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={22} color={colors.onSurface} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'en' && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[
                styles.languageText,
                i18n.language === 'en' && styles.languageTextActive,
              ]}>English</Text>
              {i18n.language === 'en' && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'ar' && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageChange('ar')}
            >
              <Text style={[
                styles.languageText,
                i18n.language === 'ar' && styles.languageTextActive,
              ]}>العربية</Text>
              {i18n.language === 'ar' && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 100,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.headlineMedium,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.titleMedium,
    fontWeight: typography.fontWeight.semiBold as any,
    color: colors.onSurface,
  },
  phone: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  stats: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.primary,
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xxl,
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '20',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.onSurface,
  },
  menuSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xxl,
    padding: spacing.md,
  },
  logoutText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.error,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 18,
    fontWeight: '600' as any,
    color: colors.onSurface,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  languageOptionActive: {
    backgroundColor: colors.primary + '1A',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  languageText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 16,
    color: colors.onSurface,
  },
  languageTextActive: {
    color: colors.primary,
    fontWeight: '600' as any,
  },
  modalCloseButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600' as any,
  },
});
