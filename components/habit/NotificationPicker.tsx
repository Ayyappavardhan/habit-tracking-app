/**
 * Notification Picker Component
 * Modern bottom-sheet style picker for habit reminders
 * Features sleek time selection and intuitive day pickers
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface NotificationPickerProps {
    enabled: boolean;
    time: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    day?: number; // For weekly: 1-7 (Sun-Sat), for monthly: 1-31
    onToggle: (enabled: boolean) => void;
    onTimeChange: (time: string) => void;
    onDayChange?: (day: number) => void;
}

// Helper to get the appropriate reminder label based on frequency
const getReminderLabel = (frequency?: string): string => {
    switch (frequency) {
        case 'weekly':
            return 'Weekly Reminder';
        case 'monthly':
            return 'Monthly Reminder';
        default:
            return 'Daily Reminder';
    }
};

// Days of the week
const WEEKDAYS = [
    { value: 1, label: 'S', fullLabel: 'Sunday' },
    { value: 2, label: 'M', fullLabel: 'Monday' },
    { value: 3, label: 'T', fullLabel: 'Tuesday' },
    { value: 4, label: 'W', fullLabel: 'Wednesday' },
    { value: 5, label: 'T', fullLabel: 'Thursday' },
    { value: 6, label: 'F', fullLabel: 'Friday' },
    { value: 7, label: 'S', fullLabel: 'Saturday' },
];

// Days of the month (1-31)
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const ITEM_HEIGHT = 50; // Taller items for better touch targets
const VISIBLE_ITEMS = 3; // Fewer visible items for cleaner look

// Generate hours 0-23
const hours = Array.from({ length: 24 }, (_, i) => i);
// Generate minutes 0-55 (5-min increments)
const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

export default function NotificationPicker({
    enabled,
    time,
    frequency,
    day,
    onToggle,
    onTimeChange,
    onDayChange
}: NotificationPickerProps) {
    const { colors } = useTheme();
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedHour, setSelectedHour] = useState(parseInt(time.split(':')[0]) || 9);
    const [selectedMinute, setSelectedMinute] = useState(parseInt(time.split(':')[1]) || 0);
    const [selectedDay, setSelectedDay] = useState(day || (frequency === 'weekly' ? 1 : 1));

    const hourScrollRef = useRef<ScrollView>(null);
    const minuteScrollRef = useRef<ScrollView>(null);
    const monthDayScrollRef = useRef<ScrollView>(null);

    // Sync local state with props
    useEffect(() => {
        const [h, m] = time.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
            setSelectedHour(h);
            setSelectedMinute(m);
        }
    }, [time]);

    useEffect(() => {
        if (day !== undefined) {
            setSelectedDay(day);
        } else {
            setSelectedDay(frequency === 'weekly' ? 1 : 1);
        }
    }, [day, frequency]);

    const formatTime = (h: number, m: number) => {
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h < 12 ? 'AM' : 'PM';
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const getWeekdayLabel = (weekday: number) => {
        const day = WEEKDAYS.find(w => w.value === weekday);
        return day ? day.fullLabel : 'Sunday';
    };

    const getMonthDayLabel = (d: number) => {
        const suffix = d === 1 || d === 21 || d === 31 ? 'st'
            : d === 2 || d === 22 ? 'nd'
                : d === 3 || d === 23 ? 'rd'
                    : 'th';
        return `${d}${suffix} of month`;
    };

    const getDisplayInfo = () => {
        const timeStr = formatTime(selectedHour, selectedMinute);
        if (frequency === 'weekly') {
            return `${getWeekdayLabel(selectedDay)}, ${timeStr}`;
        } else if (frequency === 'monthly') {
            return `${getMonthDayLabel(selectedDay)} at ${timeStr}`;
        }
        return timeStr;
    };

    const handleOpenPicker = () => {
        setShowTimePicker(true);
        // Scroll to initial values
        setTimeout(() => {
            scrollToValue(hourScrollRef, selectedHour, hours);
            scrollToValue(minuteScrollRef, selectedMinute, minutes, 5);
        }, 100);
    };

    const scrollToValue = (ref: React.RefObject<ScrollView>, value: number, data: number[], step = 1) => {
        const index = data.findIndex(item => item === value);
        if (index !== -1 && ref.current) {
            ref.current.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
        }
    };

    const handleScroll = (
        event: NativeSyntheticEvent<NativeScrollEvent>,
        data: number[],
        setter: (val: number) => void
    ) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (index >= 0 && index < data.length) {
            setter(data[index]);
        }
    };

    const handleConfirm = () => {
        const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
        onTimeChange(timeString);
        if (onDayChange && (frequency === 'weekly' || frequency === 'monthly')) {
            onDayChange(selectedDay);
        }
        setShowTimePicker(false);
    };

    return (
        <View style={styles.container}>
            {/* Main Toggle Row */}
            <TouchableOpacity
                style={[styles.mainCard, { backgroundColor: colors.card }]}
                onPress={() => enabled && handleOpenPicker()}
                activeOpacity={enabled ? 0.7 : 1}
            >
                <View style={styles.headerRow}>
                    <View style={styles.labelContainer}>
                        <View style={[styles.iconBadge, { backgroundColor: enabled ? colors.accent : colors.cardBorder }]}>
                            <Ionicons name="notifications" size={16} color={enabled ? colors.background : colors.textSecondary} />
                        </View>
                        <View>
                            <Text style={[styles.label, { color: colors.text }]}>
                                {getReminderLabel(frequency)}
                            </Text>
                            {enabled && (
                                <Text style={[styles.subLabel, { color: colors.accent }]}>
                                    {getDisplayInfo()}
                                </Text>
                            )}
                        </View>
                    </View>
                    <Switch
                        value={enabled}
                        onValueChange={onToggle}
                        trackColor={{ false: colors.cardBorder, true: colors.accent }}
                        thumbColor={colors.text}
                    />
                </View>
            </TouchableOpacity>

            {/* Bottom Sheet Modal */}
            <Modal
                visible={showTimePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTimePicker(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Set Reminder
                        </Text>
                        <TouchableOpacity
                            style={[styles.doneButton, { backgroundColor: colors.accent }]}
                            onPress={handleConfirm}
                        >
                            <Ionicons name="checkmark" size={24} color={colors.background} />
                        </TouchableOpacity>
                    </View>

                    {/* Section: Frequency Specific Pickers */}
                    <View style={styles.pickerBody}>

                        {/* Weekly: Modern Circular Days */}
                        {frequency === 'weekly' && (
                            <View style={styles.sectionContainer}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>REPEAT ON</Text>
                                <View style={styles.weekdaysRow}>
                                    {WEEKDAYS.map((weekday) => {
                                        const isSelected = selectedDay === weekday.value;
                                        return (
                                            <TouchableOpacity
                                                key={weekday.value}
                                                style={[
                                                    styles.weekdayBubble,
                                                    { backgroundColor: isSelected ? colors.accent : colors.card },
                                                    isSelected && styles.shadow
                                                ]}
                                                onPress={() => setSelectedDay(weekday.value)}
                                            >
                                                <Text style={[
                                                    styles.weekdayText,
                                                    { color: isSelected ? colors.background : colors.textSecondary },
                                                    isSelected && { fontWeight: '700' }
                                                ]}>
                                                    {weekday.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Monthly: Horizontal Day Strip */}
                        {frequency === 'monthly' && (
                            <View style={styles.sectionContainer}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DAY OF MONTH</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.monthStripContent}
                                >
                                    {MONTH_DAYS.map((d) => {
                                        const isSelected = selectedDay === d;
                                        return (
                                            <TouchableOpacity
                                                key={d}
                                                style={[
                                                    styles.monthDayItem,
                                                    {
                                                        backgroundColor: isSelected ? colors.accent : colors.card,
                                                        borderColor: isSelected ? colors.accent : colors.cardBorder
                                                    }
                                                ]}
                                                onPress={() => setSelectedDay(d)}
                                            >
                                                <Text style={[
                                                    styles.monthDayText,
                                                    { color: isSelected ? colors.background : colors.text },
                                                    isSelected && { fontWeight: '700' }
                                                ]}>{d}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}

                        {/* Time Picker Wheel */}
                        <View style={styles.timeSection}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TIME</Text>
                            <View style={styles.timePickerContainer}>
                                {/* Highlight Bar */}
                                <View style={[styles.highlightBar, { backgroundColor: colors.card }]} />

                                <ScrollView
                                    ref={hourScrollRef}
                                    style={styles.wheel}
                                    contentContainerStyle={styles.wheelContent}
                                    snapToInterval={ITEM_HEIGHT}
                                    decelerationRate="fast"
                                    showsVerticalScrollIndicator={false}
                                    onMomentumScrollEnd={(e) => handleScroll(e, hours, setSelectedHour)}
                                >
                                    {hours.map((h) => (
                                        <View key={h} style={styles.wheelItem}>
                                            <Text style={[
                                                styles.wheelText,
                                                { color: selectedHour === h ? colors.text : colors.textMuted },
                                                selectedHour === h && styles.activeTimeText
                                            ]}>
                                                {h.toString().padStart(2, '0')}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                <Text style={[styles.colon, { color: colors.text }]}>:</Text>

                                <ScrollView
                                    ref={minuteScrollRef}
                                    style={styles.wheel}
                                    contentContainerStyle={styles.wheelContent}
                                    snapToInterval={ITEM_HEIGHT}
                                    decelerationRate="fast"
                                    showsVerticalScrollIndicator={false}
                                    onMomentumScrollEnd={(e) => handleScroll(e, minutes, setSelectedMinute)}
                                >
                                    {minutes.map((m) => (
                                        <View key={m} style={styles.wheelItem}>
                                            <Text style={[
                                                styles.wheelText,
                                                { color: selectedMinute === m ? colors.text : colors.textMuted },
                                                selectedMinute === m && styles.activeTimeText
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
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },
    mainCard: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    subLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    doneButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },

    pickerBody: {
        paddingHorizontal: Spacing.lg,
    },
    sectionContainer: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        opacity: 0.7,
    },

    // Weekly Styles
    weekdaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    weekdayBubble: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    weekdayText: {
        fontSize: 14,
        fontWeight: '600',
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    // Monthly Styles
    monthStripContent: {
        paddingVertical: Spacing.xs,
        gap: Spacing.sm,
    },
    monthDayItem: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    monthDayText: {
        fontSize: 16,
        fontWeight: '600',
    },

    // Time Picker Styless
    timeSection: {
        alignItems: 'center',
    },
    timePickerContainer: {
        flexDirection: 'row',
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        position: 'relative',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    highlightBar: {
        position: 'absolute',
        top: ITEM_HEIGHT, // Middle position (since VISIBLE_ITEMS is 3, middle is index 1)
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        borderRadius: BorderRadius.md,
    },
    wheel: {
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        width: 80,
    },
    wheelContent: {
        paddingVertical: ITEM_HEIGHT, // Padding to allow first item to be in middle
    },
    wheelItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelText: {
        fontSize: 24,
        fontWeight: '400',
    },
    activeTimeText: {
        fontSize: 28,
        fontWeight: '700',
    },
    colon: {
        fontSize: 24,
        fontWeight: '700',
        marginHorizontal: Spacing.sm,
        paddingBottom: 4,
    },
});
