/**
 * HabitCard Component
 * Displays a single habit with stats, contribution grid, and action buttons
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useNotes } from '@/context/NoteContext';
import { useTheme } from '@/context/ThemeContext';
import { Habit } from '@/types/habit';
import { formatLocalDate } from '@/utils/dateUtils';
import haptics from '@/utils/haptics';
import { useRouter } from 'expo-router';
import { Camera, CheckCircle, FileText, GearSix } from 'phosphor-react-native';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ContributionGrid from './ContributionGrid';
import StatsRow from './StatsRow';

interface HabitCardProps {
    habit: Habit;
    onDone?: () => void;
    onDateToggle?: (dateString: string) => void;
    onAddPhoto?: () => void;
}

export default function HabitCard({
    habit,
    onDone,
    onDateToggle,
    onAddPhoto
}: HabitCardProps) {
    const router = useRouter();
    const { hasNote } = useNotes();
    const { colors } = useTheme();
    const today = formatLocalDate(new Date());
    const hasTodayNote = hasNote(habit.id, today);

    const stats = [
        { value: `${habit.completedDays} days`, label: 'Finished' },
        { value: `${habit.percentComplete}%`, label: 'Completed' },
        { value: habit.totalProgress.toString(), label: (habit.unit || 'times').charAt(0).toUpperCase() + (habit.unit || 'times').slice(1) },
    ];

    const handleAddNote = useCallback(() => {
        haptics.light();
        router.push({
            pathname: '/add-note',
            params: { habitId: habit.id, date: today },
        });
    }, [router, habit.id, today]);

    const handleDone = useCallback(() => {
        haptics.success();
        onDone?.();
    }, [onDone]);

    const handleEditHabit = useCallback(() => {
        haptics.light();
        router.push({ pathname: '/edit-habit', params: { habitId: habit.id } });
    }, [router, habit.id]);

    const handleAddPhoto = useCallback(() => {
        haptics.medium();
        onAddPhoto?.();
    }, [onAddPhoto]);

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={styles.icon}>{habit.icon}</Text>
                </View>
                <View style={styles.headerText}>
                    <Text style={[styles.habitName, { color: colors.text }]}>{habit.name}</Text>
                    <Text style={[styles.goalText, { color: colors.textSecondary }]}>
                        Goal: {(habit.goal || 1).toLocaleString()} {habit.unit || ''} | {habit.frequency}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleEditHabit}
                >
                    <GearSix size={20} color={colors.textSecondary} weight="regular" />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <StatsRow stats={stats} />

            {/* Contribution Grid - Tap dates to toggle */}
            <ContributionGrid
                completedDates={habit.completedDates}
                onDatePress={onDateToggle}
            />

            {onDateToggle && (
                <Text style={[styles.gridHint, { color: colors.textMuted }]}>Tap any past date to mark complete</Text>
            )}

            {/* Action Buttons */}
            <View style={[styles.actions, { borderTopColor: colors.cardBorder }]}>
                <TouchableOpacity style={[styles.doneButton, { backgroundColor: colors.accent }]} onPress={handleDone}>
                    <CheckCircle size={18} color={colors.background} weight="fill" />
                    <Text style={[styles.doneButtonText, { color: colors.background }]}>Done</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.accent }]} onPress={handleAddNote}>
                    <FileText
                        size={18}
                        color={colors.accent}
                        weight={hasTodayNote ? "fill" : "regular"}
                    />
                    <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
                        {hasTodayNote ? 'View Note' : 'Add Note'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary }]} onPress={handleAddPhoto}>
                    <Camera size={20} color={colors.textSecondary} weight="regular" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 20,
    },
    headerText: {
        flex: 1,
    },
    habitName: {
        fontSize: 18,
        fontWeight: '600',
    },
    goalText: {
        fontSize: 13,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
    },
    doneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    doneButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridHint: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: Spacing.xs,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
