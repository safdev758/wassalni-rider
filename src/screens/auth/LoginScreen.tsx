import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(phoneNumber);
      navigation.navigate('Main');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subtle glow orb */}
          <View style={styles.glowOrb} />

          {/* Brand */}
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>WESSALNI</Text>
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.heroTitle}>
              Welcome Back
            </Text>
            <Text style={styles.heroSubtitle}>
              Enter your credentials to continue your journey.
            </Text>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCodeText}>DZ +213</Text>
              </View>
              <View style={styles.phoneInputWrapper}>
                <Ionicons
                  name="call"
                  size={20}
                  color={colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={colors.onSurfaceVariant + '80'}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
                <View style={styles.focusLine} />
              </View>
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'A password reset link will be sent to your phone number.')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputWrapper}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={colors.onSurfaceVariant}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={colors.onSurfaceVariant + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
              <View style={styles.focusLine} />
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.95}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? '...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Logins */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Apple Sign In', 'Apple Sign In is not available yet.')}>
              <Ionicons name="logo-apple" size={20} color={colors.onSurface} />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Google Sign In', 'Google Sign In is not available yet.')}>
              <Ionicons name="logo-google" size={20} color={colors.onSurface} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New to Wessalni?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.screenPadding,
    paddingTop: spacing.xxl,
  },
  glowOrb: {
    position: 'absolute',
    top: '-20%',
    right: '-20%',
    width: '60%',
    height: '60%',
    borderRadius: 9999,
    backgroundColor: colors.primary + '0D',
    opacity: 0.5,
  },
  brandSection: {
    marginBottom: spacing.xxl,
  },
  brandName: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 36,
    fontWeight: '800' as any,
    letterSpacing: -1,
    color: colors.onSurface,
  },
  headerSection: {
    marginBottom: spacing.xxl,
  },
  heroTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 32,
    fontWeight: '700' as any,
    color: colors.onSurface,
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: typography.fontSize.labelMedium,
    fontWeight: '500' as any,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.xs,
    marginBottom: spacing.sm,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countryCodeContainer: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  countryCodeText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurface,
  },
  phoneInputWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.md,
    top: '50%',
    marginTop: -10,
  },
  phoneInput: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurface,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xl + spacing.md,
    paddingRight: spacing.md,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: spacing.xs,
    marginBottom: spacing.sm,
  },
  forgotPasswordText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.primary,
  },
  passwordInputWrapper: {
    position: 'relative',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  passwordInput: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurface,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xl + spacing.md,
    paddingRight: spacing.xl + spacing.md,
  },
  visibilityToggle: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    marginTop: -10,
  },
  focusLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    transform: [{ scaleX: 0 }],
    transformOrigin: 'left',
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
    marginTop: spacing.xl,
  },
  continueButtonText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: 16,
    fontWeight: '600' as any,
    color: colors.onPrimaryContainer,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant + '4D',
  },
  dividerText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    color: colors.onSurfaceVariant,
    paddingHorizontal: spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: spacing.borderRadius.lg,
    paddingVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  socialButtonText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  signupText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  signupLink: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.primary,
    fontWeight: '600' as any,
    marginLeft: spacing.xs,
  },
});
