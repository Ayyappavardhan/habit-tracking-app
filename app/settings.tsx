/**
 * Settings Screen
 * User preferences, notifications, data management, and app info
 */

import { EmojiPicker } from '@/components/habit';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useNotes } from '@/context/NoteContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import * as habitStorage from '@/services/habitStorage';
import { documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Bell, CalendarBlank, CaretLeft, CaretRight, CheckCircle, Clock, DownloadSimple, Envelope, FileText, Info, Moon, Palette, ShieldCheck, Sun, Trash, X } from 'phosphor-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ImageSourcePropType,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const APP_VERSION = '1.0.0';

// Avatar Assets
const AVATAR_MALE = require('@/assets/images/avatar-male.png');
const AVATAR_FEMALE = require('@/assets/images/avatar-female.png');

// Time options for the picker
const TIME_OPTIONS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00',
];

export default function SettingsScreen() {
    const { settings, updateSettings, resetSettings } = useSettings();
    const { habits, refreshHabits } = useHabits();
    const { clearAllNotes, refreshNotes } = useNotes();
    const { colors, isDark } = useTheme();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    const SUPPORT_EMAIL = 'vardhanayyappa@gmail.com';

    const handleContactSupport = async () => {
        const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=Habit%20Tracker%20Support`;
        const canOpen = await Linking.canOpenURL(mailtoUrl);
        if (canOpen) {
            await Linking.openURL(mailtoUrl);
        } else {
            Alert.alert(
                'Contact Support',
                `Please email us at:\n\n${SUPPORT_EMAIL}`,
                [{ text: 'OK' }]
            );
        }
    };

    const handleExportData = async () => {
        try {
            const data = {
                habits,
                exportedAt: new Date().toISOString(),
                version: APP_VERSION,
            };

            // Check if FileSystem is available (not on web)
            if (!documentDirectory) {
                Alert.alert(
                    'Not Available',
                    'Export is not available on web. Please use a mobile device to export your data.'
                );
                return;
            }

            const fileName = `habits_backup_${new Date().toISOString().split('T')[0]}.json`;
            const filePath = `${documentDirectory}${fileName}`;

            // Write the file
            await writeAsStringAsync(filePath, JSON.stringify(data, null, 2));

            // Check if sharing is available
            const isSharingAvailable = await Sharing.isAvailableAsync();
            if (isSharingAvailable) {
                await Sharing.shareAsync(filePath, {
                    mimeType: 'application/json',
                    dialogTitle: 'Export Habits Data',
                });
            } else {
                Alert.alert(
                    'Export Complete',
                    `Your data has been saved to: ${fileName}\n\nSharing is not available on this device.`
                );
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert(
                'Export Failed',
                'There was an error exporting your habits data. Please try again.'
            );
        }
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all your habits, notes, and settings. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await habitStorage.clearAllHabits();
                            await clearAllNotes();
                            await resetSettings();
                            await refreshHabits();
                            await refreshNotes();
                            Alert.alert('Success', 'All data has been cleared');
                        } catch (error) {
                            console.error('Clear data error:', error);
                            Alert.alert('Error', 'Failed to clear data');
                        }
                    },
                },
            ]
        );
    };

    const handleTimeSelect = (time: string) => {
        updateSettings({ defaultNotificationTime: time });
        setShowTimePicker(false);
    };

    const parseTime = (timeString: string): Date => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const formatTime = (timeString: string): string => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const displayName = settings.userName || 'User';

    const getAvatarImage = (avatarString: string): ImageSourcePropType | null => {
        if (avatarString === 'avatar-male') return AVATAR_MALE;
        if (avatarString === 'avatar-female') return AVATAR_FEMALE;
        return null;
    };

    const renderAvatar = () => {
        const imageSource = getAvatarImage(settings.userAvatar);

        if (imageSource) {
            return <Image source={imageSource} style={styles.avatarImage} resizeMode="cover" />;
        }

        return <Text style={styles.avatarEmoji}>{settings.userAvatar}</Text>;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => router.back()}
                >
                    <CaretLeft size={24} color={colors.text} weight="regular" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Profile Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Profile</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        {/* Avatar */}
                        <TouchableOpacity
                            style={styles.avatarRow}
                            onPress={() => setShowAvatarSelector(true)}
                        >
                            <View style={styles.rowLeft}>
                                <View style={[styles.avatar, { backgroundColor: colors.backgroundSecondary }]}>
                                    {renderAvatar()}
                                </View>
                                <View>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>Avatar</Text>
                                    <Text style={[styles.rowHint, { color: colors.textMuted }]}>Tap to change</Text>
                                </View>
                            </View>
                            <CaretRight size={20} color={colors.textSecondary} weight="regular" />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                        {/* Name */}
                        <View style={styles.inputRow}>
                            <Text style={[styles.rowLabel, { color: colors.text }]}>Name</Text>
                            <TextInput
                                style={[styles.textInput, { color: colors.text }]}
                                value={settings.userName}
                                onChangeText={(text) => updateSettings({ userName: text })}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.textMuted}
                                maxLength={30}
                            />
                        </View>
                    </View>
                </View>

                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.row}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#5856D6' + '20' }]} >
                                    <Palette size={20} color="#5856D6" weight="regular" />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Theme</Text>
                            </View>
                            <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSecondary }]}>
                                <TouchableOpacity
                                    style={[
                                        styles.segment,
                                        settings.theme === 'dark' && { backgroundColor: colors.accent },
                                    ]}
                                    onPress={() => updateSettings({ theme: 'dark' })}
                                >
                                    <Moon
                                        size={16}
                                        color={settings.theme === 'dark' ? colors.background : colors.textSecondary}
                                        weight="fill"
                                    />
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            { color: colors.textSecondary },
                                            settings.theme === 'dark' && { color: colors.background },
                                        ]}
                                    >
                                        Dark
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.segment,
                                        settings.theme === 'light' && { backgroundColor: colors.accent },
                                    ]}
                                    onPress={() => updateSettings({ theme: 'light' })}
                                >
                                    <Sun
                                        size={16}
                                        color={settings.theme === 'light' ? colors.background : colors.textSecondary}
                                        weight="fill"
                                    />
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            { color: colors.textSecondary },
                                            settings.theme === 'light' && { color: colors.background },
                                        ]}
                                    >
                                        Light
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        {/* Global Toggle */}
                        <View style={styles.switchRow}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                                    <Bell size={20} color={colors.accent} weight="fill" />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Enable Notifications</Text>
                            </View>
                            <Switch
                                value={settings.globalNotificationsEnabled}
                                onValueChange={(value) => updateSettings({ globalNotificationsEnabled: value })}
                                trackColor={{ false: colors.cardBorder, true: colors.accent + '60' }}
                                thumbColor={settings.globalNotificationsEnabled ? colors.accent : colors.textSecondary}
                            />
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                        {/* Default Time */}
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#5856D6' + '20' }]}>
                                    <Clock size={20} color="#5856D6" weight="regular" />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Default Reminder Time</Text>
                            </View>
                            <View style={styles.rowRight}>
                                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                                    {formatTime(settings.defaultNotificationTime)}
                                </Text>
                                <CaretRight size={20} color={colors.textSecondary} weight="regular" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Calendar Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Calendar</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.row}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#34C759' + '20' }]}>
                                    <CalendarBlank size={20} color="#34C759" weight="regular" />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Week Starts On</Text>
                            </View>
                            <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSecondary }]}>
                                <TouchableOpacity
                                    style={[
                                        styles.segment,
                                        settings.weekStartDay === 0 && { backgroundColor: colors.accent },
                                    ]}
                                    onPress={() => updateSettings({ weekStartDay: 0 })}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            { color: colors.textSecondary },
                                            settings.weekStartDay === 0 && { color: colors.background },
                                        ]}
                                    >
                                        Sun
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.segment,
                                        settings.weekStartDay === 1 && { backgroundColor: colors.accent },
                                    ]}
                                    onPress={() => updateSettings({ weekStartDay: 1 })}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            { color: colors.textSecondary },
                                            settings.weekStartDay === 1 && { color: colors.background },
                                        ]}
                                    >
                                        Mon
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Data Management Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <TouchableOpacity style={styles.row} onPress={handleExportData}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#007AFF' + '20' }]}>
                                    <DownloadSimple size={20} color="#007AFF" weight="regular" />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Export Habits</Text>
                            </View>
                            <CaretRight size={20} color={colors.textSecondary} weight="regular" />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                        <TouchableOpacity style={styles.row} onPress={handleClearData}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: Colors.error + '20' }]}>
                                    <Trash size={20} color={Colors.error} weight="regular" />
                                </View>
                                <Text style={[styles.rowLabel, { color: Colors.error }]}>
                                    Clear All Data
                                </Text>
                            </View>
                            <CaretRight size={20} color={colors.textSecondary} weight="regular" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Support & Legal Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support & Legal</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <TouchableOpacity
                            style={styles.row}
                            onPress={handleContactSupport}
                        >
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#FF9500' + '20' }]}>
                                    <Envelope size={20} color="#FF9500" weight="regular" />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Contact Support</Text>
                            </View>
                            <CaretRight size={20} color={colors.textSecondary} weight="regular" />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => Linking.openURL('https://habittracker.com/privacy')}
                        >
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#32ADE6' + '20' }]}>
                                    <ShieldCheck size={20} color="#32ADE6" weight="regular" />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Privacy Policy</Text>
                            </View>
                            <CaretRight size={20} color={colors.textSecondary} weight="regular" />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => Linking.openURL('https://habittracker.com/terms')}
                        >
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#A2845E' + '20' }]}>
                                    <FileText size={20} color="#A2845E" weight="regular" />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Terms of Service</Text>
                            </View>
                            <CaretRight size={20} color={colors.textSecondary} weight="regular" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.row}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                                    <Info size={20} color={colors.accent} weight="fill" />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
                            </View>
                            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{APP_VERSION}</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom padding */}
                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Avatar Selection Modal */}
            <Modal
                visible={showAvatarSelector}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAvatarSelector(false)}
            >
                <TouchableOpacity
                    style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}
                    activeOpacity={1}
                    onPress={() => setShowAvatarSelector(false)}
                >
                    <View style={[styles.avatarModalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Avatar</Text>

                        <View style={styles.avatarOptionsContainer}>
                            <TouchableOpacity
                                style={styles.avatarOption}
                                onPress={() => {
                                    updateSettings({ userAvatar: 'avatar-male' });
                                    setShowAvatarSelector(false);
                                }}
                            >
                                <View style={[styles.avatarOptionImageContainer, { backgroundColor: colors.backgroundSecondary }]}>
                                    <Image source={AVATAR_MALE} style={styles.avatarOptionImage} />
                                </View>
                                <Text style={[styles.avatarOptionLabel, { color: colors.text }]}>Male</Text>
                                {settings.userAvatar === 'avatar-male' && (
                                    <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                                        <CheckCircle size={12} color="#FFF" weight="fill" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.avatarOption}
                                onPress={() => {
                                    updateSettings({ userAvatar: 'avatar-female' });
                                    setShowAvatarSelector(false);
                                }}
                            >
                                <View style={[styles.avatarOptionImageContainer, { backgroundColor: colors.backgroundSecondary }]}>
                                    <Image source={AVATAR_FEMALE} style={styles.avatarOptionImage} />
                                </View>
                                <Text style={[styles.avatarOptionLabel, { color: colors.text }]}>Female</Text>
                                {settings.userAvatar === 'avatar-female' && (
                                    <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                                        <CheckCircle size={12} color="#FFF" weight="fill" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.avatarOption}
                                onPress={() => {
                                    setShowAvatarSelector(false);
                                    // Small delay to allow modal to close before opening emoji picker
                                    setTimeout(() => setShowEmojiPicker(true), 300);
                                }}
                            >
                                <View style={[styles.avatarOptionImageContainer, { backgroundColor: colors.backgroundSecondary }]}>
                                    <Text style={{ fontSize: 32 }}>😊</Text>
                                </View>
                                <Text style={[styles.avatarOptionLabel, { color: colors.text }]}>Emoji</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
                            onPress={() => setShowAvatarSelector(false)}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Emoji Picker Modal */}
            <EmojiPicker
                visible={showEmojiPicker}
                selectedEmoji={settings.userAvatar.length <= 2 ? settings.userAvatar : '😊'}
                onClose={() => setShowEmojiPicker(false)}
                onSelect={(emoji) => {
                    updateSettings({ userAvatar: emoji });
                    setShowEmojiPicker(false);
                }}
            />

            {/* Time Picker Modal */}
            <Modal
                visible={showTimePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowTimePicker(false)}
            >
                <TouchableOpacity
                    style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}
                    activeOpacity={1}
                    onPress={() => setShowTimePicker(false)}
                >
                    <View style={[styles.timePickerContainer, { backgroundColor: colors.card }]}>
                        <View style={[styles.timePickerHeader, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select Time</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <X size={24} color={colors.text} weight="regular" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                            {TIME_OPTIONS.map((time) => (
                                <TouchableOpacity
                                    key={time}
                                    style={[
                                        styles.timeOption,
                                        { borderBottomColor: colors.cardBorder },
                                        settings.defaultNotificationTime === time && { backgroundColor: colors.accent },
                                    ]}
                                    onPress={() => handleTimeSelect(time)}
                                >
                                    <Text
                                        style={[
                                            styles.timeOptionText,
                                            { color: colors.text },
                                            settings.defaultNotificationTime === time && { color: colors.background, fontWeight: '600' },
                                        ]}
                                    >
                                        {formatTime(time)}
                                    </Text>
                                    {settings.defaultNotificationTime === time && (
                                        <CheckCircle size={20} color={colors.background} weight="fill" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    section: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        minHeight: 56,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        minHeight: 56,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        minHeight: 56,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    rowLabel: {
        fontSize: 16,
        color: Colors.text,
    },
    rowHint: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    rowValue: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarEmoji: {
        fontSize: 28,
    },
    textInput: {
        fontSize: 16,
        color: Colors.text,
        textAlign: 'right',
        flex: 1,
        paddingVertical: Spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.cardBorder,
        marginHorizontal: Spacing.md,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.sm,
        padding: 2,
    },
    segment: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm - 2,
    },
    segmentActive: {
        backgroundColor: Colors.accent,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    segmentTextActive: {
        color: Colors.background,
    },
    bottomPadding: {
        height: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timePickerContainer: {
        width: '80%',
        maxHeight: '60%',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    timePickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    timePickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    timePickerScroll: {
        maxHeight: 300,
    },
    timeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    timeOptionSelected: {
        backgroundColor: Colors.accent,
    },
    timeOptionText: {
        fontSize: 16,
        color: Colors.text,
    },
    timeOptionTextSelected: {
        color: Colors.background,
        fontWeight: '600',
    },
    avatarModalContent: {
        width: '85%',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: Spacing.lg,
    },
    avatarOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
        flexWrap: 'wrap',
    },
    avatarOption: {
        alignItems: 'center',
        position: 'relative',
    },
    avatarOptionImageContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        overflow: 'hidden',
    },
    avatarOptionImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarOptionLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    selectedBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.card,
    },
    cancelButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
