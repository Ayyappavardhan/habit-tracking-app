/**
 * StreakCard Component
 * Displays streak statistics with icon and value
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StreakCardProps {
    type: 'current' | 'best';
    value: number;
}

export default function StreakCard({ type, value }: StreakCardProps) {
    const { colors, isDark } = useTheme();
    const icon = type === 'current' ? '🔥' : '🏆';
    const label = type === 'current' ? 'CURRENT STREAK' : 'BEST STREAK';
    const description = type === 'current'
        ? 'Days in a row'
        : 'Your record';
    // Adjust icon background for theme
    const iconBgColor = isDark
        ? (type === 'current' ? '#3D2000' : '#2D2D00')
        : (type === 'current' ? '#FFF3E0' : '#FFF8E1');

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                <Text style={styles.icon}>{icon}</Text>
            </View>
            <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    icon: {
        fontSize: 20,
    },
    value: {
        fontSize: 36,
        fontWeight: '700',
        lineHeight: 42,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginTop: Spacing.xs,
    },
    description: {
        fontSize: 10,
        marginTop: 2,
    },
});
