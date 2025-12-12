/**
 * Date Utilities
 * Helper functions for consistent local date handling
 */

/**
 * Formats a Date object to a local YYYY-MM-DD string
 * This avoids the UTC conversion issues with toISOString()
 * which can shift dates in timezones ahead of UTC
 */
export const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Gets today's date as a local YYYY-MM-DD string
 */
export const getTodayLocal = (): string => {
    return formatLocalDate(new Date());
};
