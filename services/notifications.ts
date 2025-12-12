/**
 * Notification Service
 * Handles scheduling and canceling habit reminders
 * 
 * Note: Notifications are not supported on web platform.
 * All functions gracefully return no-op values on web.
 */

import { FrequencyType, Habit } from '@/types/habit';
import { Alert, Platform } from 'react-native';

// Check if we're on web - notifications not supported
const isWeb = Platform.OS === 'web';

// iOS limits scheduled local notifications to 64
export const IOS_NOTIFICATION_LIMIT = 64;
const IOS_WARNING_THRESHOLD = 55; // Warn when approaching limit

// Type imports for proper TypeScript support
type NotificationsModule = typeof import('expo-notifications');
type DeviceModule = typeof import('expo-device');

// Lazy load the modules only on native
let _Notifications: NotificationsModule | null = null;
let _Device: DeviceModule | null = null;

function getNotifications(): NotificationsModule | null {
    if (isWeb) return null;
    if (!_Notifications) {
        _Notifications = require('expo-notifications');
    }
    return _Notifications;
}

function getDevice(): DeviceModule | null {
    if (isWeb) return null;
    if (!_Device) {
        _Device = require('expo-device');
    }
    return _Device;
}

// Initialize notification handler on native platforms
if (!isWeb) {
    const Notifications = getNotifications();
    if (Notifications) {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    if (isWeb) {
        console.log('Notifications not supported on web');
        return false;
    }

    const Device = getDevice();
    const Notifications = getNotifications();

    if (!Device || !Notifications) {
        return false;
    }

    if (!Device.isDevice) {
        console.log('Notifications require a physical device');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
    }

    // Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('habit-reminders', {
            name: 'Habit Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FFD700',
        });
    }

    return true;
}

/**
 * Schedule a daily habit reminder
 */
export async function scheduleHabitReminder(
    habitId: string,
    habitName: string,
    habitEmoji: string,
    time: string, // HH:MM format
    frequency: FrequencyType
): Promise<string | null> {
    if (isWeb) {
        console.log('Notifications not supported on web');
        return null;
    }

    const Notifications = getNotifications();
    if (!Notifications) return null;

    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return null;

        const [hours, minutes] = time.split(':').map(Number);

        let trigger: import('expo-notifications').NotificationTriggerInput;

        if (frequency === 'daily') {
            trigger = {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hours,
                minute: minutes,
            };
        } else if (frequency === 'weekly') {
            // For weekly, we'll default to the current day
            trigger = {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: new Date().getDay() + 1, // 1-7 for Sunday-Saturday
                hour: hours,
                minute: minutes,
            };
        } else {
            // Monthly - schedule for the same date next month
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextDate.setHours(hours, minutes, 0, 0);
            trigger = {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: nextDate,
            };
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: `${habitEmoji} Time for ${habitName}!`,
                body: "Don't break your streak! Complete your habit now.",
                data: { habitId },
                sound: true,
            },
            trigger,
        });

        console.log(`Scheduled notification ${notificationId} for ${habitName}`);
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
    if (isWeb) return;

    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`Cancelled notification ${notificationId}`);
    } catch (error) {
        console.error('Error cancelling notification:', error);
    }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    if (isWeb) return;

    const Notifications = getNotifications();
    if (!Notifications) return;

    await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get count of currently scheduled notifications
 */
export async function getScheduledNotificationCount(): Promise<number> {
    if (isWeb) return 0;

    const Notifications = getNotifications();
    if (!Notifications) return 0;

    try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        return scheduled.length;
    } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        return 0;
    }
}

/**
 * Check if approaching iOS notification limit and show warning
 * Returns true if we can still schedule, false if at limit
 */
export async function checkNotificationLimitWarning(): Promise<boolean> {
    if (isWeb) return true;

    const count = await getScheduledNotificationCount();

    if (Platform.OS === 'ios') {
        if (count >= IOS_NOTIFICATION_LIMIT) {
            Alert.alert(
                'Notification Limit Reached',
                `iOS allows a maximum of ${IOS_NOTIFICATION_LIMIT} scheduled notifications. Please disable notifications for some habits to add more.`,
                [{ text: 'OK' }]
            );
            return false;
        }

        if (count >= IOS_WARNING_THRESHOLD) {
            Alert.alert(
                'Approaching Notification Limit',
                `You have ${count} scheduled notifications. iOS allows a maximum of ${IOS_NOTIFICATION_LIMIT}.`,
                [{ text: 'OK' }]
            );
        }
    }

    return true;
}

/**
 * Re-schedule all habit notifications
 * Call this on app launch to restore notifications after app restart
 */
export async function rescheduleAllHabitNotifications(
    habits: Habit[]
): Promise<Map<string, string>> {
    const notificationMap = new Map<string, string>();

    if (isWeb) return notificationMap;

    const Notifications = getNotifications();
    if (!Notifications) return notificationMap;

    console.log('Re-scheduling notifications for all habits...');

    // First, cancel all existing notifications to avoid duplicates
    await cancelAllNotifications();

    // Schedule notifications for each habit that has them enabled
    for (const habit of habits) {
        if (habit.notificationEnabled && habit.notificationTime) {
            const notificationId = await scheduleHabitReminder(
                habit.id,
                habit.name,
                habit.icon,
                habit.notificationTime,
                habit.frequency
            );

            if (notificationId) {
                notificationMap.set(habit.id, notificationId);
            }
        }
    }

    console.log(`Re-scheduled ${notificationMap.size} notifications`);
    return notificationMap;
}
