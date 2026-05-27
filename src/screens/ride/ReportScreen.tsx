import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { safetyAPI } from '../../services/api';
import { getGpsTrace } from '../../services/rideGpsTrace';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const REPORT_CATEGORY_IDS = [
  { id: 'verbal_abuse', icon: 'megaphone' },
  { id: 'physical_threat', icon: 'alert-circle' },
  { id: 'unsafe_driving', icon: 'car' },
  { id: 'wrong_route', icon: 'navigate' },
  { id: 'harassment', icon: 'warning' },
  { id: 'other', icon: 'ellipsis-horizontal' },
] as const;

export const ReportScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Report'>>();
  const { rideId, driver } = useRide();
  const pendingEvidenceId = route.params?.pendingEvidenceId;
  const initialReason = route.params?.reasonCode ?? '';
  const [selectedCategory, setSelectedCategory] = useState(initialReason);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert(t('common.error'), t('report.fillRequired'));
      return;
    }
    if (!pendingEvidenceId && !description.trim()) {
      Alert.alert(t('common.error'), t('report.fillRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const notes = description.trim() || (pendingEvidenceId ? t('report.confirmedMlNote') : '');
      await safetyAPI.reportButton(
        rideId || '',
        selectedCategory,
        notes,
        getGpsTrace(),
        pendingEvidenceId,
      );
      Alert.alert(t('report.submitted'), t('report.thankYou'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), t('report.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('report.title')}</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {pendingEvidenceId ? (
          <View style={styles.evidenceBanner}>
            <Ionicons name="mic" size={20} color={colors.primary} />
            <Text style={styles.evidenceBannerText}>{t('report.audioEvidenceAttached')}</Text>
          </View>
        ) : null}
        {driver ? (
          <Text style={styles.driverHint}>
            {t('report.driverOnTrip', { name: driver.name, plate: driver.plate })}
          </Text>
        ) : null}
        <Text style={styles.sectionTitle}>{t('report.selectCategory')}</Text>
        <View style={styles.categoriesGrid}>
          {REPORT_CATEGORY_IDS.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, selectedCategory === cat.id && styles.categoryCardSelected]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons name={cat.icon as never} size={24} color={selectedCategory === cat.id ? colors.primary : colors.onSurfaceVariant} />
              <Text style={[styles.categoryLabel, selectedCategory === cat.id && styles.categoryLabelSelected]}>
                {t(`report.categories.${cat.id}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('report.description')}</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder={t('report.descriptionPlaceholder')}
          placeholderTextColor={colors.onSurfaceVariant}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? t('common.submitting') : t('report.submit')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding, paddingVertical: spacing.md,
  },
  backButton: {
    width: 48, height: 48, borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.headline, fontSize: typography.fontSize.titleLarge,
    fontWeight: '600' as never, color: colors.onSurface,
  },
  content: { padding: spacing.screenPadding },
  sectionTitle: {
    fontFamily: typography.fontFamily.headline, fontSize: typography.fontSize.bodyLarge,
    fontWeight: '600' as never, color: colors.onSurface, marginBottom: spacing.md, marginTop: spacing.lg,
  },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryCard: {
    width: '48%', flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow, borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
  },
  categoryCardSelected: { backgroundColor: colors.primary + '1A' },
  categoryLabel: {
    fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant, flex: 1,
  },
  categoryLabelSelected: { color: colors.primary, fontWeight: '600' as never },
  textArea: {
    backgroundColor: colors.surfaceContainerLow, borderRadius: spacing.borderRadius.xl,
    padding: spacing.md, minHeight: 120,
    fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurface,
  },
  submitButton: {
    backgroundColor: colors.primary, borderRadius: spacing.borderRadius.full,
    padding: spacing.md, alignItems: 'center', marginTop: spacing.xl,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: {
    fontFamily: typography.fontFamily.headline, fontSize: typography.fontSize.bodyLarge,
    fontWeight: '600' as never, color: colors.surface,
  },
  evidenceBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary + '14', borderRadius: spacing.borderRadius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  evidenceBannerText: {
    flex: 1,
    fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodySmall,
    color: colors.onSurface, fontWeight: '600' as never,
  },
  driverHint: {
    fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant, marginBottom: spacing.sm,
  },
});
