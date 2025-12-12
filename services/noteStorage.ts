/**
 * Note Storage Service
 * AsyncStorage helpers for persisting notes
 */

import { Note, NoteFormData } from '@/types/note';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_STORAGE_KEY = '@habit_notes';

/**
 * Generate a unique note ID
 */
const generateNoteId = (habitId: string, date: string): string => {
    return `${habitId}_${date}`;
};

/**
 * Get all notes from storage
 */
export const getAllNotes = async (): Promise<Record<string, Note>> => {
    try {
        const data = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error getting notes:', error);
        return {};
    }
};

/**
 * Save all notes to storage
 */
const saveAllNotes = async (notes: Record<string, Note>): Promise<void> => {
    try {
        await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
        console.error('Error saving notes:', error);
        throw error;
    }
};

/**
 * Get a specific note by habit ID and date
 */
export const getNote = async (habitId: string, date: string): Promise<Note | null> => {
    const notes = await getAllNotes();
    const noteId = generateNoteId(habitId, date);
    return notes[noteId] || null;
};

/**
 * Get all notes for a specific habit
 */
export const getNotesByHabit = async (habitId: string): Promise<Note[]> => {
    const notes = await getAllNotes();
    return Object.values(notes).filter(note => note.habitId === habitId);
};

/**
 * Save or update a note
 */
export const saveNote = async (
    habitId: string,
    date: string,
    formData: NoteFormData
): Promise<Note> => {
    const notes = await getAllNotes();
    const noteId = generateNoteId(habitId, date);
    const now = new Date().toISOString();

    const existingNote = notes[noteId];

    const note: Note = {
        id: noteId,
        habitId,
        date,
        content: formData.content,
        mood: formData.mood,
        images: formData.images || [],
        tags: formData.tags,
        createdAt: existingNote?.createdAt || now,
        updatedAt: now,
    };

    notes[noteId] = note;
    await saveAllNotes(notes);

    return note;
};

/**
 * Delete a note
 */
export const deleteNote = async (habitId: string, date: string): Promise<void> => {
    const notes = await getAllNotes();
    const noteId = generateNoteId(habitId, date);

    if (notes[noteId]) {
        delete notes[noteId];
        await saveAllNotes(notes);
    }
};

/**
 * Check if a note exists for a specific habit and date
 */
export const hasNote = async (habitId: string, date: string): Promise<boolean> => {
    const note = await getNote(habitId, date);
    return note !== null && note.content.trim().length > 0;
};

/**
 * Clear all notes from storage
 */
export const clearAllNotes = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing notes:', error);
        throw error;
    }
};
