import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { HabitProvider } from '@/context/HabitContext';
import { NoteProvider } from '@/context/NoteContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';

// Keep splash screen visible while we load
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const { settings, loading } = useSettings();
  const isDark = settings.theme === 'dark';
  const segments = useSegments();
  const router = useRouter();

  // Hide splash screen once loaded
  const onLayoutRootView = useCallback(async () => {
    if (!loading) {
      await SplashScreen.hideAsync();
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      onLayoutRootView();
    }
  }, [loading, onLayoutRootView]);

  useEffect(() => {
    if (loading) return;

    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!settings.hasCompletedOnboarding && !inOnboardingGroup) {
      // If user hasn't completed onboarding and isn't already in the onboarding group, redirect them
      router.replace('/onboarding');
    } else if (settings.hasCompletedOnboarding && inOnboardingGroup) {
      // If user has completed onboarding but is trying to access onboarding, redirect to home
      router.replace('/(tabs)');
    }
  }, [settings.hasCompletedOnboarding, loading, segments]);

  if (loading) {
    // Show black background matching splash screen while loading
    return <View style={styles.loadingContainer} />;
  }

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen
            name="add-note"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="edit-habit"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="calendar"
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <HabitProvider>
        <NoteProvider>
          <AppContent />
        </NoteProvider>
      </HabitProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D', // Match splash screen background
  },
});
