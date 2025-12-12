/**
 * WeeklyActivityChart Component
 * Bar chart showing daily activity for the current week
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WeeklyActivityData {
    day: string;
    value: number;
    isToday: boolean;
}

interface WeeklyActivityChartProps {
    data: WeeklyActivityData[];
}

export default function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
    const { colors } = useTheme();
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>Weekly Activity</Text>
            <View style={styles.chartContainer}>
                {data.map((item, index) => {
                    const barHeight = (item.value / 100) * 120; // Max height 120
                    const isActive = item.value > 0;

                    return (
                        <View key={index} style={styles.barWrapper}>
                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: Math.max(barHeight, 8),
                                            backgroundColor: isActive ? colors.accent : colors.cardBorder,
                                            opacity: item.isToday ? 1 : isActive ? 0.85 : 0.5,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[
                                styles.dayLabel,
                                { color: colors.textSecondary },
                                item.isToday && { color: colors.accent, fontWeight: '600' },
                            ]}>
                                {item.day}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: Spacing.lg,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        paddingTop: Spacing.md,
    },
    barWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    barContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
        paddingHorizontal: 4,
    },
    bar: {
        width: '100%',
        borderRadius: BorderRadius.sm,
        minHeight: 8,
    },
    dayLabel: {
        fontSize: 12,
        marginTop: Spacing.sm,
        fontWeight: '500',
    },
});
