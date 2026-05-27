import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  formatAlgerianLocalDisplay,
  isValidAlgerianLocal,
  normalizeAlgerianLocalInput,
  toAlgerianE164,
} from '../../utils/phone';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim() || !phoneNumber.trim() || !gender) {
      return;
    }
    if (!isValidAlgerianLocal(phoneNumber)) {
      Alert.alert(t('common.error'), t('auth.invalidPhoneLocal'));
      return;
    }
    const formatted = toAlgerianE164(phoneNumber);
    setIsLoading(true);
    try {
      await signup(fullName.trim(), formatted, gender);
      navigation.navigate('OtpVerification', { phoneNumber: formatted });
    } catch {
      // OTP send errors surface on verification retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('auth.signUp')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <Card variant="low" style={styles.formCard}>
          <Input
            label={t('auth.fullName')}
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
          />

          <Input
            label={t('auth.phoneNumber')}
            prefix="+213"
            placeholder={t('auth.phoneLocalPlaceholder')}
            value={formatAlgerianLocalDisplay(phoneNumber)}
            onChangeText={(text) => setPhoneNumber(normalizeAlgerianLocalInput(text))}
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={11}
          />

          <Text style={styles.genderLabel}>{t('auth.gender')}</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.genderBtnText, gender === 'female' && styles.genderBtnTextActive]}>
                {t('auth.genderFemale')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.genderBtnText, gender === 'male' && styles.genderBtnTextActive]}>
                {t('auth.genderMale')}
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label={t('auth.email')}
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            leftIcon="mail-outline"
          />

          <Input
            label={t('auth.password')}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={t('auth.signUp')}
            onPress={handleSignup}
            loading={isLoading}
            size="large"
            style={styles.signupButton}
          />
        </Card>

        {/* Login link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>{t('auth.alreadyHaveAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>{t('auth.login')}</Text>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.onSurface,
  },
  title: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.headlineMedium,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.onSurface,
  },
  placeholder: {
    width: 48,
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  genderLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
  },
  genderBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  genderBtnText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  genderBtnTextActive: {
    color: colors.onPrimaryContainer,
    fontWeight: '600' as never,
  },
  signupButton: {
    marginTop: spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  loginLink: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium as any,
    marginLeft: spacing.xs,
  },
});
