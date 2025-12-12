/**
 * Analytics Screen
 * Displays habit statistics, streaks, and activity charts
 */

import {
    BestTimeAnalysis,
    CircularProgress,
    HabitFilter,
    HabitPerformanceCard,
    InsightsCard,
    MonthlyHeatmap,
    MoodTrendChart,
    PeriodSelector,
    StreakCard,
    TotalStatsRow,
    WeeklyActivityChart
} from '@/components/analytics';
import { Colors, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useTheme } from '@/context/ThemeContext';
import {
    calculateCompletionRate,
    generateInsights,
    getBestDaysAnalysis,
    getHabitPerformanceData,
    getMonthlyHeatmapData,
    getPreviousPeriodComparison,
    getStreakData,
    getTotalStats,
    getWeeklyActivityData,
    PeriodType,
} from '@/utils/analyticsUtils';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnalyticsScreen() {
    const { habits } = useHabits();
    const { colors, isDark } = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

    // Calculate analytics data
    const completionRate = useMemo(
        () => calculateCompletionRate(habits, selectedPeriod, selectedHabitId || undefined),
        [habits, selectedPeriod, selectedHabitId]
    );

    const comparison = useMemo(
        () => getPreviousPeriodComparison(habits, selectedPeriod, selectedHabitId || undefined),
        [habits, selectedPeriod, selectedHabitId]
    );

    const streakData = useMemo(
        () => getStreakData(habits, selectedHabitId || undefined),
        [habits, selectedHabitId]
    );

    const weeklyData = useMemo(
        () => getWeeklyActivityData(habits, selectedHabitId || undefined),
        [habits, selectedHabitId]
    );

    // NEW: Premium analytics data
    const totalStats = useMemo(
        () => getTotalStats(habits),
        [habits]
    );

    const bestDaysData = useMemo(
        () => getBestDaysAnalysis(habits),
        [habits]
    );

    const habitPerformanceData = useMemo(
        () => getHabitPerformanceData(habits, selectedPeriod),
        [habits, selectedPeriod]
    );

    const heatmapData = useMemo(
        () => getMonthlyHeatmapData(habits),
        [habits]
    );

    const insights = useMemo(
        () => generateInsights(habits),
        [habits]
    );

    // Generate trend message
    const getTrendMessage = () => {
        if (comparison.trend === 'up') {
            return `You're more consistent\nthan last ${selectedPeriod}!`;
        } else if (comparison.trend === 'down') {
            return `Keep pushing!\nLast ${selectedPeriod} was ${comparison.previous}%`;
        }
        return `Same as last ${selectedPeriod}`;
    };

    const getPeriodLabel = () => {
        switch (selectedPeriod) {
            case 'week': return 'week';
            case 'month': return 'month';
            case 'year': return 'year';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Analysis</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => router.push('/calendar')}
                    >
                        <Ionicons name="calendar-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Period Selector */}
                <View style={styles.periodSection}>
                    <PeriodSelector
                        selectedPeriod={selectedPeriod}
                        onSelect={setSelectedPeriod}
                    />
                </View>

                {/* Filter Row */}
                <View style={styles.filterRow}>
                    <HabitFilter
                        habits={habits}
                        selectedHabitId={selectedHabitId}
                        onSelect={setSelectedHabitId}
                    />
                </View>

                {/* Completion Rate Card - Hero/Main KPI */}
                <View style={styles.section}>
                    <CircularProgress
                        percentage={completionRate}
                        trendMessage={getTrendMessage()}
                    />
                </View>

                {/* Streak Cards - Motivation/Engagement */}
                <View style={styles.streakRow}>
                    <StreakCard type="current" value={streakData.current} />
                    <StreakCard type="best" value={streakData.best} />
                </View>

                {/* Weekly Activity - Current Week Pattern */}
                <View style={styles.section}>
                    <WeeklyActivityChart data={weeklyData} />
                </View>

                {/* Monthly Heatmap - Big Picture Overview */}
                {heatmapData.length > 0 && (
                    <View style={styles.section}>
                        <MonthlyHeatmap data={heatmapData} />
                    </View>
                )}

                {/* Total Stats Row - Quick Numbers Summary */}
                <View style={styles.section}>
                    <TotalStatsRow
                        totalHabits={totalStats.totalHabits}
                        totalCompletions={totalStats.totalCompletions}
                        perfectDays={totalStats.perfectDays}
                        avgDailyCompletion={totalStats.avgDailyCompletion}
                    />
                </View>

                {/* Habit Performance Card - Detailed Breakdown */}
                {habitPerformanceData.length > 0 && (
                    <View style={styles.section}>
                        <HabitPerformanceCard
                            data={habitPerformanceData}
                            period={getPeriodLabel()}
                        />
                    </View>
                )}

                {/* Best Time Analysis - Day Patterns */}
                <View style={styles.section}>
                    <BestTimeAnalysis data={bestDaysData} />
                </View>

                {/* Mood Trend Chart */}
                <MoodTrendChart period={selectedPeriod} />

                {/* Insights Card - Actionable Tips */}
                {insights.length > 0 && (
                    <View style={styles.section}>
                        <InsightsCard insights={insights} />
                    </View>
                )}

                {/* Empty State */}
                {habits.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📊</Text>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No habits yet</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            Add some habits to see your analytics
                        </Text>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Calendar Modal removed - using route */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodSection: {
        marginBottom: Spacing.md,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },

    section: {
        marginBottom: Spacing.md,
    },
    streakRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl * 2,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    bottomPadding: {
        height: 100,
    },
});
