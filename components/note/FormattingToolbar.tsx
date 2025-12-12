/**
 * Formatting Toolbar Component
 * Bottom toolbar with text formatting options
 */

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FormattingToolbarProps {
    onBold?: () => void;
    onItalic?: () => void;
    onBulletList?: () => void;
    onHeading?: () => void;
    onLink?: () => void;
}

interface ToolbarButton {
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    label: string;
}

export default function FormattingToolbar({
    onBold,
    onItalic,
    onBulletList,
    onHeading,
    onLink,
}: FormattingToolbarProps) {
    const buttons: ToolbarButton[] = [
        { icon: 'text', onPress: onBold, label: 'Bold' },
        { icon: 'text-outline', onPress: onItalic, label: 'Italic' },
        { icon: 'list', onPress: onBulletList, label: 'Bullet List' },
        { icon: 'reorder-four', onPress: onHeading, label: 'Heading' },
        { icon: 'link', onPress: onLink, label: 'Link' },
    ];

    return (
        <View style={styles.container}>
            {buttons.map((button) => (
                <TouchableOpacity
                    key={button.label}
                    style={styles.button}
                    onPress={button.onPress}
                    activeOpacity={0.7}
                    accessibilityLabel={button.label}
                >
                    <Ionicons
                        name={button.icon}
                        size={20}
                        color={Colors.textSecondary}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.cardBorder,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
