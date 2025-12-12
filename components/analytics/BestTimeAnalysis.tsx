/**
 * BestTimeAnalysis Component
 * Shows which days of the week user is most consistent
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DayData {
    day: string;
    shortDay: string;
    completionRate: number;
    isWeekend: boolean;
}

interface BestTimeAnalysisProps {
    data: DayData[];
}

export default function BestTimeAnalysis({ data }: BestTimeAnalysisProps) {
    const { colors } = useTheme();
    const maxRate = Math.max(...data.map(d => d.completionRate), 1);

    // Find best day
    const bestDay = [...data].sort((a, b) => b.completionRate - a.completionRate)[0];

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Best Days</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        Your most productive weekdays
                    </Text>
                </View>
                {bestDay && bestDay.completionRate > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.accent }]}>
                            🏆 {bestDay.shortDay}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.chartContainer}>
                {data.map((item, index) => {
                    const barHeight = (item.completionRate / 100) * 80;
                    const isBest = item.completionRate === maxRate && maxRate > 0;

                    return (
                        <View key={index} style={styles.barWrapper}>
                            <Text style={[
                                styles.percentage,
                                { color: colors.textSecondary },
                                isBest && { color: colors.accent, fontWeight: '700' }
                            ]}>
                                {item.completionRate}%
                            </Text>
                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: Math.max(barHeight, 4),
                                            backgroundColor: isBest ? colors.accent : colors.accent + '70',
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[
                                styles.dayLabel,
                                { color: colors.textSecondary },
                                item.isWeekend && { opacity: 0.7 },
                                isBest && { color: colors.accent, fontWeight: '600' }
                            ]}>
                                {item.shortDay}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    percentage: {
        fontSize: 10,
        marginBottom: 4,
        fontWeight: '500',
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
        minHeight: 4,
    },
    dayLabel: {
        fontSize: 11,
        marginTop: Spacing.sm,
        fontWeight: '500',
    },
});
