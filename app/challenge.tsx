import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/themes';
import { ChallengeType, ChallengeRecord, CHALLENGES } from '../src/constants/challenges';
import { useTimer, formatTime } from '../src/hooks/useTimer';
import { ChallengeAnimation } from '../src/components/ChallengeAnimation';
import { saveActiveChallenge, addToHistory } from '../src/utils/storage';
import { useToast } from '../src/components/Toast';
import { useAudio } from '../src/hooks/useAudio';
import { TrackSelectorModal } from '../src/components/TrackSelectorModal';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChallengeScreen() {
    const router = useRouter();
    const { showConfirm } = useToast();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ type: string; duration: string }>();
    const challengeType = (params.type || 'ice_melt') as ChallengeType;
    const totalDuration = parseInt(params.duration || '3600', 10);

    const [challengeId] = useState(() => Date.now().toString());
    const [startedAt] = useState(() => new Date().toISOString());
    const [showTrackSelector, setShowTrackSelector] = useState(false);

    // Audio Hook
    const { currentTrack, isMuted, play: playAudio, pause: pauseAudio, toggleMute, changeTrack, tracks } = useAudio();

    const handleComplete = useCallback(async () => {
        const record: ChallengeRecord = {
            id: challengeId,
            type: challengeType,
            durationSeconds: totalDuration,
            startedAt,
            completedAt: new Date().toISOString(),
            status: 'completed',
        };
        await addToHistory(record);
        await saveActiveChallenge(null);

        router.replace({
            pathname: '/completion',
            params: {
                type: challengeType,
                duration: totalDuration.toString(),
            },
        });
    }, [challengeId, challengeType, totalDuration, startedAt, router]);

    const {
        remainingSeconds,
        progress,
        isPaused,
        isRunning,
        start,
        pause,
        resume,
        reset,
    } = useTimer({
        totalSeconds: totalDuration,
        onComplete: () => {
            pauseAudio();
            handleComplete();
        },
    });

    // Auto-start & save active challenge
    useEffect(() => {
        start();
        playAudio();
        saveActiveChallenge({
            id: challengeId,
            type: challengeType,
            durationSeconds: totalDuration,
            startedAt,
            status: 'in_progress',
        });
    }, []);

    const doQuit = useCallback(async () => {
        reset();
        pauseAudio();
        const record: ChallengeRecord = {
            id: challengeId,
            type: challengeType,
            durationSeconds: totalDuration,
            startedAt,
            status: 'failed',
        };
        await addToHistory(record);
        await saveActiveChallenge(null);
        router.replace('/');
    }, [challengeId, challengeType, totalDuration, startedAt, reset, router, pauseAudio]);

    const handleQuit = useCallback(() => {
        showConfirm({
            title: 'Hủy thử thách?',
            message: 'Bạn có chắc muốn hủy thử thách này?\nTiến trình sẽ không được lưu.',
            confirmText: 'Hủy thử thách',
            cancelText: 'Tiếp tục',
            confirmColor: Colors.dark.danger,
            onConfirm: doQuit,
        });
    }, [doQuit, showConfirm]);

    const handlePause = useCallback(() => {
        pause();
        pauseAudio();
    }, [pause, pauseAudio]);

    const handleResume = useCallback(() => {
        resume();
        playAudio();
    }, [resume, playAudio]);

    const challengeConfig = CHALLENGES.find(c => c.id === challengeType) || CHALLENGES[0];
    const accentColor = challengeConfig.gradient[1];
    const challengeName = `${challengeConfig.icon} ${challengeConfig.name}`;

    // Progress ring behind animation
    const ringSize = Math.min(SCREEN_WIDTH * 0.85, 320);
    const ringStroke = 4;
    const ringRadius = (ringSize - ringStroke * 2) / 2;
    const ringCircumference = ringRadius * 2 * Math.PI;
    const ringOffset = ringCircumference - progress * ringCircumference;

    return (
        <SafeAreaView style={styles.container}>
            {/* Music Controls (Top Right) */}
            <View style={[styles.musicControls, { top: insets.top + Spacing.md }]}>
                <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                    <Text style={styles.iconText}>{isMuted ? '🔇' : '🔊'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTrackSelector(true)} style={styles.iconButton}>
                    <Text style={styles.iconText}>🎵</Text>
                </TouchableOpacity>
            </View>

            {/* Header */}
            <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
                <Text style={[styles.challengeName, { color: accentColor }]}>
                    {challengeName}
                </Text>
                <Text style={styles.totalTime}>
                    Tổng: {formatTime(totalDuration)}
                </Text>
                {/* Now Playing text */}
                <Text style={styles.nowPlayingText} numberOfLines={1}>
                    ♫ {currentTrack.name}
                </Text>
            </Animated.View>

            {/* Animation Area */}
            <Animated.View entering={FadeIn.duration(800)} style={styles.animationArea}>
                {/* Background progress ring */}
                <View style={[styles.progressRingContainer, { width: ringSize, height: ringSize }]}>
                    <Svg width={ringSize} height={ringSize}>
                        <Circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={ringRadius}
                            stroke={Colors.dark.border}
                            strokeWidth={ringStroke}
                            fill="none"
                            opacity={0.2}
                        />
                        <Circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={ringRadius}
                            stroke={accentColor}
                            strokeWidth={ringStroke}
                            fill="none"
                            strokeDasharray={`${ringCircumference}`}
                            strokeDashoffset={ringOffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                            opacity={0.4}
                        />
                    </Svg>
                </View>

                {/* Challenge Animation */}
                <View style={styles.animationContent}>
                    <ChallengeAnimation type={challengeType} progress={progress} size={ringSize * 0.75} />
                </View>
            </Animated.View>

            {/* Timer */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.timerSection}>
                <Text style={[styles.timerText, { color: Colors.dark.text }]}>
                    {formatTime(remainingSeconds)}
                </Text>
                <Text style={[styles.progressText, { color: accentColor }]}>
                    {Math.round(progress * 100)}% hoàn thành
                </Text>

                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                    <Animated.View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${Math.round(progress * 100)}%` as any,
                                backgroundColor: accentColor,
                            },
                        ]}
                    />
                </View>
            </Animated.View>

            {/* Controls - always visible, not covered by overlay */}
            {!isPaused && (
                <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom + 16, 40) }]}>
                    <TouchableOpacity
                        style={styles.quitButton}
                        onPress={handleQuit}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.quitButtonText}>✕ Hủy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.pauseButton, { backgroundColor: Colors.dark.surfaceLight }]}
                        onPress={handlePause}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.pauseButtonText, { color: Colors.dark.text }]}>
                            ⏸ Tạm dừng
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Paused overlay - includes its own interactive buttons */}
            {isPaused && (
                <View style={styles.pausedOverlay}>
                    <View style={styles.pausedContent}>
                        <Text style={styles.pausedText}>⏸ Đang tạm dừng</Text>
                        <Text style={styles.pausedSubtext}>Nhấn "Tiếp tục" để quay lại thử thách</Text>

                        <View style={styles.pausedButtons}>
                            <TouchableOpacity
                                style={styles.pausedResumeButton}
                                onPress={handleResume}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.pausedResumeText}>▶ Tiếp tục</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.pausedQuitButton}
                                onPress={handleQuit}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.pausedQuitText}>✕ Hủy thử thách</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            {/* Track Selector Modal */}
            <TrackSelectorModal
                visible={showTrackSelector}
                onClose={() => setShowTrackSelector(false)}
                tracks={tracks}
                currentTrackId={currentTrack.id}
                onSelectTrack={changeTrack}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        alignItems: 'center',
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    challengeName: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        letterSpacing: 1,
    },
    totalTime: {
        fontSize: FontSize.sm,
        color: Colors.dark.textMuted,
        marginTop: Spacing.xs,
    },
    nowPlayingText: {
        fontSize: FontSize.xs,
        color: Colors.dark.primary,
        fontStyle: 'italic',
        marginTop: Spacing.sm,
        opacity: 0.8,
        maxWidth: '80%',
    },
    musicControls: {
        position: 'absolute',
        right: Spacing.lg,
        flexDirection: 'row',
        gap: Spacing.sm,
        zIndex: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.dark.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: FontSize.lg,
    },
    animationArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressRingContainer: {
        position: 'absolute',
    },
    animationContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerSection: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    timerText: {
        fontSize: FontSize.hero,
        fontWeight: '700',
        letterSpacing: 4,
        fontVariant: ['tabular-nums'],
    },
    progressText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        marginTop: Spacing.xs,
    },
    progressBarBg: {
        width: '80%',
        height: 4,
        backgroundColor: Colors.dark.border,
        borderRadius: 2,
        marginTop: Spacing.md,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    controls: {
        flexDirection: 'row',
        gap: Spacing.md,
        paddingHorizontal: Spacing.xl,
    },
    quitButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.dark.danger,
    },
    quitButtonText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.dark.danger,
    },
    pauseButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },
    pauseButtonText: {
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    pausedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    pausedContent: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        width: '100%',
        maxWidth: 400,
    },
    pausedText: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: Colors.dark.text,
        marginBottom: Spacing.sm,
    },
    pausedSubtext: {
        fontSize: FontSize.md,
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.xl,
    },
    pausedButtons: {
        width: '100%',
        gap: Spacing.md,
    },
    pausedResumeButton: {
        backgroundColor: Colors.dark.success,
        paddingVertical: Spacing.md + 4,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        shadowColor: Colors.dark.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    pausedResumeText: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: '#000',
    },
    pausedQuitButton: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.dark.danger,
    },
    pausedQuitText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.dark.danger,
    },
});
