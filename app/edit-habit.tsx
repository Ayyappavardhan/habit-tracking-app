import { FrequencySelector, IconPicker, NotificationPicker } from '@/components/habit';
import { DEFAULT_ICON } from '@/constants/iconData';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { categories } from '@/data/categories';
import { FrequencyType } from '@/types/habit';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as PhosphorIcons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
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

export default function EditHabitScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ habitId: string }>();
    const { getHabitById, updateHabit, deleteHabit } = useHabits();
    const { settings } = useSettings();
    const { colors, isDark } = useTheme();

    const habitId = params.habitId || '';
    const habit = getHabitById(habitId);

    // Form state - will be initialized from habit
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showUnitPicker, setShowUnitPicker] = useState(false);
    const [goal, setGoal] = useState('1');
    const [unit, setUnit] = useState('times');
    const [frequency, setFrequency] = useState<FrequencyType>('daily');
    const [notificationEnabled, setNotificationEnabled] = useState(false);
    const [notificationTime, setNotificationTime] = useState('09:00');
    const [notificationDay, setNotificationDay] = useState<number | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Initialize form with habit data
    useEffect(() => {
        if (habit) {
            setName(habit.name);
            // If habit.icon is likely an emoji (length <= 2), default to a generic icon, otherwise use it
            // This handles migration from old emoji icons to new phosphor strings
            const isEmoji = habit.icon && habit.icon.length <= 2;
            setSelectedIcon(isEmoji ? DEFAULT_ICON : habit.icon);
            setGoal(habit.goal.toString());
            setUnit(habit.unit);
            setFrequency(habit.frequency);
            setNotificationEnabled(habit.notificationEnabled);
            // Use habit's notification time, or fall back to default from settings
            setNotificationTime(habit.notificationTime || settings.defaultNotificationTime);
            setNotificationDay(habit.notificationDay);
        }
    }, [habit, settings.defaultNotificationTime]);

    // Helper to render Phosphor icon dynamically
    const renderIcon = (iconName: string, size: number, color: string) => {
        const IconComponent = (PhosphorIcons as any)[iconName];
        if (IconComponent) {
            return <IconComponent size={size} color={color} weight="regular" />;
        }
        return <PhosphorIcons.Star size={size} color={color} weight="regular" />;
    };

    // Get category info for display
    const getCategoryLabel = () => {
        if (!habit) return '';
        const cat = categories.find(c => c.id === habit.category);
        return cat ? `${cat.emoji} ${cat.name}` : 'Custom';
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
            await updateHabit(habitId, {
                name: name.trim(),
                icon: selectedIcon,
                goal: parseInt(goal),
                unit,
                frequency,
                daysPerWeek: frequency === 'daily' ? 7 : frequency === 'weekly' ? 1 : 1,
                notificationEnabled,
                notificationTime: notificationEnabled ? notificationTime : undefined,
                notificationDay: notificationEnabled ? notificationDay : undefined,
            });

            Alert.alert('Updated! ✓', `"${name}" has been updated.`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to update habit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Habit',
            `Are you sure you want to delete "${habit?.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteHabit(habitId);
                        router.back();
                    }
                }
            ]
        );
    };

    if (!habit) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.textSecondary }]}>Habit not found</Text>
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.accent }]} onPress={() => router.back()}>
                        <Text style={[styles.backButtonText, { color: colors.background }]}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

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
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Habit</Text>
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
                    {/* Icon & Name */}
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
                        />
                        <View style={[styles.categoryBadge, { backgroundColor: colors.card }]}>
                            <Text style={[styles.categoryBadgeText, { color: colors.textSecondary }]}>{getCategoryLabel()}</Text>
                        </View>
                    </View>

                    {/* Goal Configuration */}
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

                    {/* Frequency */}
                    <FrequencySelector
                        selectedFrequency={frequency}
                        onSelect={setFrequency}
                    />

                    {/* Reminder - This is the key feature! */}
                    <View style={styles.notificationSection}>
                        <Text style={[styles.notificationHint, { color: colors.textSecondary }]}>
                            {notificationEnabled
                                ? `🔔 You will receive ${frequency} reminders`
                                : '🔕 Enable to get reminders for this habit'}
                        </Text>
                        <NotificationPicker
                            enabled={notificationEnabled}
                            time={notificationTime}
                            frequency={frequency}
                            day={notificationDay}
                            onToggle={setNotificationEnabled}
                            onTimeChange={setNotificationTime}
                            onDayChange={setNotificationDay}
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: colors.accent }, !canSave && { backgroundColor: colors.card }]}
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
                            styles.saveButtonText,
                            { color: colors.background },
                            !canSave && { color: colors.textMuted }
                        ]}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                        <Text style={styles.deleteButtonText}>Delete Habit</Text>
                    </TouchableOpacity>

                    <View style={styles.bottomPadding} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Icon Picker Modal */}
            <IconPicker
                visible={showIconPicker}
                selectedIcon={selectedIcon}
                onSelect={setSelectedIcon}
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
    categoryBadge: {
        backgroundColor: Colors.card,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.textSecondary,
    },

    // Sections
    section: {
        marginBottom: Spacing.lg,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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

    // Notification Section
    notificationSection: {
        marginBottom: Spacing.lg,
    },
    notificationHint: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },

    // Save Button
    saveButton: {
        flexDirection: 'row',
        backgroundColor: Colors.accent,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    saveButtonDisabled: {
        backgroundColor: Colors.card,
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.background,
    },
    saveButtonTextDisabled: {
        color: Colors.textMuted,
    },

    // Delete Button
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.error,
    },
    deleteButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.error,
    },

    bottomPadding: {
        height: 100,
    },

    // Error state
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    errorText: {
        fontSize: 18,
        color: Colors.textSecondary,
    },
    backButton: {
        backgroundColor: Colors.accent,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    backButtonText: {
        color: Colors.background,
        fontWeight: '600',
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
