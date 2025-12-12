/**
 * MoodTrendChart Component
 * Curved line chart (Cardiograph style) showing daily mood
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useNotes } from '@/context/NoteContext';
import { useTheme } from '@/context/ThemeContext';
import { MoodEmojis, MoodType } from '@/types/note';
import { PeriodType } from '@/utils/analyticsUtils';
import { formatLocalDate } from '@/utils/dateUtils';
import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

const MOOD_VALUES: Record<MoodType, number> = {
    'great': 5,
    'good': 4,
    'okay': 3,
    'bad': 2,
    'terrible': 1,
};

const VALUE_TO_MOOD: Record<number, MoodType> = {
    5: 'great',
    4: 'good',
    3: 'okay',
    2: 'bad',
    1: 'terrible',
};

interface MoodTrendChartProps {
    period: PeriodType;
}

// Chart Layout Constants
const CHART_HEIGHT = 220;
const PADDING_TOP = 40; // Space for Emojis
const PADDING_BOTTOM = 40; // Space for X-Axis Labels
const PADDING_LEFT = 50; // New space for Y-Axis Labels
const PADDING_RIGHT = 20; // Space on right to prevent clipping
const DRAWING_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

export default function MoodTrendChart({ period }: MoodTrendChartProps) {
    const { notes } = useNotes();
    const { colors } = useTheme();
    const [layoutWidth, setLayoutWidth] = useState(0);

    // ... (Memoized data calculation remains exactly the same) ...
    const { dataPoints } = useMemo(() => {
        const today = new Date();
        const points: { value: number; date: string; label: string; index: number }[] = [];

        let daysToSub = period === 'week' ? 6 : period === 'month' ? 29 : 11;
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (period === 'year') {
            const currentYear = today.getFullYear();
            for (let i = 0; i <= 11; i++) {
                const notesInMonth = Object.values(notes).filter(n => {
                    if (!n.mood) return false;
                    const d = new Date(n.date);
                    return d.getMonth() === i && d.getFullYear() === currentYear;
                });

                let avgValue = 0;
                if (notesInMonth.length > 0) {
                    const total = notesInMonth.reduce((sum, n) => sum + (n.mood ? MOOD_VALUES[n.mood] : 0), 0);
                    avgValue = Math.round(total / notesInMonth.length);
                }

                points.push({
                    value: avgValue,
                    date: `${currentYear}-${i}`,
                    label: months[i],
                    index: i
                });
            }
        } else {
            for (let i = daysToSub; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = formatLocalDate(date);

                let label = '';
                if (period === 'week') {
                    label = dayNames[date.getDay()];
                } else {
                    label = (i % 6 === 0) ? `${date.getDate()}` : '';
                }

                const notesForDay = Object.values(notes).filter(n => n.date === dateStr && n.mood);
                let avgValue = 0;
                if (notesForDay.length > 0) {
                    const total = notesForDay.reduce((sum, n) => sum + (n.mood ? MOOD_VALUES[n.mood] : 0), 0);
                    avgValue = Math.round(total / notesForDay.length);
                }

                points.push({
                    value: avgValue,
                    date: dateStr,
                    label,
                    index: daysToSub - i
                });
            }
        }

        return { dataPoints: points };
    }, [notes, period]);

    const onLayout = (event: LayoutChangeEvent) => {
        setLayoutWidth(event.nativeEvent.layout.width);
    };

    // Helper: generate Y coordinate for a value (1-5)
    // 5 -> Top (0 relative to drawing area)
    // 1 -> Bottom (height relative to drawing area)
    const getY = (value: number) => {
        // Map 1-5 to Height-0
        // value 1 => y = height
        // value 5 => y = 0
        return DRAWING_HEIGHT - ((value - 1) / 4) * DRAWING_HEIGHT;
    };

    // Helper: generating smooth path
    const getPath = () => {
        if (dataPoints.length === 0 || layoutWidth === 0) return '';

        // Calculate writable width
        const writableWidth = layoutWidth - PADDING_LEFT - PADDING_RIGHT;
        const stepX = writableWidth / (dataPoints.length - 1);

        const getCoord = (index: number, value: number) => {
            const x = PADDING_LEFT + (index * stepX);
            const val = value === 0 ? 1 : value; // Treat 0 as bottom (1)
            const y = PADDING_TOP + getY(val);
            return { x, y };
        };

        const points = dataPoints.map((p, i) => getCoord(i, p.value));

        // Generate Bezier Path
        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp1y = p0.y;
            const cp2x = p1.x - (p1.x - p0.x) / 2;
            const cp2y = p1.y;

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }

        const lastPoint = points[points.length - 1];
        const firstPoint = points[0];
        const bottomY = PADDING_TOP + DRAWING_HEIGHT;

        const areaPath = `
            ${path} 
            L ${lastPoint.x} ${bottomY} 
            L ${firstPoint.x} ${bottomY} 
            Z
        `;

        return { linePath: path, areaPath, points };
    };

    if (!dataPoints.length) return null;

    const { linePath, areaPath, points: coords } = getPath() || { linePath: '', areaPath: '', points: [] };

    // Y-Axis Grid Lines Data
    // We want lines for Great(5), Good(4), Okay(3), Bad(2), Terrible(1)
    const moodLevels = [5, 4, 3, 2, 1];

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>
                Mood Flow ({period === 'year' ? 'Yearly' : period === 'month' ? 'Last 30 Days' : 'Last 7 Days'})
            </Text>

            <View style={styles.chartWrapper} onLayout={onLayout}>
                {layoutWidth > 0 && (
                    <Svg width={layoutWidth} height={CHART_HEIGHT}>
                        <Defs>
                            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={colors.accent} stopOpacity="0.8" />
                                <Stop offset="1" stopColor={colors.accent} stopOpacity="0.1" />
                            </LinearGradient>
                        </Defs>

                        {/* Grid Lines & Y-Axis Labels */}
                        {moodLevels.map((level) => {
                            const y = PADDING_TOP + getY(level);
                            const label = VALUE_TO_MOOD[level];
                            // Capitalize first letter
                            const labelText = label.charAt(0).toUpperCase() + label.slice(1);

                            return (
                                <React.Fragment key={`grid-${level}`}>
                                    {/* Label */}
                                    <SvgText
                                        x={PADDING_LEFT - 10}
                                        y={y + 4} // Center vertically relative to line
                                        fontSize={10}
                                        fill={colors.textSecondary}
                                        textAnchor="end"
                                    >
                                        {labelText}
                                    </SvgText>

                                    {/* Dotted Line */}
                                    <Path
                                        d={`M ${PADDING_LEFT} ${y} L ${layoutWidth - PADDING_RIGHT} ${y}`}
                                        stroke={colors.cardBorder}
                                        strokeWidth={1}
                                        strokeDasharray="4, 4"
                                    />
                                </React.Fragment>
                            );
                        })}

                        {/* Area Fill */}
                        <Path d={areaPath} fill="url(#gradient)" />

                        {/* Curve Line */}
                        <Path
                            d={linePath}
                            stroke={colors.accent}
                            strokeWidth={4}
                            strokeLinecap="round"
                            fill="transparent"
                        />

                        {/* Data Points & Emojis */}
                        {coords.map((point, index) => {
                            const dataPoint = dataPoints[index];
                            if (dataPoint.value === 0) return null;

                            return (
                                <React.Fragment key={index}>
                                    {/* Emoji (Above point) */}
                                    <SvgText
                                        x={point.x}
                                        y={point.y - 15}
                                        fontSize={period === 'month' ? 14 : 18}
                                        textAnchor="middle"
                                    >
                                        {MoodEmojis[VALUE_TO_MOOD[dataPoint.value]]}
                                    </SvgText>
                                </React.Fragment>
                            );
                        })}

                        {/* X-Axis Labels */}
                        {coords.map((point, index) => {
                            const dataPoint = dataPoints[index];
                            if (!dataPoint.label) return null;

                            return (
                                <SvgText
                                    key={`label-${index}`}
                                    x={point.x}
                                    y={CHART_HEIGHT - 10}
                                    fontSize={12}
                                    fill={colors.textSecondary}
                                    textAnchor="middle"
                                    fontWeight="600"
                                >
                                    {dataPoint.label}
                                </SvgText>
                            );
                        })}
                    </Svg>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    chartWrapper: {
        height: CHART_HEIGHT,
        width: '100%',
    },
});
