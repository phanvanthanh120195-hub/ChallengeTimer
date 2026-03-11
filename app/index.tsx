import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/themes';
import { CHALLENGES, TIME_PRESETS, ChallengeType } from '../src/constants/challenges';
import { useToast } from '../src/components/Toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_GAP * 2) / 3;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType>('ice_melt');
    const [selectedTime, setSelectedTime] = useState<number>(TIME_PRESETS[2].seconds); // 1h default
    const [customMinutes, setCustomMinutes] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    const handleStart = useCallback(() => {
        const duration = showCustom && customMinutes
            ? parseInt(customMinutes, 10) * 60
            : selectedTime;

        if (!duration || duration <= 0) {
            showToast('Vui lòng chọn thời gian thử thách', 'warning');
            return;
        }

        router.push({
            pathname: '/challenge',
            params: {
                type: selectedChallenge,
                duration: duration.toString(),
            },
        });
    }, [selectedChallenge, selectedTime, showCustom, customMinutes, router, showToast]);

    const selectedConfig = CHALLENGES.find(c => c.id === selectedChallenge) || CHALLENGES[0];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
                    <Text style={styles.appIcon}>🔥</Text>
                    <Text style={styles.title}>Challenge Timer</Text>
                    <Text style={styles.subtitle}>Chọn thử thách và bắt đầu hành trình</Text>
                </Animated.View>

                {/* Challenge Type Selection */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <Text style={styles.sectionTitle}>🎯 Chọn thử thách</Text>
                    <View style={styles.challengeGrid}>
                        {CHALLENGES.map((ch, index) => {
                            const isSelected = selectedChallenge === ch.id;
                            return (
                                <TouchableOpacity
                                    key={ch.id}
                                    style={[
                                        styles.challengeCard,
                                        isSelected && styles.challengeCardSelected,
                                        isSelected && { borderColor: ch.gradient[1] },
                                    ]}
                                    onPress={() => setSelectedChallenge(ch.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.challengeIcon}>{ch.icon}</Text>
                                    <Text style={[
                                        styles.challengeName,
                                        isSelected && { color: ch.gradient[1] },
                                    ]} numberOfLines={1}>
                                        {ch.name}
                                    </Text>
                                    {isSelected && (
                                        <View style={[styles.selectedDot, { backgroundColor: ch.gradient[1] }]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Selected challenge description */}
                    <View style={[styles.selectedInfo, { borderLeftColor: selectedConfig.gradient[1] }]}>
                        <Text style={[styles.selectedInfoTitle, { color: selectedConfig.gradient[1] }]}>
                            {selectedConfig.icon} {selectedConfig.name}
                        </Text>
                        <Text style={styles.selectedInfoDesc}>{selectedConfig.description}</Text>
                    </View>
                </Animated.View>

                {/* Time Selection */}
                <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                    <Text style={styles.sectionTitle}>⏱️ Thời gian thử thách</Text>
                    <View style={styles.timeGrid}>
                        {TIME_PRESETS.map((preset) => {
                            const isSelected = !showCustom && selectedTime === preset.seconds;
                            return (
                                <TouchableOpacity
                                    key={preset.seconds}
                                    style={[
                                        styles.timeChip,
                                        isSelected && styles.timeChipSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedTime(preset.seconds);
                                        setShowCustom(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.timeChipText,
                                        isSelected && styles.timeChipTextSelected,
                                    ]}>
                                        {preset.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity
                            style={[
                                styles.timeChip,
                                showCustom && styles.timeChipSelected,
                            ]}
                            onPress={() => setShowCustom(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.timeChipText,
                                showCustom && styles.timeChipTextSelected,
                            ]}>
                                ✏️ Tùy chỉnh
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showCustom && (
                        <View style={styles.customInput}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Nhập số phút"
                                placeholderTextColor={Colors.dark.textMuted}
                                keyboardType="number-pad"
                                value={customMinutes}
                                onChangeText={setCustomMinutes}
                            />
                            <Text style={styles.inputLabel}>phút</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Start Button */}
                <AnimatedTouchable
                    entering={FadeInUp.delay(600).duration(500)}
                    style={[styles.startButton, { backgroundColor: selectedConfig.gradient[1] }]}
                    onPress={handleStart}
                    activeOpacity={0.8}
                >
                    <Text style={styles.startButtonText}>🚀 Bắt đầu thử thách</Text>
                </AnimatedTouchable>

                {/* History Button */}
                <AnimatedTouchable
                    entering={FadeInUp.delay(700).duration(500)}
                    style={styles.historyButton}
                    onPress={() => router.push('/history')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.historyButtonText}>📊 Xem lịch sử thử thách</Text>
                </AnimatedTouchable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl,
        paddingBottom: Spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    appIcon: {
        fontSize: 48,
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: Colors.dark.text,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.dark.textSecondary,
        marginTop: Spacing.xs,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    challengeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: CARD_GAP,
    },
    challengeCard: {
        width: CARD_WIDTH,
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xs,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    challengeCardSelected: {
        backgroundColor: Colors.dark.surfaceLight,
    },
    challengeIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    challengeName: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.dark.text,
        textAlign: 'center',
    },
    selectedDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 4,
    },
    selectedInfo: {
        marginTop: Spacing.md,
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderLeftWidth: 3,
    },
    selectedInfoTitle: {
        fontSize: FontSize.md,
        fontWeight: '700',
        marginBottom: 4,
    },
    selectedInfoDesc: {
        fontSize: FontSize.sm,
        color: Colors.dark.textSecondary,
        lineHeight: 20,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    timeChip: {
        backgroundColor: Colors.dark.surface,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.round,
        borderWidth: 1.5,
        borderColor: Colors.dark.border,
    },
    timeChipSelected: {
        backgroundColor: Colors.dark.primary + '20',
        borderColor: Colors.dark.primary,
    },
    timeChipText: {
        fontSize: FontSize.sm,
        color: Colors.dark.textSecondary,
        fontWeight: '600',
    },
    timeChipTextSelected: {
        color: Colors.dark.primary,
    },
    customInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    textInput: {
        flex: 1,
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        color: Colors.dark.text,
        fontSize: FontSize.lg,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    inputLabel: {
        fontSize: FontSize.md,
        color: Colors.dark.textSecondary,
    },
    startButton: {
        paddingVertical: Spacing.md + 2,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        marginTop: Spacing.xl,
        shadowColor: Colors.dark.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    startButtonText: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    historyButton: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    historyButtonText: {
        fontSize: FontSize.md,
        color: Colors.dark.textSecondary,
        fontWeight: '600',
    },
});
