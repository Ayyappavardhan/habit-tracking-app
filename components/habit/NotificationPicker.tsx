/**
 * Notification Picker Component
 * Toggle and modern wheel-style time picker for habit reminders
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface NotificationPickerProps {
    enabled: boolean;
    time: string;
    onToggle: (enabled: boolean) => void;
    onTimeChange: (time: string) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

// Generate hours 0-23 and minutes 0-55 (5-min increments)
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

// Quick preset times
const presets = [
    { label: '🌅 Morning', hour: 8, minute: 0 },
    { label: '☀️ Noon', hour: 12, minute: 0 },
    { label: '🌆 Evening', hour: 18, minute: 0 },
    { label: '🌙 Night', hour: 21, minute: 0 },
];

export default function NotificationPicker({
    enabled,
    time,
    onToggle,
    onTimeChange
}: NotificationPickerProps) {
    const { colors } = useTheme();
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedHour, setSelectedHour] = useState(parseInt(time.split(':')[0]) || 9);
    const [selectedMinute, setSelectedMinute] = useState(parseInt(time.split(':')[1]) || 0);

    const hourScrollRef = useRef<ScrollView>(null);
    const minuteScrollRef = useRef<ScrollView>(null);

    const formatTime = (h: number, m: number) => {
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h < 12 ? 'AM' : 'PM';
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const handleOpenPicker = () => {
        setShowTimePicker(true);
        // Scroll to selected values after modal opens
        setTimeout(() => {
            hourScrollRef.current?.scrollTo({ y: selectedHour * ITEM_HEIGHT, animated: false });
            const minuteIndex = Math.floor(selectedMinute / 5);
            minuteScrollRef.current?.scrollTo({ y: minuteIndex * ITEM_HEIGHT, animated: false });
        }, 100);
    };

    const handleHourScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (index >= 0 && index < hours.length) {
            setSelectedHour(hours[index]);
        }
    };

    const handleMinuteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (index >= 0 && index < minutes.length) {
            setSelectedMinute(minutes[index]);
        }
    };

    const handlePresetSelect = (preset: typeof presets[0]) => {
        setSelectedHour(preset.hour);
        setSelectedMinute(preset.minute);
        hourScrollRef.current?.scrollTo({ y: preset.hour * ITEM_HEIGHT, animated: true });
        const minuteIndex = preset.minute / 5;
        minuteScrollRef.current?.scrollTo({ y: minuteIndex * ITEM_HEIGHT, animated: true });
    };

    const handleConfirm = () => {
        const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
        onTimeChange(timeString);
        setShowTimePicker(false);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text }]}>Reminder</Text>

            <View style={[styles.row, { backgroundColor: colors.card }]}>
                <View style={styles.toggleRow}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                        <Ionicons name="notifications" size={18} color={colors.background} />
                    </View>
                    <Text style={[styles.toggleText, { color: colors.text }]}>Daily reminder</Text>
                </View>
                <Switch
                    value={enabled}
                    onValueChange={onToggle}
                    trackColor={{ false: colors.cardBorder, true: colors.accent }}
                    thumbColor={colors.text}
                />
            </View>

            {enabled && (
                <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: colors.card }]}
                    onPress={handleOpenPicker}
                >
                    <View style={styles.timeDisplay}>
                        <Text style={[styles.timeValue, { color: colors.accent }]}>
                            {formatTime(selectedHour, selectedMinute)}
                        </Text>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Tap to change</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            )}

            <Modal
                visible={showTimePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTimePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
                        {/* Header */}
                        <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Time</Text>
                            <TouchableOpacity onPress={handleConfirm}>
                                <Text style={[styles.confirmText, { color: colors.accent }]}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quick Presets */}
                        <View style={styles.presetsRow}>
                            {presets.map((preset) => (
                                <TouchableOpacity
                                    key={preset.label}
                                    style={[
                                        styles.presetButton,
                                        { backgroundColor: colors.card },
                                        selectedHour === preset.hour && selectedMinute === preset.minute && { backgroundColor: colors.accent },
                                    ]}
                                    onPress={() => handlePresetSelect(preset)}
                                >
                                    <Text style={[
                                        styles.presetText,
                                        { color: colors.textSecondary },
                                        selectedHour === preset.hour && selectedMinute === preset.minute && { color: colors.background, fontWeight: '600' },
                                    ]}>
                                        {preset.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Time Display */}
                        <View style={styles.selectedTimeDisplay}>
                            <Text style={[styles.selectedTimeText, { color: colors.text }]}>
                                {formatTime(selectedHour, selectedMinute)}
                            </Text>
                        </View>

                        {/* Wheel Picker */}
                        <View style={styles.pickerContainer}>
                            {/* Hour Wheel */}
                            <View style={styles.wheelColumn}>
                                <Text style={[styles.wheelLabel, { color: colors.textSecondary }]}>Hour</Text>
                                <View style={styles.wheelWrapper}>
                                    <View style={[styles.selectionIndicator, { backgroundColor: colors.card }]} />
                                    <ScrollView
                                        ref={hourScrollRef}
                                        style={styles.wheel}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={ITEM_HEIGHT}
                                        decelerationRate="fast"
                                        onMomentumScrollEnd={handleHourScroll}
                                        contentContainerStyle={styles.wheelContent}
                                    >
                                        {hours.map((h) => (
                                            <View key={h} style={styles.wheelItem}>
                                                <Text style={[
                                                    styles.wheelItemText,
                                                    { color: colors.textMuted },
                                                    selectedHour === h && { fontSize: 22, color: colors.text, fontWeight: '600' },
                                                ]}>
                                                    {h.toString().padStart(2, '0')}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <Text style={[styles.timeSeparator, { color: colors.text }]}>:</Text>

                            {/* Minute Wheel */}
                            <View style={styles.wheelColumn}>
                                <Text style={[styles.wheelLabel, { color: colors.textSecondary }]}>Min</Text>
                                <View style={styles.wheelWrapper}>
                                    <View style={[styles.selectionIndicator, { backgroundColor: colors.card }]} />
                                    <ScrollView
                                        ref={minuteScrollRef}
                                        style={styles.wheel}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={ITEM_HEIGHT}
                                        decelerationRate="fast"
                                        onMomentumScrollEnd={handleMinuteScroll}
                                        contentContainerStyle={styles.wheelContent}
                                    >
                                        {minutes.map((m) => (
                                            <View key={m} style={styles.wheelItem}>
                                                <Text style={[
                                                    styles.wheelItemText,
                                                    { color: colors.textMuted },
                                                    selectedMinute === m && { fontSize: 22, color: colors.text, fontWeight: '600' },
                                                ]}>
                                                    {m.toString().padStart(2, '0')}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
        marginBottom: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '500',
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
    },
    timeDisplay: {
        flex: 1,
    },
    timeValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    timeLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingBottom: Spacing.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    cancelText: {
        fontSize: 16,
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '600',
    },
    presetsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.xs,
        padding: Spacing.md,
    },
    presetButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    presetText: {
        fontSize: 12,
    },
    selectedTimeDisplay: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    selectedTimeText: {
        fontSize: 32,
        fontWeight: '700',
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: Spacing.lg,
    },
    wheelColumn: {
        alignItems: 'center',
    },
    wheelLabel: {
        fontSize: 12,
        marginBottom: Spacing.xs,
        textTransform: 'uppercase',
    },
    wheelWrapper: {
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        overflow: 'hidden',
        position: 'relative',
    },
    selectionIndicator: {
        position: 'absolute',
        top: ITEM_HEIGHT * 2,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        borderRadius: BorderRadius.sm,
        zIndex: -1,
    },
    wheel: {
        width: 80,
    },
    wheelContent: {
        paddingVertical: ITEM_HEIGHT * 2,
    },
    wheelItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelItemText: {
        fontSize: 20,
    },
    timeSeparator: {
        fontSize: 28,
        fontWeight: '600',
        marginHorizontal: Spacing.md,
        marginTop: ITEM_HEIGHT * 2 + 20,
    },
});
