import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useNotes } from '@/context/NoteContext';
import { MoodEmojis } from '@/types/note';
import { formatLocalDate } from '@/utils/dateUtils';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RecentNotes() {
    const { notes } = useNotes();
    const { habits } = useHabits();

    const recentNotes = useMemo(() => {
        return Object.values(notes)
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .slice(0, 5); // Take top 5
    }, [notes]);

    const getHabitName = (habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        return habit ? habit.name : 'Unknown Habit';
    };

    const getRelativeDate = (dateStr: string) => {
        const today = formatLocalDate(new Date());
        if (dateStr === today) return 'Today';

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (dateStr === formatLocalDate(yesterday)) return 'Yesterday';

        return dateStr;
    };

    if (recentNotes.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Updates</Text>
            </View>

            <View style={styles.list}>
                {recentNotes.map((note) => (
                    <View key={`${note.habitId}_${note.date}`} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.habitInfo}>
                                <Text style={styles.habitName}>{getHabitName(note.habitId)}</Text>
                                <Text style={styles.date}>{getRelativeDate(note.date)}</Text>
                            </View>
                            {note.mood && (
                                <Text style={styles.moodEmoji}>{MoodEmojis[note.mood]}</Text>
                            )}
                        </View>
                        {note.content ? (
                            <Text style={styles.noteParams} numberOfLines={2}>
                                {note.content}
                            </Text>
                        ) : (
                            <Text style={styles.emptyNote}>No text note</Text>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    header: {
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    list: {
        gap: Spacing.sm,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xs,
    },
    habitInfo: {
        flex: 1,
    },
    habitName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    moodEmoji: {
        fontSize: 24,
        marginLeft: Spacing.sm,
    },
    noteParams: {
        fontSize: 14,
        color: Colors.text, // Lighter than primary text? Maybe secondary for body
        lineHeight: 20,
    },
    emptyNote: {
        fontSize: 13,
        fontStyle: 'italic',
        color: Colors.textSecondary,
    },
});
