/**
 * Calendar Modal Component
 * Full-screen calendar showing habit completion status per day
 */

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useNotes } from '@/context/NoteContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Note } from '@/types/note';
import { DayCompletionStats, formatDateForDisplay, getCompletionStatsForDate } from '@/utils/calendarUtils';
import { formatLocalDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotePreviewModal from './NotePreviewModal';

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CalendarModal({ visible, onClose }: CalendarModalProps) {
    const router = useRouter();
    const { habits, refreshHabits } = useHabits();
    const { notes, refreshNotes } = useNotes();
    const { settings } = useSettings();
    const { colors, isDark } = useTheme();
    const today = formatLocalDate(new Date());

    // Dynamic calendar theme based on current theme
    const calendarTheme = useMemo(() => ({
        backgroundColor: colors.background,
        calendarBackground: colors.background,
        textSectionTitleColor: colors.textSecondary,
        selectedDayBackgroundColor: colors.accent,
        selectedDayTextColor: colors.background,
        todayTextColor: colors.accent,
        dayTextColor: colors.text,
        textDisabledColor: colors.textMuted,
        monthTextColor: colors.text,
        arrowColor: colors.accent,
        textDayFontWeight: '500' as const,
        textMonthFontWeight: '700' as const,
        textDayHeaderFontWeight: '600' as const,
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 13,
    }), [colors]);

    // Auto-select today's date when calendar opens
    const [selectedDate, setSelectedDate] = useState<string | null>(today);
    const [previewNoteId, setPreviewNoteId] = useState<{ habitId: string, date: string } | null>(null);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Track if modal just opened (to reset date only once)
    const wasVisible = React.useRef(false);

    // Refresh data when modal opens or becomes visible again
    useEffect(() => {
        if (visible && !wasVisible.current) {
            // Modal just opened - refresh data and reset to today
            refreshHabits();
            refreshNotes();
            setSelectedDate(today);
        }
        wasVisible.current = visible;
    }, [visible]);

    // Get completion stats for all dates with activity
    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};

        // Collect all dates that have any completion
        const allDates = new Set<string>();
        habits.forEach(habit => {
            Object.keys(habit.completedDates).forEach(date => {
                if (habit.completedDates[date] > 0) {
                    allDates.add(date);
                }
            });
        });

        // Calculate stats for each date
        allDates.forEach(dateString => {
            const stats = getCompletionStatsForDate(habits, dateString);
            if (stats.completed > 0) {
                marks[dateString] = {
                    customStyles: {
                        container: {
                            backgroundColor: stats.percentage === 100
                                ? colors.accent
                                : 'transparent',
                            borderWidth: stats.percentage < 100 ? 2 : 0,
                            borderColor: colors.accent,
                            borderRadius: 20,
                        },
                        text: {
                            color: stats.percentage === 100
                                ? colors.background
                                : colors.text,
                            fontWeight: '600',
                        },
                    },
                    stats,
                };
            }
        });

        // Mark today specially if not already marked
        if (!marks[today]) {
            marks[today] = {
                customStyles: {
                    container: {
                        borderWidth: 2,
                        borderColor: colors.accent,
                        borderRadius: 20,
                    },
                    text: {
                        color: colors.accent,
                        fontWeight: '700',
                    },
                },
            };
        }

        // Mark selected date
        if (selectedDate) {
            const existingMark = marks[selectedDate] || {};
            marks[selectedDate] = {
                ...existingMark,
                selected: true,
                customStyles: {
                    container: {
                        ...existingMark.customStyles?.container,
                        backgroundColor: colors.accent,
                        borderRadius: 20,
                    },
                    text: {
                        color: colors.background,
                        fontWeight: '700',
                    },
                },
            };
        }

        return marks;
    }, [habits, today, selectedDate, colors]);

    // Get notes for selected date
    const selectedDateNotes = useMemo(() => {
        if (!selectedDate) return [];

        return Object.values(notes).filter(
            (note: Note) => note.date === selectedDate && note.content.trim().length > 0
        );
    }, [notes, selectedDate]);

    // Get stats for selected date
    const selectedDateStats = useMemo((): DayCompletionStats | null => {
        if (!selectedDate) return null;
        return getCompletionStatsForDate(habits, selectedDate);
    }, [habits, selectedDate]);

    const handleDayPress = useCallback((day: DateData) => {
        // Only allow selecting dates up to today
        if (day.dateString <= today) {
            setSelectedDate(day.dateString);
        }
    }, [today]);

    const handleMonthChange = useCallback((month: DateData) => {
        setCurrentMonth(`${month.year}-${String(month.month).padStart(2, '0')}`);
    }, []);

    const handleClose = useCallback(() => {
        setSelectedDate(null);
        onClose();
    }, [onClose]);

    // Get habit name for a note
    const getHabitName = useCallback((habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        return habit ? `${habit.icon} ${habit.name}` : 'Unknown Habit';
    }, [habits]);

    // Handle direct edit navigation from note card
    const handleEditNote = useCallback((habitId: string, date: string) => {
        router.replace({
            pathname: '/add-note',
            params: { habitId, date, fromCalendar: 'true' }
        });
    }, [router]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                    <Text style={[styles.title, { color: colors.text }]}>Calendar View</Text>
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Calendar */}
                    <Calendar
                        current={currentMonth}
                        onDayPress={handleDayPress}
                        onMonthChange={handleMonthChange}
                        markingType="custom"
                        markedDates={markedDates}
                        theme={calendarTheme}
                        maxDate={today}
                        enableSwipeMonths
                        firstDay={settings.weekStartDay}
                        style={styles.calendar}
                        key={isDark ? 'dark' : 'light'}
                        renderArrow={(direction) => (
                            <Ionicons
                                name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
                                size={20}
                                color={colors.accent}
                            />
                        )}
                    />

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>All Complete</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.accent }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Partial</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.accent, borderStyle: 'dashed' }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Today</Text>
                        </View>
                    </View>

                    {/* Selected Date Info */}
                    {selectedDate && (
                        <View style={styles.selectedInfo}>
                            <Text style={[styles.selectedDateTitle, { color: colors.text }]}>
                                {formatDateForDisplay(selectedDate)}
                            </Text>

                            {/* Completion Stats */}
                            {selectedDateStats && selectedDateStats.total > 0 && (
                                <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
                                    <View style={[styles.statCircle, { backgroundColor: colors.accent }]}>
                                        <Text style={[styles.statPercentage, { color: colors.background }]}>
                                            {selectedDateStats.percentage}%
                                        </Text>
                                    </View>
                                    <Text style={[styles.statsText, { color: colors.textSecondary }]}>
                                        {selectedDateStats.completed} of {selectedDateStats.total} habits completed
                                    </Text>
                                </View>
                            )}

                            {/* Notes Section */}
                            <View style={styles.notesSection}>
                                <Text style={[styles.notesSectionTitle, { color: colors.text }]}>
                                    📝 Notes ({selectedDateNotes.length})
                                </Text>

                                {selectedDateNotes.length === 0 ? (
                                    <Text style={[styles.noNotesText, { color: colors.textMuted }]}>
                                        No notes written on this day
                                    </Text>
                                ) : (
                                    selectedDateNotes.map((note: Note) => (
                                        <TouchableOpacity
                                            key={note.id}
                                            style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                                            onPress={() => setPreviewNoteId({ habitId: note.habitId, date: note.date })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.noteCardHeader}>
                                                <Text style={[styles.noteHabitName, { color: colors.accent }]}>
                                                    {getHabitName(note.habitId)}
                                                </Text>
                                                {note.mood && (
                                                    <Text style={styles.noteMoodEmoji}>
                                                        {note.mood === 'great' ? '😊' : note.mood === 'good' ? '🙂' : note.mood === 'okay' ? '😐' : note.mood === 'bad' ? '😔' : '😢'}
                                                    </Text>
                                                )}
                                            </View>
                                            <Text style={[styles.noteContent, { color: colors.text }]} numberOfLines={2}>
                                                {note.content}
                                            </Text>
                                            <View style={[styles.noteCardFooter, { borderTopColor: colors.cardBorder }]}>
                                                <Text style={[styles.noteTimestamp, { color: colors.textMuted }]}>
                                                    Tap to view
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        </View>
                    )}

                    <View style={styles.bottomPadding} />
                </ScrollView>

                {/* Note Preview Modal (Now Overlay) */}
                <NotePreviewModal
                    habitId={previewNoteId?.habitId || ''}
                    date={previewNoteId?.date || ''}
                    visible={previewNoteId !== null}
                    onClose={() => setPreviewNoteId(null)}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    calendar: {
        marginHorizontal: Spacing.sm,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
        paddingBottom: Spacing.md,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.lg,
        paddingVertical: Spacing.md,
        marginTop: Spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    legendDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    legendComplete: {
        backgroundColor: Colors.accent,
    },
    legendPartial: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    legendToday: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.accent,
        borderStyle: 'dashed',
    },
    legendText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    selectedInfo: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    selectedDateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
        backgroundColor: Colors.card,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    statCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statPercentage: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.background,
    },
    statsText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    notesSection: {
        marginTop: Spacing.sm,
    },
    notesSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    noNotesText: {
        fontSize: 14,
        color: Colors.textMuted,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: Spacing.lg,
    },
    noteCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    noteHabitName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.accent,
        marginBottom: Spacing.xs,
    },
    noteContent: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    noteCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    noteMoodEmoji: {
        fontSize: 18,
    },
    noteCardFooter: {
        marginTop: Spacing.xs,
        paddingTop: Spacing.xs,
        borderTopWidth: 1,
        borderTopColor: Colors.cardBorder,
    },
    noteTimestamp: {
        fontSize: 11,
        color: Colors.textMuted,
        fontStyle: 'italic',
    },
    bottomPadding: {
        height: 40,
    },
});
