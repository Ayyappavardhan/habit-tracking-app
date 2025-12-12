/**
 * ContributionGrid Component
 * GitHub-style heatmap showing habit completion for the entire year
 * Cells are tappable for past/today dates to toggle completion
 */

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatLocalDate } from '@/utils/dateUtils';
import haptics from '@/utils/haptics';
import React, { useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ContributionGridProps {
    completedDates: Record<string, number>;
    year?: number;
    onDatePress?: (dateString: string) => void;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CELL_SIZE = 16;
const CELL_GAP = 4;

export default function ContributionGrid({ completedDates, year, onDatePress }: ContributionGridProps) {
    const now = new Date();
    const currentYear = year || now.getFullYear();
    const scrollViewRef = useRef<ScrollView>(null);
    const today = formatLocalDate(now);
    const { colors } = useTheme();

    const { gridData, columns } = useMemo(() => {
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);

        // Determine start offset (day of week of Jan 1st)
        const startDayOfWeek = startDate.getDay(); // 0 = Sun, 1 = Mon, etc.

        const data: (string | null)[][] = Array(7).fill(null).map(() => []);

        // Fill initial empty days if year doesn't start on Sunday
        for (let i = 0; i < startDayOfWeek; i++) {
            data[i].push(null);
        }

        const dateIterator = new Date(startDate);
        while (dateIterator <= endDate) {
            const dayOfWeek = dateIterator.getDay();
            const dateString = formatLocalDate(dateIterator);

            data[dayOfWeek].push(dateString);

            dateIterator.setDate(dateIterator.getDate() + 1);
        }

        // Calculate number of columns (max length of any row)
        const cols = Math.max(...data.map(row => row.length));

        // Pad shorter rows with nulls to make it a rectangular grid
        data.forEach(row => {
            while (row.length < cols) {
                row.push(null);
            }
        });

        return { gridData: data, columns: cols };
    }, [currentYear]);

    // Scroll to end on mount
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 100);
    }, []);

    // Helper to get completion status
    const isCompleted = (dateString: string | null) => {
        if (!dateString) return false;
        return !!completedDates[dateString];
    };

    // Helper to check if it's today
    const isToday = (dateString: string | null) => {
        if (!dateString) return false;
        return dateString === today;
    };

    // Helper to check if date is in the future
    const isFuture = (dateString: string | null) => {
        if (!dateString) return false;
        return dateString > today;
    };

    // Handle cell press
    const handleCellPress = (dateString: string | null) => {
        if (!dateString || isFuture(dateString)) return;

        // Trigger haptic feedback based on current state
        // If currently completed, will become uncompleted (light feedback)
        // If currently uncompleted, will become completed (success feedback)
        const currentlyCompleted = isCompleted(dateString);
        if (currentlyCompleted) {
            haptics.habitUncomplete();
        } else {
            haptics.habitComplete();
        }

        onDatePress?.(dateString);
    };

    // Get cell style based on state
    const getCellStyle = (dateString: string | null, completed: boolean, future: boolean, todayCell: boolean) => {
        const baseStyle = [styles.cell];

        if (!dateString) {
            return [...baseStyle, { backgroundColor: 'transparent' }];
        }

        if (future) {
            return [...baseStyle, { backgroundColor: colors.gridIncomplete, opacity: 0.3 }];
        }

        if (completed) {
            return [...baseStyle, { backgroundColor: colors.gridComplete }];
        }

        const incompleteStyle = [...baseStyle, { backgroundColor: colors.gridIncomplete }];

        if (todayCell) {
            return [...incompleteStyle, { borderWidth: 2, borderColor: colors.accent }];
        }

        return incompleteStyle;
    };

    return (
        <View style={styles.container}>
            <View style={styles.daysColumn}>
                {DAYS.map((day, index) => (
                    <Text key={index} style={[styles.dayLabel, { color: colors.textSecondary }]}>{day}</Text>
                ))}
            </View>
            <View style={styles.gridWrapper}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.grid}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <View key={colIndex} style={styles.column}>
                                {Array.from({ length: 7 }).map((_, rowIndex) => {
                                    const dateString = gridData[rowIndex][colIndex];
                                    const completed = isCompleted(dateString);
                                    const todayCell = isToday(dateString);
                                    const future = isFuture(dateString);
                                    const canTap = dateString && !future && onDatePress;

                                    const cellContent = (
                                        <View style={getCellStyle(dateString, completed, future, todayCell)} />
                                    );

                                    if (canTap) {
                                        return (
                                            <TouchableOpacity
                                                key={`${rowIndex}-${colIndex}`}
                                                onPress={() => handleCellPress(dateString)}
                                                activeOpacity={0.7}
                                                style={styles.touchable}
                                            >
                                                {cellContent}
                                            </TouchableOpacity>
                                        );
                                    }

                                    return (
                                        <View key={`${rowIndex}-${colIndex}`} style={styles.cellWrapper}>
                                            {cellContent}
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: Spacing.md,
    },
    daysColumn: {
        marginRight: Spacing.sm,
        justifyContent: 'space-around',
        paddingBottom: CELL_GAP,
    },
    dayLabel: {
        fontSize: 10,
        height: CELL_SIZE,
        lineHeight: CELL_SIZE,
        textAlignVertical: 'center',
        marginBottom: CELL_GAP,
    },
    gridWrapper: {
        flex: 1,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingRight: Spacing.md,
    },
    grid: {
        flexDirection: 'row',
    },
    column: {
        flexDirection: 'column',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 3,
    },
    touchable: {
        // Padding creates gap between cells AND expands touch target
        // Each cell takes full (CELL_SIZE + CELL_GAP) space
        padding: CELL_GAP / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellWrapper: {
        // Same sizing for non-tappable cells to maintain grid alignment
        padding: CELL_GAP / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
