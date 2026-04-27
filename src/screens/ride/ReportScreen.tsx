import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { useRide } from '../../context/RideContext';
import { reportAPI } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const REPORT_CATEGORIES = [
  { id: 'safety', icon: 'shield', label: 'Safety Issue' },
  { id: 'behavior', icon: 'person', label: 'Driver Behavior' },
  { id: 'vehicle_condition', icon: 'car', label: 'Vehicle Condition' },
  { id: 'payment', icon: 'card', label: 'Payment Issue' },
  { id: 'app_issue', icon: 'phone-portrait', label: 'App Issue' },
];

export const ReportScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { rideId, driver } = useRide();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory || !description.trim()) {
      Alert.alert(t('common.error'), t('report.fillRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await reportAPI.create({
        subject_type: 'driver',
        subject_id: driver?.id || '',
        ride_id: rideId || undefined,
        category: selectedCategory,
        description: description.trim(),
      });
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
        <Text style={styles.sectionTitle}>{t('report.selectCategory')}</Text>
        <View style={styles.categoriesGrid}>
          {REPORT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, selectedCategory === cat.id && styles.categoryCardSelected]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons name={cat.icon as never} size={24} color={selectedCategory === cat.id ? colors.primary : colors.onSurfaceVariant} />
              <Text style={[styles.categoryLabel, selectedCategory === cat.id && styles.categoryLabelSelected]}>
                {cat.label}
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
          placeholder={t('report.describePlaceholder')}
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
});
