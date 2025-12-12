/**
 * StatsRow Component
 * Displays habit statistics in a row of boxes
 */

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatItem {
    value: string | number;
    label: string;
}

interface StatsRowProps {
    stats: StatItem[];
}

export default function StatsRow({ stats }: StatsRowProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                    <Text style={[styles.value, { color: colors.text }]}>{stat.value}</Text>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>{stat.label}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: Spacing.lg,
        marginTop: Spacing.md,
    },
    statItem: {
        alignItems: 'flex-start',
    },
    value: {
        fontSize: 20,
        fontWeight: '700',
    },
    label: {
        fontSize: 12,
        marginTop: 2,
    },
});
