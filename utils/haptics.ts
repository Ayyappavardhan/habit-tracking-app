/**
 * Haptics Utility
 * Cross-platform haptic feedback for iOS and Android
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback types for different interactions
 */
export type HapticFeedbackType =
    | 'light'      // Subtle feedback for small UI elements
    | 'medium'     // Standard feedback for buttons and toggles
    | 'heavy'      // Strong feedback for important actions
    | 'success'    // Positive feedback for completed actions
    | 'warning'    // Alert feedback for cautionary actions
    | 'error'      // Negative feedback for errors
    | 'selection'; // Selection change feedback

/**
 * Trigger haptic feedback based on the type of interaction
 * Works on both iOS and Android
 * 
 * @param type - The type of haptic feedback to trigger
 */
export async function triggerHaptic(type: HapticFeedbackType = 'medium'): Promise<void> {
    // Haptics work on native platforms only
    if (Platform.OS === 'web') {
        return;
    }

    try {
        switch (type) {
            case 'light':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;

            case 'medium':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;

            case 'heavy':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;

            case 'success':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;

            case 'warning':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                break;

            case 'error':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;

            case 'selection':
                await Haptics.selectionAsync();
                break;

            default:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    } catch (error) {
        // Silently fail if haptics aren't available
        console.log('Haptics not available:', error);
    }
}

/**
 * Convenience functions for common haptic feedback patterns
 */
export const haptics = {
    /** Light tap feedback for subtle interactions */
    light: () => triggerHaptic('light'),

    /** Medium impact for button presses */
    medium: () => triggerHaptic('medium'),

    /** Heavy impact for important actions */
    heavy: () => triggerHaptic('heavy'),

    /** Success notification for completed actions */
    success: () => triggerHaptic('success'),

    /** Warning notification for cautionary actions */
    warning: () => triggerHaptic('warning'),

    /** Error notification for failed actions */
    error: () => triggerHaptic('error'),

    /** Selection feedback for picker/toggle changes */
    selection: () => triggerHaptic('selection'),

    /** Habit completion feedback - success with impact */
    habitComplete: () => triggerHaptic('success'),

    /** Habit uncomplete feedback - light impact */
    habitUncomplete: () => triggerHaptic('light'),

    /** Tab/navigation change */
    tabChange: () => triggerHaptic('light'),

    /** Modal open/close */
    modal: () => triggerHaptic('medium'),

    /** Delete action confirmation */
    delete: () => triggerHaptic('warning'),
};

export default haptics;
