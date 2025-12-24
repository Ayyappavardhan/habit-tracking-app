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

// Fixed identifier for the app-wide daily reminder
const APP_REMINDER_IDENTIFIER = 'app-daily-reminder';

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
 * Schedule monthly notifications for the next 3 months
 * Since expo-notifications doesn't have a native monthly repeat trigger,
 * we schedule individual notifications for each upcoming month.
 * This function should be called on app launch to refresh the schedule.
 */
async function scheduleMonthlyNotifications(
    habitId: string,
    habitName: string,
    habitEmoji: string,
    hours: number,
    minutes: number,
    dayOfMonth: number, // 1-31
    Notifications: NotificationsModule
): Promise<string | null> {
    const notificationIds: string[] = [];
    const now = new Date();

    // Schedule for the next 3 months
    for (let i = 0; i <= 3; i++) {
        // Calculate the target year and month
        let targetYear = now.getFullYear();
        let targetMonth = now.getMonth() + i;

        // Adjust for year rollover
        if (targetMonth > 11) {
            targetYear += Math.floor(targetMonth / 12);
            targetMonth = targetMonth % 12;
        }

        // Get the number of days in the target month (day 0 of next month gives last day of current)
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

        // The actual day to schedule is the lesser of the user's selected day or the last day of the month
        // Example: User chose 31st. Feb has 28 days. Math.min(31, 28) = 28.
        const actualDay = Math.min(dayOfMonth, daysInMonth);

        const targetDate = new Date(targetYear, targetMonth, actualDay, hours, minutes, 0, 0);

        // Only schedule if the date is in the future
        if (targetDate > now) {
            try {
                const notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `${habitEmoji} Monthly reminder: ${habitName}!`,
                        body: "Don't forget your monthly habit!",
                        data: { habitId, isMonthly: true },
                        sound: true,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: targetDate,
                    },
                });
                notificationIds.push(notificationId);
                console.log(`Scheduled monthly notification for ${targetDate.toDateString()}: ${notificationId}`);
            } catch (error) {
                console.error(`Error scheduling monthly notification for month ${i}:`, error);
            }
        }
    }

    // Return the first notification ID for tracking (or null if none scheduled)
    return notificationIds.length > 0 ? notificationIds[0] : null;
}

/**
 * Schedule a habit reminder
 */
export async function scheduleHabitReminder(
    habitId: string,
    habitName: string,
    habitEmoji: string,
    time: string, // HH:MM format
    frequency: FrequencyType,
    day?: number // For weekly: 1-7 (Sun-Sat), for monthly: 1-31
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
            // Weekly: Use user-selected weekday or default to Sunday (1)
            const weekday = day || 1; // 1=Sunday, 7=Saturday
            trigger = {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: weekday,
                hour: hours,
                minute: minutes,
            };
        } else {
            // Monthly: Schedule notifications for the next 3 months on the selected day
            const dayOfMonth = day || 1; // Default to 1st of month
            return await scheduleMonthlyNotifications(habitId, habitName, habitEmoji, hours, minutes, dayOfMonth, Notifications);
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
                habit.frequency,
                habit.notificationDay
            );

            if (notificationId) {
                notificationMap.set(habit.id, notificationId);
            }
        }
    }

    console.log(`Re-scheduled ${notificationMap.size} notifications`);
    return notificationMap;
}

/**
 * Schedule the app-wide daily reminder notification
 * This is a single daily notification reminding users to check their habits
 */
export async function scheduleAppDailyReminder(time: string): Promise<boolean> {
    if (isWeb) {
        console.log('Notifications not supported on web');
        return false;
    }

    const Notifications = getNotifications();
    if (!Notifications) return false;

    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return false;

        // Cancel existing app reminder first to avoid duplicates
        await cancelAppDailyReminder();

        const [hours, minutes] = time.split(':').map(Number);

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '🌟 Time to check your habits!',
                body: "Stay consistent and build your streak. You've got this!",
                data: { type: 'app-reminder' },
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hours,
                minute: minutes,
            },
            identifier: APP_REMINDER_IDENTIFIER,
        });

        console.log(`Scheduled app daily reminder at ${time} with ID: ${notificationId}`);
        return true;
    } catch (error) {
        console.error('Error scheduling app daily reminder:', error);
        return false;
    }
}

/**
 * Cancel the app-wide daily reminder notification
 */
export async function cancelAppDailyReminder(): Promise<void> {
    if (isWeb) return;

    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        await Notifications.cancelScheduledNotificationAsync(APP_REMINDER_IDENTIFIER);
        console.log('Cancelled app daily reminder');
    } catch (error) {
        // Ignore error if notification doesn't exist
        console.log('No app daily reminder to cancel');
    }
}



/**
 * Get debug info about the current notification status
 */
export async function getNotificationDebugInfo(): Promise<{
    platform: string;
    isWeb: boolean;
    isDevice: boolean;
    permissionStatus: string;
    scheduledCount: number;
    scheduledNotifications: Array<{ id: string; title?: string; trigger?: unknown }>;
}> {
    const platform = Platform.OS;

    if (isWeb) {
        return {
            platform,
            isWeb: true,
            isDevice: false,
            permissionStatus: 'not_available',
            scheduledCount: 0,
            scheduledNotifications: [],
        };
    }

    const Device = getDevice();
    const Notifications = getNotifications();

    if (!Device || !Notifications) {
        return {
            platform,
            isWeb: false,
            isDevice: false,
            permissionStatus: 'not_available',
            scheduledCount: 0,
            scheduledNotifications: [],
        };
    }

    const { status } = await Notifications.getPermissionsAsync();
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    return {
        platform,
        isWeb: false,
        isDevice: Device.isDevice,
        permissionStatus: status,
        scheduledCount: scheduled.length,
        scheduledNotifications: scheduled.map((n) => ({
            id: n.identifier,
            title: n.content.title || undefined,
            trigger: n.trigger,
        })),
    };
}
