import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  titleKey: string;
  children: React.ReactNode;
};

export function AuthRequiredTab({ titleKey, children }: Props) {
  const { t } = useTranslation();
  const { isGuest } = useAuth();
  const navigation = useNavigation<Nav>();

  if (!isGuest) {
    return <>{children}</>;
  }

  return (
    <View style={styles.guestWrap}>
      <Ionicons name="lock-closed-outline" size={48} color={colors.onSurfaceVariant} />
      <Text style={styles.guestTitle}>{t(titleKey)}</Text>
      <Text style={styles.guestHint}>{t('auth.signInToAccess')}</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.btnText}>{t('auth.signIn')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  guestWrap: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  guestTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  guestHint: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  btnText: {
    ...typography.titleMedium,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
