/**
 * SearchBar Component
 * Search input for filtering habits
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
}

export default function SearchBar({
    value,
    onChangeText,
    placeholder = 'Search Habit'
}: SearchBarProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
                style={[styles.input, { color: colors.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: Spacing.xs,
    },
});
