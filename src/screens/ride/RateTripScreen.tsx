import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const COMPLIMENTS = [
  { id: 'clean', icon: 'cleaning-services', label: 'Spotless Car' },
  { id: 'route', icon: 'route', label: 'Expert Navigation' },
  { id: 'chat', icon: 'chat', label: 'Great Chat' },
  { id: 'music', icon: 'musical-notes', label: 'Awesome Music' },
];

const TIP_OPTIONS = ['$5', '$10', '$15', 'Custom'];

export const RateTripScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { driver, submitRating, resetRide } = useRide();
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState('$10');
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const handleStarPress = (star: number) => {
    setRating(star);
  };

  const handleComplimentToggle = (id: string) => {
    setSelectedCompliments(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    submitRating(rating, parseInt(selectedTip.replace('$', '')) || 0, selectedCompliments);
    resetRide();
    navigation.navigate('Main');
  };

  if (!driver) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            resetRide();
            navigation.navigate('Main');
          }}
        >
          <Ionicons name="close" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>WESSALNI</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Driver info */}
        <View style={styles.driverSection}>
          <View style={styles.driverAvatarContainer}>
            <Ionicons name="person" size={40} color={colors.onSurface} />
            <View style={styles.driverRatingBadge}>
              <Text style={styles.driverRatingText}>4.98</Text>
              <Ionicons name="star" size={14} color={colors.primary} />
            </View>
          </View>
          <Text style={styles.driverTitle}>How was your ride with {driver.name}?</Text>
          <Text style={styles.driverSubtitle}>Black SUV • Wessalni Plus</Text>
        </View>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => handleStarPress(star)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? colors.primary : colors.surfaceVariant}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Compliments */}
        <View style={styles.complimentsSection}>
          <Text style={styles.sectionTitle}>Select Compliments</Text>
          <View style={styles.complimentsGrid}>
            {COMPLIMENTS.map(comp => (
              <TouchableOpacity
                key={comp.id}
                style={[
                  styles.complimentCard,
                  selectedCompliments.includes(comp.id) && styles.complimentCardSelected,
                ]}
                onPress={() => handleComplimentToggle(comp.id)}
                activeOpacity={0.9}
              >
                <Ionicons
                  name={comp.icon as any}
                  size={28}
                  color={selectedCompliments.includes(comp.id) ? colors.primary : colors.onSurfaceVariant}
                />
                <Text style={[
                  styles.complimentLabel,
                  selectedCompliments.includes(comp.id) && styles.complimentLabelSelected,
                ]}>
                  {comp.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tipping */}
        <View style={styles.tipSection}>
          <Text style={styles.sectionTitle}>Add a Tip for {driver.name}</Text>
          <View style={styles.tipGrid}>
            {TIP_OPTIONS.map(tip => (
              <TouchableOpacity
                key={tip}
                style={[
                  styles.tipButton,
                  selectedTip === tip && styles.tipButtonSelected,
                  tip === 'Custom' && styles.tipButtonCustom,
                ]}
                onPress={() => setSelectedTip(tip)}
                activeOpacity={0.9}
              >
                <Text style={[
                  styles.tipButtonText,
                  selectedTip === tip && styles.tipButtonTextSelected,
                  tip === 'Custom' && styles.tipButtonTextCustom,
                ]}>
                  {tip}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.noteInputContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Leave a note (optional)"
              placeholderTextColor={colors.onSurfaceVariant}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit button */}
      <View style={styles.bottomCard}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.95}
        >
          <Text style={styles.submitButtonText}>Submit Rating</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.titleMedium,
    fontWeight: '800' as any,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 140,
  },
  driverSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  driverAvatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  driverRatingBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -32 }],
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  driverRatingText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: '700' as any,
    color: colors.onSurface,
  },
  driverTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 28,
    fontWeight: '700' as any,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  driverSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  complimentsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '600' as any,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  complimentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  complimentCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '48%',
    aspectRatio: 1,
  },
  complimentCardSelected: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  complimentLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  complimentLabelSelected: {
    color: colors.onSurface,
  },
  tipSection: {
    marginBottom: spacing.xl,
  },
  tipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tipButton: {
    flex: 1,
    minWidth: 80,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tipButtonSelected: {
    backgroundColor: colors.primary,
  },
  tipButtonCustom: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  tipButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  tipButtonTextSelected: {
    color: colors.surface,
    fontWeight: '700' as any,
  },
  tipButtonTextCustom: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
  },
  noteInputContainer: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
    minHeight: 56,
  },
  noteInput: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurface,
    minHeight: 40,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.onPrimaryContainer,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 4,
  },
  submitButtonText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: '700' as any,
    color: colors.surface,
  },
});
