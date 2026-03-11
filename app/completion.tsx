import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    BounceIn,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/themes';
import { ChallengeType, CHALLENGES } from '../src/constants/challenges';
import { formatTime } from '../src/hooks/useTimer';
import { getStreak } from '../src/utils/storage';

export default function CompletionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ type: string; duration: string }>();
    const challengeType = (params.type || 'ice_melt') as ChallengeType;
    const totalDuration = parseInt(params.duration || '3600', 10);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        getStreak().then(setStreak);
    }, []);

    const challengeConfig = CHALLENGES.find(c => c.id === challengeType) || CHALLENGES[0];
    const accentColor = challengeConfig.gradient[1];

    return (
        <SafeAreaView style={styles.container}>
            {/* Confetti emojis */}
            <View style={styles.confettiContainer}>
                {['🎉', '⭐', '🏆', '✨', '🎊', '💎', '🔥', '🌟'].map((emoji, i) => (
                    <Animated.Text
                        key={i}
                        entering={BounceIn.delay(i * 150).duration(600)}
                        style={[styles.confettiEmoji, {
                            left: `${10 + (i * 11)}%` as any,
                            top: `${5 + (i % 3) * 8}%` as any,
                        }]}
                    >
                        {emoji}
                    </Animated.Text>
                ))}
            </View>

            {/* Main content */}
            <View style={styles.content}>
                <Animated.Text
                    entering={BounceIn.delay(200).duration(800)}
                    style={styles.trophy}
                >
                    🏆
                </Animated.Text>

                <Animated.Text
                    entering={FadeIn.delay(500).duration(600)}
                    style={styles.title}
                >
                    Tuyệt vời!
                </Animated.Text>

                <Animated.Text
                    entering={FadeIn.delay(700).duration(600)}
                    style={styles.subtitle}
                >
                    {challengeConfig.completionMessage}
                </Animated.Text>

                {/* Stats cards */}
                <Animated.View entering={FadeInDown.delay(900).duration(500)} style={styles.statsRow}>
                    <View style={[styles.statCard, { borderColor: accentColor + '40' }]}>
                        <Text style={styles.statEmoji}>⏱️</Text>
                        <Text style={[styles.statValue, { color: accentColor }]}>
                            {formatTime(totalDuration)}
                        </Text>
                        <Text style={styles.statLabel}>Thời gian</Text>
                    </View>

                    <View style={[styles.statCard, { borderColor: Colors.dark.success + '40' }]}>
                        <Text style={styles.statEmoji}>🔥</Text>
                        <Text style={[styles.statValue, { color: Colors.dark.success }]}>
                            {streak}
                        </Text>
                        <Text style={styles.statLabel}>Chuỗi ngày</Text>
                    </View>

                    <View style={[styles.statCard, { borderColor: Colors.dark.accent + '40' }]}>
                        <Text style={styles.statEmoji}>
                            {challengeConfig.icon}
                        </Text>
                        <Text style={[styles.statValue, { color: Colors.dark.accentLight }]}>
                            {challengeConfig.name}
                        </Text>
                        <Text style={styles.statLabel}>Thử thách</Text>
                    </View>
                </Animated.View>

                {/* Motivational quote */}
                <Animated.View entering={FadeInDown.delay(1100).duration(500)} style={styles.quoteCard}>
                    <Text style={styles.quoteText}>
                        "Kỷ luật là cầu nối giữa mục tiêu và thành công"
                    </Text>
                    <Text style={styles.quoteAuthor}>— Jim Rohn</Text>
                </Animated.View>
            </View>

            {/* Actions */}
            <Animated.View entering={FadeInUp.delay(1300).duration(500)} style={styles.actions}>
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: accentColor }]}
                    onPress={() => router.replace({
                        pathname: '/challenge',
                        params: {
                            type: challengeType,
                            duration: totalDuration.toString(),
                        },
                    })}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>🔄 Thử thách lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.replace('/')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.secondaryButtonText}>🏠 Về trang chủ</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    confettiContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        zIndex: 1,
    },
    confettiEmoji: {
        position: 'absolute',
        fontSize: 28,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
    },
    trophy: {
        fontSize: 80,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.hero,
        fontWeight: '900',
        color: Colors.dark.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.lg,
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.xl,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
    },
    statEmoji: {
        fontSize: 24,
        marginBottom: Spacing.xs,
    },
    statValue: {
        fontSize: FontSize.lg,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: FontSize.xs,
        color: Colors.dark.textMuted,
        marginTop: Spacing.xs,
    },
    quoteCard: {
        backgroundColor: Colors.dark.glass,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.dark.glassBorder,
        width: '100%',
    },
    quoteText: {
        fontSize: FontSize.md,
        color: Colors.dark.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 24,
    },
    quoteAuthor: {
        fontSize: FontSize.sm,
        color: Colors.dark.textMuted,
        textAlign: 'right',
        marginTop: Spacing.sm,
    },
    actions: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
        gap: Spacing.md,
    },
    primaryButton: {
        paddingVertical: Spacing.md + 2,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonText: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: '#fff',
    },
    secondaryButton: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: FontSize.md,
        color: Colors.dark.textSecondary,
        fontWeight: '600',
    },
});
