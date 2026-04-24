import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

export const TermsOfServiceScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('termsOfService.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>{t('termsOfService.title')}</Text>
        <Text style={styles.sectionText}>
          {t('termsOfService.lastUpdated')}
        </Text>
        <Text style={styles.contentText}>
          {t('termsOfService.intro')}
        </Text>

        <Text style={styles.sectionTitle}>1. {t('termsOfService.acceptance')}</Text>
        <Text style={styles.contentText}>
          {t('termsOfService.acceptanceText')}
        </Text>

        <Text style={styles.sectionTitle}>2. {t('termsOfService.userResponsibilities')}</Text>
        <Text style={styles.contentText}>
          {t('termsOfService.responsibilityText')}
        </Text>

        <Text style={styles.sectionTitle}>3. {t('termsOfService.paymentTerms')}</Text>
        <Text style={styles.contentText}>
          {t('termsOfService.paymentText')}
        </Text>

        <Text style={styles.sectionTitle}>4. {t('termsOfService.cancellation')}</Text>
        <Text style={styles.contentText}>
          {t('termsOfService.cancellationText')}
        </Text>
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
  sectionTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 18,
    fontWeight: '600' as any,
    color: colors.onSurface,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  contentText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 15,
    color: colors.onSurface,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});
