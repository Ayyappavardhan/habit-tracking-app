/**
 * MonthlyHeatmap Component
 * GitHub-style contribution grid for habit tracking
 * Shows last 35 days (5 weeks) with color intensity based on completion rate
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HeatmapData {
    date: string;
    dayOfMonth: number;
    completionRate: number;
    weekIndex: number;
    dayIndex: number;
}

interface MonthlyHeatmapProps {
    data: HeatmapData[];
}

export default function MonthlyHeatmap({ data }: MonthlyHeatmapProps) {
    const { colors, isDark } = useTheme();

    if (data.length === 0) {
        return null;
    }

    // Get intensity color based on completion rate
    const getIntensityColor = (rate: number) => {
        if (rate === 0) return isDark ? colors.cardBorder : '#E5E5EA';
        if (rate <= 25) return colors.accent + '40';
        if (rate <= 50) return colors.accent + '70';
        if (rate <= 75) return colors.accent + 'A0';
        return colors.accent;
    };

    // Group data by weeks (columns)
    const weeks: HeatmapData[][] = [];
    for (let i = 0; i < 5; i++) {
        weeks.push(data.filter(d => d.weekIndex === i));
    }

    // Calculate stats for summary
    const totalDays = data.length;
    const activeDays = data.filter(d => d.completionRate > 0).length;
    const perfectDays = data.filter(d => d.completionRate === 100).length;

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Monthly Overview</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Last 35 days
                </Text>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.accent }]}>{activeDays}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Days</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.accent }]}>{perfectDays}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Perfect Days</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.accent }]}>
                        {totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Activity Rate</Text>
                </View>
            </View>

            {/* Heatmap Grid - 5 columns x 7 rows */}
            <View style={styles.gridContainer}>
                {weeks.map((week, weekIdx) => (
                    <View key={weekIdx} style={styles.weekColumn}>
                        {week.map((day) => (
                            <View
                                key={day.date}
                                style={[
                                    styles.cell,
                                    { backgroundColor: getIntensityColor(day.completionRate) },
                                ]}
                            >
                                {/* Show day number for context */}
                                <Text style={[
                                    styles.cellText,
                                    { color: day.completionRate > 50 ? '#fff' : colors.textMuted }
                                ]}>
                                    {day.dayOfMonth}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Less</Text>
                <View style={[styles.legendCell, { backgroundColor: isDark ? colors.cardBorder : '#E5E5EA' }]} />
                <View style={[styles.legendCell, { backgroundColor: colors.accent + '40' }]} />
                <View style={[styles.legendCell, { backgroundColor: colors.accent + '70' }]} />
                <View style={[styles.legendCell, { backgroundColor: colors.accent + 'A0' }]} />
                <View style={[styles.legendCell, { backgroundColor: colors.accent }]} />
                <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>More</Text>
            </View>

            {/* Explanation */}
            <Text style={[styles.explanation, { color: colors.textSecondary }]}>
                Each square shows your daily habit completion. Darker = more habits done!
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        opacity: 0.3,
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    weekColumn: {
        gap: 4,
    },
    cell: {
        width: 36,
        height: 36,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellText: {
        fontSize: 10,
        fontWeight: '500',
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.lg,
        gap: 4,
    },
    legendCell: {
        width: 14,
        height: 14,
        borderRadius: 3,
    },
    legendLabel: {
        fontSize: 11,
        marginHorizontal: 4,
    },
    explanation: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: Spacing.sm,
        fontStyle: 'italic',
    },
});
