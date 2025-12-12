/**
 * Category Picker Component
 * Horizontal scrollable chips with prominent custom option
 */

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { categories, CategoryConfig } from '@/data/categories';
import { HabitCategory } from '@/types/habit';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryPickerProps {
    selectedCategory: HabitCategory | null;
    onSelect: (category: CategoryConfig) => void;
    onCustomPress?: () => void;
}

export default function CategoryPicker({
    selectedCategory,
    onSelect,
    onCustomPress
}: CategoryPickerProps) {
    const customCategory = categories.find(c => c.id === 'custom');
    const otherCategories = categories.filter(c => c.id !== 'custom');

    const handleCustomSelect = () => {
        if (customCategory) {
            onSelect(customCategory);
            onCustomPress?.();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Choose Category</Text>

            {/* Create Custom Button */}
            <TouchableOpacity
                style={[
                    styles.customButton,
                    selectedCategory === 'custom' && styles.customButtonSelected,
                ]}
                onPress={handleCustomSelect}
                activeOpacity={0.7}
            >
                <View style={styles.customIconContainer}>
                    <Ionicons name="add" size={18} color={Colors.background} />
                </View>
                <Text style={styles.customText}>Create Custom Habit</Text>
                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={selectedCategory === 'custom' ? Colors.accent : Colors.textSecondary}
                />
            </TouchableOpacity>

            {/* Category Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
            >
                {otherCategories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.chip,
                            selectedCategory === category.id && styles.chipSelected,
                        ]}
                        onPress={() => onSelect(category)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.chipEmoji}>{category.emoji}</Text>
                        <Text style={[
                            styles.chipName,
                            selectedCategory === category.id && styles.chipNameSelected,
                        ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    customButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        borderStyle: 'dashed',
    },
    customButtonSelected: {
        borderColor: Colors.accent,
        borderStyle: 'solid',
        backgroundColor: Colors.backgroundSecondary,
    },
    customIconContainer: {
        width: 28,
        height: 28,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    customText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
    chipsContainer: {
        paddingVertical: Spacing.xs,
        gap: Spacing.xs,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.full,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        marginRight: Spacing.xs,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    chipSelected: {
        borderColor: Colors.accent,
        backgroundColor: Colors.backgroundSecondary,
    },
    chipEmoji: {
        fontSize: 18,
        marginRight: 6,
    },
    chipName: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    chipNameSelected: {
        color: Colors.text,
    },
});
