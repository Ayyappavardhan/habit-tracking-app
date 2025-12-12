import { CalendarModal } from '@/components/calendar';
import { useRouter } from 'expo-router';
import React from 'react';

export default function CalendarScreen() {
    const router = useRouter();

    return (
        <CalendarModal
            visible={true}
            onClose={() => router.back()}
        />
    );
}
