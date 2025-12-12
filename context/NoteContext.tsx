/**
 * Note Context
 * Global state management for notes
 */

import * as noteStorage from '@/services/noteStorage';
import { Note, NoteFormData } from '@/types/note';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface NoteContextType {
    notes: Record<string, Note>;
    loading: boolean;
    getNote: (habitId: string, date: string) => Note | null;
    saveNote: (habitId: string, date: string, formData: NoteFormData) => Promise<Note>;
    deleteNote: (habitId: string, date: string) => Promise<void>;
    hasNote: (habitId: string, date: string) => boolean;
    refreshNotes: () => Promise<void>;
    clearAllNotes: () => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: ReactNode }) {
    const [notes, setNotes] = useState<Record<string, Note>>({});
    const [loading, setLoading] = useState(true);

    // Load notes on mount
    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        setLoading(true);
        try {
            const allNotes = await noteStorage.getAllNotes();
            setNotes(allNotes);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshNotes = useCallback(async () => {
        await loadNotes();
    }, []);

    const getNote = useCallback((habitId: string, date: string): Note | null => {
        const noteId = `${habitId}_${date}`;
        return notes[noteId] || null;
    }, [notes]);

    const saveNoteHandler = useCallback(async (
        habitId: string,
        date: string,
        formData: NoteFormData
    ): Promise<Note> => {
        const savedNote = await noteStorage.saveNote(habitId, date, formData);
        setNotes(prev => ({
            ...prev,
            [savedNote.id]: savedNote,
        }));
        return savedNote;
    }, []);

    const deleteNoteHandler = useCallback(async (habitId: string, date: string): Promise<void> => {
        await noteStorage.deleteNote(habitId, date);
        const noteId = `${habitId}_${date}`;
        setNotes(prev => {
            const updated = { ...prev };
            delete updated[noteId];
            return updated;
        });
    }, []);

    const hasNote = useCallback((habitId: string, date: string): boolean => {
        const noteId = `${habitId}_${date}`;
        const note = notes[noteId];
        return note !== undefined && note.content.trim().length > 0;
    }, [notes]);

    const clearAllNotesHandler = useCallback(async (): Promise<void> => {
        await noteStorage.clearAllNotes();
        setNotes({});
    }, []);

    return (
        <NoteContext.Provider value={{
            notes,
            loading,
            getNote,
            saveNote: saveNoteHandler,
            deleteNote: deleteNoteHandler,
            hasNote,
            refreshNotes,
            clearAllNotes: clearAllNotesHandler,
        }}>
            {children}
        </NoteContext.Provider>
    );
}

export function useNotes() {
    const context = useContext(NoteContext);
    if (!context) {
        throw new Error('useNotes must be used within a NoteProvider');
    }
    return context;
}
