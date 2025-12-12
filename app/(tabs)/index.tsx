/**
 * Home Screen - Habit Tracking
 */

import { HabitCard, Header, SearchBar } from '@/components/habit';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { formatLocalDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_HABITS_SHOWN = 3;

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllHabits, setShowAllHabits] = useState(false);
  const { habits, markHabitDone, toggleDateCompletion } = useHabits();
  const { settings } = useSettings();
  const { colors, isDark } = useTheme();

  const today = formatLocalDate(new Date());

  // Filter habits based on search query
  const searchFilteredHabits = useMemo(() => {
    if (!searchQuery.trim()) return habits;
    return habits.filter(habit =>
      habit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [habits, searchQuery]);

  // Separate incomplete and completed habits for today (completed sorted by streak)
  const { incompleteHabits, completedHabits } = useMemo(() => {
    const incomplete = searchFilteredHabits.filter(habit => !habit.completedDates[today]);
    const completed = searchFilteredHabits
      .filter(habit => habit.completedDates[today])
      .sort((a, b) => b.completedDays - a.completedDays); // Sort by most completed days (streak)
    return { incompleteHabits: incomplete, completedHabits: completed };
  }, [searchFilteredHabits, today]);

  // Determine which habits to display
  const habitsToDisplay = useMemo(() => {
    // If searching, show all matching results
    if (searchQuery.trim()) return searchFilteredHabits;

    // If 3 or fewer habits total, show all of them
    if (habits.length <= MAX_HABITS_SHOWN) return habits;

    // If "View All" is active, show all habits (incomplete first, then completed by streak)
    if (showAllHabits) return [...incompleteHabits, ...completedHabits];

    // Default: show 3 habits - prioritize incomplete, then fill with top completed (by streak)
    const incompleteToShow = incompleteHabits.slice(0, MAX_HABITS_SHOWN);

    // If we have fewer than 3 incomplete, fill with completed (highest streaks)
    if (incompleteToShow.length < MAX_HABITS_SHOWN) {
      const slotsToFill = MAX_HABITS_SHOWN - incompleteToShow.length;
      const completedToShow = completedHabits.slice(0, slotsToFill);
      return [...incompleteToShow, ...completedToShow];
    }

    return incompleteToShow;
  }, [searchQuery, showAllHabits, habits, incompleteHabits, completedHabits, searchFilteredHabits]);

  const hiddenCount = habits.length - habitsToDisplay.length;
  const isSearching = searchQuery.trim().length > 0;
  const shouldShowLimitUI = habits.length > MAX_HABITS_SHOWN;

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: { flex: 1, backgroundColor: colors.background },
    sectionTitle: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
    sectionSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    viewAllButton: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4, backgroundColor: colors.accent, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.md },
    viewAllText: { fontSize: 13, fontWeight: '600' as const, color: colors.background },
    emptyTitle: { fontSize: 20, fontWeight: '600' as const, color: colors.text, marginBottom: Spacing.sm },
    emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' as const },
    showCompletedButton: { marginTop: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: colors.card, borderRadius: BorderRadius.md },
    showCompletedText: { fontSize: 14, fontWeight: '600' as const, color: colors.accent },
    showMorePrompt: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: Spacing.xs, marginHorizontal: Spacing.md, marginBottom: Spacing.md, paddingVertical: Spacing.md, backgroundColor: colors.card, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: colors.cardBorder, borderStyle: 'dashed' as const },
    showMoreText: { fontSize: 14, fontWeight: '600' as const, color: colors.accent },
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <Header
        onCalendarPress={() => router.push('/calendar')}
        onSettingsPress={handleSettingsPress}
      />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Habits List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isSearching ? `Search Results (${habitsToDisplay.length})` : `Your Habits (${habits.length})`}
          </Text>
          {!isSearching && shouldShowLimitUI && (
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: colors.accent }]}
              onPress={() => setShowAllHabits(!showAllHabits)}
            >
              <Text style={[styles.viewAllText, { color: colors.background }]}>
                {showAllHabits ? 'Show Less' : `View All (${habits.length})`}
              </Text>
              <Ionicons
                name={showAllHabits ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.background}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Empty State - only when no habits or no search matches */}
        {habitsToDisplay.length === 0 && (
          <View style={styles.emptyState}>
            {habits.length === 0 ? (
              <>
                <Text style={styles.emptyEmoji}>🎯</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No habits yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Tap the + button below to add your first habit
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No matches found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Try a different search term
                </Text>
              </>
            )}
          </View>
        )}

        {/* Habit Cards */}
        {habitsToDisplay.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onDone={() => markHabitDone(habit.id)}
            onDateToggle={(dateString) => toggleDateCompletion(habit.id, dateString)}
            onAddPhoto={() => console.log('Add Photo:', habit.name)}
          />
        ))}

        {/* Show More Prompt (when limited) */}
        {!isSearching && !showAllHabits && hiddenCount > 0 && (
          <TouchableOpacity
            style={[styles.showMorePrompt, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => setShowAllHabits(true)}
          >
            <Text style={[styles.showMoreText, { color: colors.accent }]}>
              +{hiddenCount} more habit{hiddenCount !== 1 ? 's' : ''}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.accent} />
          </TouchableOpacity>
        )}

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Calendar Modal removed - using route */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  viewAllButtonActive: {
    // Keep same yellow background for "Show Less" state
    backgroundColor: Colors.accent,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.background,
  },
  viewAllTextActive: {
    color: Colors.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  showCompletedButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
  },
  showCompletedText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  showMorePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  bottomPadding: {
    height: 100,
  },
});
