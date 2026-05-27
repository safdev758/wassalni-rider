import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const SkeletonCard: React.FC = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.line, styles.lineTitle, { opacity }]} />
            <Animated.View style={[styles.line, styles.lineSubtitle, { opacity }]} />
            <Animated.View style={[styles.line, styles.lineContent, { opacity }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surfaceContainerLow,
        padding: spacing.lg,
        borderRadius: spacing.borderRadius.xl,
        marginBottom: spacing.md,
    },
    line: {
        backgroundColor: colors.surfaceContainerHighest,
        borderRadius: 8,
        marginBottom: spacing.sm,
    },
    lineTitle: {
        height: 24,
        width: '60%',
    },
    lineSubtitle: {
        height: 16,
        width: '40%',
    },
    lineContent: {
        height: 48,
        width: '100%',
    },
});
