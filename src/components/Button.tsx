import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    onPress: () => void;
    children: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    accessibilityLabel?: string;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    onPress,
    children,
    icon,
    iconPosition = 'right',
    disabled = false,
    loading = false,
    fullWidth = false,
    accessibilityLabel,
    style,
}) => {
    const buttonStyles: ViewStyle[] = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
    ].filter(Boolean) as ViewStyle[];

    const textStyles: TextStyle[] = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
    ].filter(Boolean) as TextStyle[];

    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    const iconColor = variant === 'primary' ? colors.onPrimaryContainer : colors.onSurface;

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || children}
            accessibilityState={{ disabled: disabled || loading }}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator size="small" color={iconColor} />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconLeft} />
                    )}
                    <Text style={textStyles}>{children}</Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconRight} />
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: spacing.borderRadius.lg,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.surfaceContainerHigh,
    },
    tertiary: {
        backgroundColor: colors.tertiary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.outline,
    },
    size_small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    size_medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    size_large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
    text_primary: {
        color: colors.onPrimaryContainer,
    },
    text_secondary: {
        color: colors.onSurface,
    },
    text_tertiary: {
        color: colors.onPrimaryContainer,
    },
    text_outline: {
        color: colors.onSurface,
    },
    text_small: {
        fontSize: 14,
    },
    text_medium: {
        fontSize: 16,
    },
    text_large: {
        fontSize: 18,
    },
    iconLeft: {
        marginRight: spacing.sm,
    },
    iconRight: {
        marginLeft: spacing.sm,
    },
});
