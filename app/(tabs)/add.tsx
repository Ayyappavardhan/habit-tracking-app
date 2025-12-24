/**
 * Add Habit Screen
 * Form for creating new habits with categories, goals, and notifications
 */

import { FrequencySelector, IconPicker, NotificationPicker } from '@/components/habit';
import { DEFAULT_ICON } from '@/constants/iconData';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { categories, CategoryConfig } from '@/data/categories';
import { FrequencyType, MetricType } from '@/types/habit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as PhosphorIcons from 'phosphor-react-native';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddScreen() {
    const router = useRouter();
    const { addHabit } = useHabits();
    const { settings } = useSettings();
    const { colors, isDark } = useTheme();

    // Form state
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON);
    const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
    const [isCustomMode, setIsCustomMode] = useState(true); // Start in custom mode
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showUnitPicker, setShowUnitPicker] = useState(false);
    const [metricType, setMetricType] = useState<MetricType>('count');
    const [goal, setGoal] = useState('1');
    const [unit, setUnit] = useState('times');
    const [frequency, setFrequency] = useState<FrequencyType>('daily');
    const [notificationEnabled, setNotificationEnabled] = useState(false);
    // Use the default notification time from settings
    const [notificationTime, setNotificationTime] = useState(settings.defaultNotificationTime);
    const [notificationDay, setNotificationDay] = useState<number | undefined>(undefined); // For weekly: 1-7, for monthly: 1-31
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter out 'custom' from the category list
    const habitCategories = categories.filter(c => c.id !== 'custom');

    // All available units - organized by category for better UX
    const unitCategories = [
        { name: 'Count & Frequency', units: ['times', 'count', 'sessions', 'sets', 'reps', 'rounds'] },
        { name: 'Time', units: ['seconds', 'minutes', 'hours', 'days'] },
        { name: 'Distance', units: ['meters', 'kilometers', 'km', 'miles', 'feet', 'yards', 'steps'] },
        { name: 'Fitness', units: ['calories', 'kcal', 'laps', 'pushups', 'situps', 'pullups', 'squats'] },
        { name: 'Hydration', units: ['ml', 'liters', 'oz', 'cups', 'glasses', 'bottles'] },
        { name: 'Reading & Learning', units: ['pages', 'chapters', 'books', 'articles', 'lessons', 'words', 'flashcards'] },
        { name: 'Productivity', units: ['tasks', 'emails', 'pomodoros', 'meetings', 'calls', 'projects'] },
        { name: 'Health', units: ['pills', 'vitamins', 'mg', 'servings', 'meals', 'snacks'] },
        { name: 'Finance', units: ['dollars', 'euros', 'rupees', 'percent', '%'] },
        { name: 'Sleep', units: ['nights', 'naps'] },
        { name: 'Social', units: ['messages', 'posts', 'photos', 'videos', 'friends', 'connections'] },
        { name: 'Music & Practice', units: ['songs', 'scales', 'pieces', 'exercises'] },
        { name: 'Miscellaneous', units: ['items', 'entries', 'points', 'credits', 'units'] },
    ];

    // Helper to render Phosphor icon dynamically
    const renderIcon = (iconName: string, size: number, color: string) => {
        const IconComponent = (PhosphorIcons as any)[iconName];
        if (IconComponent) {
            return <IconComponent size={size} color={color} weight="regular" />;
        }
        return <PhosphorIcons.Star size={size} color={color} weight="regular" />;
    };

    const handleCategorySelect = (category: CategoryConfig) => {
        // If same category clicked, deselect and go to custom mode
        if (selectedCategory?.id === category.id) {
            setSelectedCategory(null);
            setIsCustomMode(true);
            return;
        }

        setSelectedCategory(category);
        setIsCustomMode(false);
        // Update the hero icon to match the category
        setSelectedIcon(category.icon);
        setMetricType(category.defaultMetric);
        setUnit(category.defaultUnit);
        setGoal(category.defaultGoal.toString());
        // Always set name to template name when selecting a template
        setName(category.name);
    };

    const handleCustomSelect = () => {
        setSelectedCategory(null);
        setIsCustomMode(true);
        setSelectedIcon(DEFAULT_ICON);
        setMetricType('count');
        setUnit('times');
        setGoal('1');
    };

    const handleIconSelect = (iconName: string) => {
        setSelectedIcon(iconName);
        // When user manually picks icon, switch to custom mode
        if (!isCustomMode) {
            setIsCustomMode(true);
            setSelectedCategory(null);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Missing Name', 'Please enter a habit name');
            return;
        }
        if (!goal || parseInt(goal) <= 0) {
            Alert.alert('Invalid Goal', 'Please enter a valid goal');
            return;
        }

        setIsSubmitting(true);

        try {
            await addHabit({
                name: name.trim(),
                icon: selectedIcon,
                category: selectedCategory?.id || 'custom',
                metricType,
                goal: parseInt(goal),
                unit,
                frequency,
                daysPerWeek: frequency === 'daily' ? 7 : frequency === 'weekly' ? 1 : 1,
                notificationEnabled,
                notificationTime: notificationEnabled ? notificationTime : undefined,
                notificationDay: notificationEnabled ? notificationDay : undefined,
            });

            Alert.alert('Success! 🎉', `"${name}" has been added to your habits.`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add habit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSave = name.trim().length > 0 && parseInt(goal) > 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>New Habit</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSubmitting || !canSave}
                        style={styles.headerButton}
                    >
                        <Text style={[
                            styles.saveText,
                            { color: colors.accent },
                            !canSave && { color: colors.textMuted }
                        ]}>
                            {isSubmitting ? '...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Step 1: Icon & Name */}
                    <View style={styles.heroSection}>
                        <TouchableOpacity
                            style={styles.iconSelector}
                            onPress={() => setShowIconPicker(true)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.heroIconContainer, { backgroundColor: colors.card }]}>
                                {renderIcon(selectedIcon, 40, colors.accent)}
                            </View>
                            <View style={[styles.iconEditBadge, { backgroundColor: colors.accent, borderColor: colors.background }]}>
                                <Ionicons name="pencil" size={10} color={colors.background} />
                            </View>
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.nameInput, { color: colors.text }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Habit name"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="words"
                            autoFocus
                        />
                        {isCustomMode && (
                            <View style={[styles.customBadge, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.customBadgeText, { color: colors.background }]}>Custom Habit</Text>
                            </View>
                        )}
                    </View>

                    {/* Step 2: Category Selection */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Templates</Text>
                        <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                            {isCustomMode
                                ? "Choose a template or continue with custom"
                                : "Tap again to deselect"}
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryScroll}
                        >
                            {/* Custom Option First */}
                            <TouchableOpacity
                                style={[
                                    styles.categoryChip,
                                    { backgroundColor: colors.card },
                                    isCustomMode && { borderColor: colors.accent, borderStyle: 'dashed' },
                                    isCustomMode && { backgroundColor: colors.accent, borderStyle: 'solid' },
                                ]}
                                onPress={handleCustomSelect}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={16}
                                    color={isCustomMode ? colors.background : colors.accent}
                                />
                                <Text style={[
                                    styles.categoryName,
                                    { color: colors.textSecondary },
                                    isCustomMode && { color: colors.background, fontWeight: '600' },
                                ]}>
                                    Custom
                                </Text>
                            </TouchableOpacity>

                            {/* Template Categories */}
                            {habitCategories.map((category) => {
                                const isSelected = selectedCategory?.id === category.id;
                                return (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.categoryChip,
                                            { backgroundColor: colors.card },
                                            isSelected && { borderColor: colors.accent, backgroundColor: colors.accent },
                                        ]}
                                        onPress={() => handleCategorySelect(category)}
                                        activeOpacity={0.7}
                                    >
                                        {renderIcon(category.icon, 16, isSelected ? colors.background : colors.textSecondary)}
                                        <Text style={[
                                            styles.categoryName,
                                            { color: colors.textSecondary },
                                            isSelected && { color: colors.background, fontWeight: '600' },
                                        ]}>
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Step 3: Goal Configuration */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Daily Goal</Text>
                        <View style={styles.goalContainer}>
                            <TextInput
                                style={[styles.goalInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
                                value={goal}
                                onChangeText={setGoal}
                                placeholder="0"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                                selectTextOnFocus
                            />
                            <TouchableOpacity
                                style={[styles.unitSelector, { backgroundColor: colors.accent }]}
                                onPress={() => setShowUnitPicker(true)}
                            >
                                <Text style={[styles.unitText, { color: colors.background }]}>{unit}</Text>
                                <Ionicons name="chevron-down" size={16} color={colors.background} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Step 4: Frequency */}
                    <FrequencySelector
                        selectedFrequency={frequency}
                        onSelect={setFrequency}
                    />

                    {/* Step 5: Reminder */}
                    <NotificationPicker
                        enabled={notificationEnabled}
                        time={notificationTime}
                        frequency={frequency}
                        day={notificationDay}
                        onToggle={setNotificationEnabled}
                        onTimeChange={setNotificationTime}
                        onDayChange={setNotificationDay}
                    />

                    {/* Create Button */}
                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: colors.accent }, !canSave && { backgroundColor: colors.card }]}
                        onPress={handleSave}
                        disabled={isSubmitting || !canSave}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color={canSave ? colors.background : colors.textMuted}
                        />
                        <Text style={[
                            styles.createButtonText,
                            { color: colors.background },
                            !canSave && { color: colors.textMuted }
                        ]}>
                            {isSubmitting ? 'Creating...' : 'Create Habit'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.bottomPadding} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Icon Picker Modal */}
            <IconPicker
                visible={showIconPicker}
                selectedIcon={selectedIcon}
                onSelect={handleIconSelect}
                onClose={() => setShowIconPicker(false)}
            />

            {/* Unit Picker Modal */}
            <Modal
                visible={showUnitPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowUnitPicker(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.unitPickerContent, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={styles.unitPickerHeader}>
                            <Text style={[styles.unitPickerTitle, { color: colors.text }]}>Select Unit</Text>
                            <TouchableOpacity onPress={() => setShowUnitPicker(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.unitScrollView} showsVerticalScrollIndicator={true}>
                            {unitCategories.map((category) => (
                                <View key={category.name} style={styles.unitCategory}>
                                    <Text style={[styles.unitCategoryLabel, { color: colors.textSecondary }]}>
                                        {category.name}
                                    </Text>
                                    <View style={styles.unitGrid}>
                                        {category.units.map((u) => (
                                            <TouchableOpacity
                                                key={u}
                                                style={[
                                                    styles.unitOption,
                                                    { backgroundColor: colors.card },
                                                    unit === u && { backgroundColor: colors.accent },
                                                ]}
                                                onPress={() => {
                                                    setUnit(u);
                                                    setShowUnitPicker(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.unitOptionText,
                                                    { color: colors.textSecondary },
                                                    unit === u && { color: colors.background, fontWeight: '600' },
                                                ]}>
                                                    {u}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ))}
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xs,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    headerButton: {
        width: 50,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text,
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.accent,
    },
    saveTextDisabled: {
        color: Colors.textMuted,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },

    // Hero Section
    heroSection: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        gap: Spacing.sm,
    },
    iconSelector: {
        position: 'relative',
    },
    heroIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconEditBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    nameInput: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
        width: '100%',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.lg,
    },
    customBadge: {
        backgroundColor: Colors.accent,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    customBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.background,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Sections
    section: {
        marginBottom: Spacing.lg,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionHint: {
        fontSize: 12,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
    },

    // Category Chips
    categoryScroll: {
        paddingVertical: Spacing.xs,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.full,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginRight: 8,
        borderWidth: 1.5,
        borderColor: 'transparent',
        gap: 6,
    },
    customChip: {
        borderColor: Colors.accent,
        borderStyle: 'dashed',
    },
    categoryChipSelected: {
        borderColor: Colors.accent,
        backgroundColor: Colors.accent,
    },
    customChipTextSelected: {
        color: Colors.background,
        fontWeight: '600',
    },
    categoryEmoji: {
        fontSize: 16,
    },
    categoryName: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    categoryNameSelected: {
        color: Colors.background,
        fontWeight: '600',
    },

    // Goal
    goalContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    goalInput: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    unitSelector: {
        flexDirection: 'row',
        backgroundColor: Colors.accent,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100,
        gap: 4,
    },
    unitText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.background,
    },

    // Create Button
    createButton: {
        flexDirection: 'row',
        backgroundColor: Colors.accent,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    createButtonDisabled: {
        backgroundColor: Colors.card,
    },
    createButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.background,
    },
    createButtonTextDisabled: {
        color: Colors.textMuted,
    },
    bottomPadding: {
        height: 100,
    },

    // Unit Picker Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    unitPickerContent: {
        backgroundColor: Colors.backgroundSecondary,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    unitPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    unitPickerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text,
    },
    unitGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    unitOption: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        minWidth: 80,
        alignItems: 'center',
    },
    unitOptionSelected: {
        backgroundColor: Colors.accent,
    },
    unitOptionText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    unitOptionTextSelected: {
        color: Colors.background,
        fontWeight: '600',
    },
    unitScrollView: {
        maxHeight: 400,
    },
    unitCategory: {
        marginBottom: Spacing.md,
    },
    unitCategoryLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
