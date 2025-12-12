/**
 * HabitPerformanceCard Component
 * Per-habit breakdown with progress bars
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Habit } from '@/types/habit';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HabitPerformance {
    habit: Habit;
    completionRate: number;
    completedCount: number;
    possibleCount: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
}

interface HabitPerformanceCardProps {
    data: HabitPerformance[];
    period: string;
}

// Get theme-aware status colors
function getStatusColors(accent: string, isDark: boolean) {
    return {
        excellent: accent,
        good: accent + 'CC', // 80% opacity
        fair: isDark ? '#FFB800' : '#FF9500',
        poor: '#FF453A',
    };
}

export default function HabitPerformanceCard({ data, period }: HabitPerformanceCardProps) {
    const { colors, isDark } = useTheme();
    const statusColors = getStatusColors(colors.accent, isDark);

    if (data.length === 0) {
        return null;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Habit Performance</Text>
                    <Text style={[styles.description, { color: colors.textMuted }]}>
                        How each habit is doing
                    </Text>
                </View>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    This {period}
                </Text>
            </View>

            <View style={styles.habitList}>
                {data.slice(0, 5).map((item, index) => (
                    <View key={item.habit.id} style={styles.habitRow}>
                        <View style={styles.habitInfo}>
                            <Text style={styles.habitIcon}>{item.habit.icon}</Text>
                            <View style={styles.habitTextContainer}>
                                <Text
                                    style={[styles.habitName, { color: colors.text }]}
                                    numberOfLines={1}
                                >
                                    {item.habit.name}
                                </Text>
                                <Text style={[styles.habitStats, { color: colors.textSecondary }]}>
                                    {item.completedCount}/{item.possibleCount} completed
                                </Text>
                            </View>
                        </View>

                        <View style={styles.progressSection}>
                            <View style={[styles.progressBarBg, { backgroundColor: colors.cardBorder }]}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${item.completionRate}%`,
                                            backgroundColor: statusColors[item.status],
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.percentage, { color: statusColors[item.status] }]}>
                                {item.completionRate}%
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {data.length > 5 && (
                <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                    +{data.length - 5} more habits
                </Text>
            )}
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
    description: {
        fontSize: 12,
        marginTop: 2,
    },
    subtitle: {
        fontSize: 12,
    },
    habitList: {
        gap: Spacing.md,
    },
    habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    habitInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: Spacing.md,
    },
    habitIcon: {
        fontSize: 20,
        marginRight: Spacing.sm,
    },
    habitTextContainer: {
        flex: 1,
    },
    habitName: {
        fontSize: 14,
        fontWeight: '500',
    },
    habitStats: {
        fontSize: 11,
        marginTop: 2,
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 130,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        marginRight: Spacing.sm,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    percentage: {
        fontSize: 12,
        fontWeight: '700',
        width: 36,
        textAlign: 'right',
    },
    moreText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: Spacing.md,
    },
});
