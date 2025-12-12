/**
 * Note Editor Component
 * Rich text editor with auto-save functionality
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    TextInput,
    TextInputSelectionChangeEventData,
    View
} from 'react-native';

interface NoteEditorProps {
    content: string;
    placeholder?: string;
    onContentChange: (content: string) => void;
    autoFocus?: boolean;
}

export interface NoteEditorRef {
    insertText: (textToInsert: string) => void;
    wrapSelection: (prefix: string, suffix: string) => void;
}

const NoteEditor = forwardRef<NoteEditorRef, NoteEditorProps>(({
    content,
    placeholder = 'Write your thoughts here...',
    onContentChange,
    autoFocus = true,
}, ref) => {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

    // Track selection changes
    const handleSelectionChange = useCallback((event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
        selectionRef.current = event.nativeEvent.selection;
    }, []);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        insertText: (textToInsert: string) => {
            const { start, end } = selectionRef.current;
            const before = content.substring(0, start);
            const after = content.substring(end);
            const newContent = before + textToInsert + after;
            onContentChange(newContent);

            // Update cursor position after insertion
            const newCursorPos = start + textToInsert.length;
            selectionRef.current = { start: newCursorPos, end: newCursorPos };
        },
        wrapSelection: (prefix: string, suffix: string) => {
            const { start, end } = selectionRef.current;
            const before = content.substring(0, start);
            const selected = content.substring(start, end);
            const after = content.substring(end);

            // If no selection, just insert the prefix+suffix with cursor in between
            if (start === end) {
                const newContent = before + prefix + suffix + after;
                onContentChange(newContent);
                const newCursorPos = start + prefix.length;
                selectionRef.current = { start: newCursorPos, end: newCursorPos };
            } else {
                // Wrap the selected text
                const newContent = before + prefix + selected + suffix + after;
                onContentChange(newContent);
                const newStart = start + prefix.length;
                const newEnd = end + prefix.length;
                selectionRef.current = { start: newStart, end: newEnd };
            }
        },
    }), [content, onContentChange]);

    return (
        <View style={styles.container}>
            <TextInput
                ref={inputRef}
                style={[
                    styles.textInput,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder },
                    isFocused && { borderColor: colors.accent },
                ]}
                value={content}
                onChangeText={onContentChange}
                onSelectionChange={handleSelectionChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                autoFocus={autoFocus}
                scrollEnabled
                keyboardAppearance={isDark ? 'dark' : 'light'}
                returnKeyType="default"
                blurOnSubmit={false}
            />

            {/* Character count */}
            <View style={styles.footer}>
                <Text style={[styles.charCount, { color: colors.textMuted }]}>
                    {content.length} characters
                </Text>
            </View>
        </View>
    );
});

export default NoteEditor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textInput: {
        flex: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: 16,
        lineHeight: 24,
        borderWidth: 1,
        minHeight: 200,
    },
    footer: {
        paddingTop: Spacing.sm,
        alignItems: 'flex-end',
    },
    charCount: {
        fontSize: 12,
    },
});

