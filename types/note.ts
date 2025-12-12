/**
 * Note Types
 * Types for habit notes/journaling feature
 */

export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export const MoodEmojis: Record<MoodType, string> = {
    great: '😊',
    good: '🙂',
    okay: '😐',
    bad: '😔',
    terrible: '😢',
};

export interface NoteImage {
    id: string;
    uri: string;
    createdAt: string;
}

export interface Note {
    id: string;
    habitId: string;
    date: string; // YYYY-MM-DD format
    content: string;
    mood?: MoodType;
    images?: NoteImage[];
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface NoteFormData {
    content: string;
    mood?: MoodType;
    images?: NoteImage[];
    tags?: string[];
}
