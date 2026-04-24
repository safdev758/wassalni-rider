import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'low' | 'high' | 'highest';
  glassmorphism?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'high',
  glassmorphism = false,
}) => {
  const backgroundColors = {
    low: colors.surfaceContainerLow,
    high: colors.surfaceContainerHigh,
    highest: colors.surfaceContainerHighest,
  };

  const cardStyles = [
    styles.base,
    { backgroundColor: backgroundColors[variant] },
    glassmorphism && styles.glassmorphism,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={cardStyles}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.cardPadding,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  glassmorphism: {
    backgroundColor: colors.surfaceContainerHigh + 'D9', // 85% opacity
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
  },
});
