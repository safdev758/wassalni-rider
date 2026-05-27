import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    message = 'Please try again',
    onRetry,
    retryLabel = 'Retry',
}) => {
    return (
        <View style={styles.container}>
            <Ionicons name="alert-circle" size={64} color={colors.error} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={onRetry}
                    accessibilityRole="button"
                    accessibilityLabel={retryLabel}
                >
                    <Ionicons name="refresh" size={20} color={colors.onPrimaryContainer} />
                    <Text style={styles.retryText}>{retryLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.surface,
    },
    title: {
        fontSize: 24,
        color: colors.onSurface,
        fontWeight: '700',
        marginTop: spacing.lg,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: colors.onSurfaceVariant,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.borderRadius.lg,
        marginTop: spacing.xl,
    },
    retryText: {
        fontSize: 14,
        color: colors.onPrimaryContainer,
        fontWeight: '700',
    },
});
