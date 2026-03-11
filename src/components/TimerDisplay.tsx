import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, FontSize } from '../constants/themes';
import { formatTime } from '../hooks/useTimer';

interface TimerDisplayProps {
    remainingSeconds: number;
    totalSeconds: number;
    progress: number;
    accentColor?: string;
}

export function TimerDisplay({
    remainingSeconds,
    totalSeconds,
    progress,
    accentColor = Colors.dark.primary,
}: TimerDisplayProps) {
    const size = 200;
    const strokeWidth = 6;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;

    const percentage = Math.round(progress * 100);

    return (
        <View style={styles.container}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Defs>
                    <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={accentColor} stopOpacity="1" />
                        <Stop offset="1" stopColor={Colors.dark.accent} stopOpacity="0.8" />
                    </LinearGradient>
                </Defs>
                {/* Background ring */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={Colors.dark.border}
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity={0.3}
                />
                {/* Progress ring */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#ringGrad)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

            <View style={styles.textContainer}>
                <Text style={[styles.time, { color: Colors.dark.text }]}>
                    {formatTime(remainingSeconds)}
                </Text>
                <Text style={[styles.percentage, { color: accentColor }]}>
                    {percentage}%
                </Text>
                <Text style={styles.label}>còn lại</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    time: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        letterSpacing: 2,
        fontVariant: ['tabular-nums'],
    },
    percentage: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        marginTop: 4,
    },
    label: {
        fontSize: FontSize.sm,
        color: Colors.dark.textMuted,
        marginTop: 2,
    },
});
