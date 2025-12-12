/**
 * HabitFilter Component
 * Dropdown selector for filtering by habit
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Habit } from '@/types/habit';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HabitFilterProps {
    habits: Habit[];
    selectedHabitId: string | null;
    onSelect: (habitId: string | null) => void;
}

export default function HabitFilter({ habits, selectedHabitId, onSelect }: HabitFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { colors, isDark } = useTheme();

    const selectedHabit = selectedHabitId
        ? habits.find(h => h.id === selectedHabitId)
        : null;

    const displayText = selectedHabit
        ? `${selectedHabit.icon} ${selectedHabit.name}`
        : 'All Habits';

    const handleSelect = (habitId: string | null) => {
        onSelect(habitId);
        setIsOpen(false);
    };

    return (
        <>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.label, { color: colors.textSecondary }]}>Habit:</Text>
                <Text style={[styles.selectedText, { color: colors.text }]}>{displayText}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={[styles.dropdown, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={[styles.dropdownHeader, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.dropdownTitle, { color: colors.text }]}>Select Habit</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.optionsList}>
                            {/* All Habits option */}
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    !selectedHabitId && { backgroundColor: colors.card },
                                ]}
                                onPress={() => handleSelect(null)}
                            >
                                <Text style={styles.optionIcon}>📊</Text>
                                <Text style={[
                                    styles.optionText,
                                    { color: colors.text },
                                    !selectedHabitId && { fontWeight: '600', color: colors.accent },
                                ]}>
                                    All Habits
                                </Text>
                                {!selectedHabitId && (
                                    <Ionicons name="checkmark" size={20} color={colors.accent} />
                                )}
                            </TouchableOpacity>

                            {/* Individual habits */}
                            {habits.map(habit => (
                                <TouchableOpacity
                                    key={habit.id}
                                    style={[
                                        styles.option,
                                        selectedHabitId === habit.id && { backgroundColor: colors.card },
                                    ]}
                                    onPress={() => handleSelect(habit.id)}
                                >
                                    <Text style={styles.optionIcon}>{habit.icon}</Text>
                                    <Text style={[
                                        styles.optionText,
                                        { color: colors.text },
                                        selectedHabitId === habit.id && { fontWeight: '600', color: colors.accent },
                                    ]}>
                                        {habit.name}
                                    </Text>
                                    {selectedHabitId === habit.id && (
                                        <Ionicons name="checkmark" size={20} color={colors.accent} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    label: {
        fontSize: 14,
    },
    selectedText: {
        fontSize: 14,
        fontWeight: '600',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
    },
    dropdown: {
        borderRadius: BorderRadius.xl,
        maxHeight: 400,
        overflow: 'hidden',
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
    },
    dropdownTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    optionsList: {
        maxHeight: 320,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    optionIcon: {
        fontSize: 20,
        width: 28,
        textAlign: 'center',
    },
    optionText: {
        flex: 1,
        fontSize: 16,
    },
});
