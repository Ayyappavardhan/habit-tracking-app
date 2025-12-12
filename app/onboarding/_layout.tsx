import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="features" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="privacy" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="first-habit" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="completion" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
    );
}
