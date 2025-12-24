/**
 * Icon Picker Component
 * Modern icon picker modal with Phosphor Icons
 * Matching the sleek circular grid design
 */

import { iconCategories } from '@/constants/iconData';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import * as haptics from 'expo-haptics';
import * as PhosphorIcons from 'phosphor-react-native';
import { X } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface IconPickerProps {
    visible: boolean;
    selectedIcon: string;
    onSelect: (iconName: string) => void;
    onClose: () => void;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const ICON_CONTAINER_SIZE = 56;
const ICONS_PER_ROW = 4;
const GRID_GAP = 12;

// Dynamic icon rendering helper
const renderIcon = (iconName: string, size: number, color: string, weight: 'regular' | 'fill' = 'regular') => {
    const IconComponent = (PhosphorIcons as any)[iconName];
    if (IconComponent) {
        return <IconComponent size={size} color={color} weight={weight} />;
    }
    // Fallback to Star if icon not found
    return <PhosphorIcons.Star size={size} color={color} weight={weight} />;
};

export default function IconPicker({
    visible,
    selectedIcon,
    onSelect,
    onClose,
}: IconPickerProps) {
    const { colors, isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [tooltipIcon, setTooltipIcon] = useState<string | null>(null);

    // Filter icons based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) {
            return iconCategories;
        }

        const query = searchQuery.toLowerCase();
        return iconCategories
            .map(category => ({
                ...category,
                icons: category.icons.filter(icon =>
                    icon.toLowerCase().includes(query)
                ),
            }))
            .filter(category => category.icons.length > 0);
    }, [searchQuery]);

    const handleSelect = useCallback((iconName: string) => {
        haptics.selectionAsync();
        onSelect(iconName);
        onClose();
    }, [onSelect, onClose]);

    const handleClose = useCallback(() => {
        setSearchQuery('');
        setTooltipIcon(null);
        onClose();
    }, [onClose]);

    const handleLongPress = useCallback((iconName: string) => {
        haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
        setTooltipIcon(iconName);
    }, []);

    const handlePressOut = useCallback(() => {
        setTooltipIcon(null);
    }, []);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdropTouch}
                    onPress={handleClose}
                    activeOpacity={1}
                />
                <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Choose Icon</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={colors.text} weight="regular" />
                        </TouchableOpacity>
                    </View>

                    {/* Selected Preview */}
                    <View style={[styles.preview, { borderBottomColor: colors.cardBorder }]}>
                        <View style={[
                            styles.previewCircle,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.accent
                            }
                        ]}>
                            {renderIcon(selectedIcon, 32, colors.accent, 'regular')}
                        </View>
                        <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                            {selectedIcon}
                        </Text>
                    </View>

                    {/* Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                        <PhosphorIcons.MagnifyingGlass size={18} color={colors.textMuted} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search icons..."
                            placeholderTextColor={colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Long-press tooltip hint */}
                    <Text style={[styles.hintText, { color: colors.textMuted }]}>
                        Long press an icon to see its name
                    </Text>

                    {/* Floating Tooltip */}
                    {tooltipIcon && (
                        <View style={[styles.tooltip, { backgroundColor: colors.text }]}>
                            <Text style={[styles.tooltipText, { color: colors.background }]}>
                                {tooltipIcon}
                            </Text>
                        </View>
                    )}

                    {/* Icon Grid */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                    >
                        {filteredCategories.map((category) => (
                            <View key={category.name} style={styles.category}>
                                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                                    {category.name}
                                </Text>
                                <View style={styles.iconGrid}>
                                    {category.icons.map((iconName) => {
                                        const isSelected = selectedIcon === iconName;
                                        return (
                                            <TouchableOpacity
                                                key={iconName}
                                                style={[
                                                    styles.iconButton,
                                                    {
                                                        backgroundColor: isDark
                                                            ? 'rgba(255,255,255,0.08)'
                                                            : 'rgba(0,0,0,0.05)'
                                                    },
                                                    isSelected && {
                                                        borderColor: colors.accent,
                                                        borderWidth: 2,
                                                        backgroundColor: isDark
                                                            ? 'rgba(255,215,0,0.15)'
                                                            : 'rgba(0,122,255,0.1)'
                                                    },
                                                ]}
                                                onPress={() => handleSelect(iconName)}
                                                onLongPress={() => handleLongPress(iconName)}
                                                onPressOut={handlePressOut}
                                                delayLongPress={300}
                                                activeOpacity={0.7}
                                            >
                                                {renderIcon(
                                                    iconName,
                                                    24,
                                                    isSelected ? colors.accent : colors.textSecondary,
                                                    isSelected ? 'fill' : 'regular'
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}

                        {filteredCategories.length === 0 && (
                            <View style={styles.emptyState}>
                                <PhosphorIcons.MagnifyingGlass size={48} color={colors.textMuted} />
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                    No icons found for "{searchQuery}"
                                </Text>
                            </View>
                        )}

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    backdropTouch: {
        flex: 1,
    },
    container: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        height: screenHeight * 0.75,
        maxHeight: 650,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    preview: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    previewCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    previewText: {
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.md,
        marginVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Spacing.xs,
    },
    category: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
    },
    categoryLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GRID_GAP,
        justifyContent: 'center',
    },
    iconButton: {
        width: ICON_CONTAINER_SIZE,
        height: ICON_CONTAINER_SIZE,
        borderRadius: ICON_CONTAINER_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl * 2,
        gap: Spacing.md,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    bottomPadding: {
        height: 40,
    },
    hintText: {
        fontSize: 11,
        textAlign: 'center',
        paddingVertical: Spacing.xs,
    },
    tooltip: {
        position: 'absolute',
        top: 180,
        left: '50%',
        transform: [{ translateX: -60 }],
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        zIndex: 100,
        minWidth: 120,
        alignItems: 'center',
    },
    tooltipText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
