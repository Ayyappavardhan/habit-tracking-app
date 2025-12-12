/**
 * TotalStatsRow Component
 * Quick stats overview showing key metrics
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatItemProps {
    value: string | number;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBgColor: string;
}

function StatItem({ value, label, iconName, iconColor, iconBgColor }: StatItemProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                <Ionicons name={iconName} size={16} color={iconColor} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    );
}

interface TotalStatsRowProps {
    totalHabits: number;
    totalCompletions: number;
    perfectDays: number;
    avgDailyCompletion: number;
}

export default function TotalStatsRow({
    totalHabits,
    totalCompletions,
    perfectDays,
    avgDailyCompletion,
}: TotalStatsRowProps) {
    const { colors, isDark } = useTheme();

    // Theme-aware icon colors
    const accentColor = colors.accent;
    const successColor = colors.success;

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <StatItem
                value={totalHabits}
                label="Habits"
                iconName="list-outline"
                iconColor={isDark ? '#A78BFA' : '#7C3AED'}
                iconBgColor={isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.1)'}
            />
            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
            <StatItem
                value={totalCompletions}
                label="Done"
                iconName="checkmark-circle"
                iconColor={successColor}
                iconBgColor={isDark ? 'rgba(52, 199, 89, 0.15)' : 'rgba(52, 199, 89, 0.1)'}
            />
            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
            <StatItem
                value={perfectDays}
                label="Perfect"
                iconName="star"
                iconColor={accentColor}
                iconBgColor={isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 122, 255, 0.1)'}
            />
            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
            <StatItem
                value={`${avgDailyCompletion}%`}
                label="Avg"
                iconName="bar-chart"
                iconColor={isDark ? '#60A5FA' : '#2563EB'}
                iconBgColor={isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        marginTop: 2,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    divider: {
        width: 1,
        height: 40,
        opacity: 0.3,
    },
});
