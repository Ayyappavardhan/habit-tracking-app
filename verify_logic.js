
// Simulation of the monthly notification scheduling logic
function simulateMonthlyScheduling(dayOfMonth, currentMonth, currentYear) {
    console.log(`\n--- Simulating Monthly Schedule for Day ${dayOfMonth} starting ${currentMonth}/${currentYear} ---`);

    // Schedule for next 3 months
    for (let i = 0; i <= 3; i++) {
        let targetYear = currentYear;
        let targetMonth = currentMonth + i;

        // Adjust for year rollover
        if (targetMonth > 11) {
            targetYear += Math.floor(targetMonth / 12);
            targetMonth = targetMonth % 12;
        }

        // Get days in month
        // day 0 of next month = last day of current month
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

        // Logic from notifications.ts
        const actualDay = Math.min(dayOfMonth, daysInMonth);

        const targetDate = new Date(targetYear, targetMonth, actualDay);

        console.log(`Month offset ${i}: Target ${targetMonth + 1}/${targetYear} (Days in month: ${daysInMonth}) -> Scheduled for Day ${actualDay}`);
    }
}

const now = new Date();
const currentMonth = now.getMonth(); // 0-based
const currentYear = now.getFullYear();

// Test Case 1: 31st of the month
simulateMonthlyScheduling(31, currentMonth, currentYear);

// Test Case 2: 30th of the month
simulateMonthlyScheduling(30, currentMonth, currentYear);

// Test Case 3: 15th of the month
simulateMonthlyScheduling(15, currentMonth, currentYear);
