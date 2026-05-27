import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatAlgerianE164Display } from '../../utils/phone';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

const OTP_LENGTH = 6;

export const OtpVerificationScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const { phoneNumber } = route.params;
  const { verifyOTP, sendOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length <= OTP_LENGTH) {
      setOtp(cleaned);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) return;
    setIsLoading(true);
    try {
      await verifyOTP(phoneNumber, otp);
      navigation.navigate('Main');
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    try {
      await sendOTP(phoneNumber);
    } catch (error) {
      console.error('Resend OTP failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('auth.otpVerification')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.enterOtp')}
          </Text>
          <Text style={styles.phoneNumber}>
            {formatAlgerianE164Display(phoneNumber)}
          </Text>
        </View>

        {/* OTP Card */}
        <Card variant="high" style={styles.otpCard}>
          {/* Hidden Input */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus
          />

          {/* OTP Boxes */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.otpContainer}
          >
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  otp.length === index && styles.otpBoxActive,
                  otp.length > index && styles.otpBoxFilled,
                ]}
              >
                <Text style={styles.otpText}>
                  {otp[index] ? '•' : ''}
                </Text>
              </View>
            ))}
          </TouchableOpacity>

          <Button
            title={t('auth.verify')}
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.length !== OTP_LENGTH}
            size="large"
            style={styles.verifyButton}
          />
        </Card>

        {/* Resend */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>{t('auth.didntReceiveCode')}</Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>
              {t('common.retry')} in {timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>{t('auth.resendCode')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    padding: spacing.screenPadding,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  backIcon: {
    fontSize: 24,
    color: colors.onSurface,
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.headlineLarge,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyLarge,
    color: colors.onSurfaceVariant,
  },
  phoneNumber: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyLarge,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold as any,
    marginTop: spacing.xs,
  },
  otpCard: {
    padding: spacing.xl,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  otpBoxActive: {
    borderColor: colors.primary,
  },
  otpBoxFilled: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  otpText: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.headlineSmall,
    color: colors.onSurface,
    fontWeight: typography.fontWeight.bold as any,
  },
  verifyButton: {
    marginTop: spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  resendText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  timerText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.xs,
  },
  resendLink: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium as any,
    marginLeft: spacing.xs,
  },
});
