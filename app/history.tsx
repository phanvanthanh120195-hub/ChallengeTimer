import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/themes';
import { ChallengeRecord } from '../src/constants/challenges';
import { getHistory, getStreak } from '../src/utils/storage';
import { formatTime } from '../src/hooks/useTimer';

export default function HistoryScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<ChallengeRecord[]>([]);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        getHistory().then(setHistory);
        getStreak().then(setStreak);
    }, []);

    const completedCount = history.filter(h => h.status === 'completed').length;
    const failedCount = history.filter(h => h.status === 'failed').length;
    const totalMinutes = history
        .filter(h => h.status === 'completed')
        .reduce((sum, h) => sum + h.durationSeconds, 0) / 60;

    const renderItem = ({ item, index }: { item: ChallengeRecord; index: number }) => {
        const isCompleted = item.status === 'completed';
        const date = new Date(item.startedAt);
        const dateStr = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 80).duration(400)}
                style={[
                    styles.historyItem,
                    { borderLeftColor: isCompleted ? Colors.dark.success : Colors.dark.danger },
                ]}
            >
                <View style={styles.historyLeft}>
                    <Text style={styles.historyIcon}>
                        {item.type === 'ice_melt' ? '🧊' : '⏳'}
                    </Text>
                    <View>
                        <Text style={styles.historyTitle}>
                            {item.type === 'ice_melt' ? 'Đá Tan' : 'Đồng Hồ Cát'}
                        </Text>
                        <Text style={styles.historyDate}>{dateStr}</Text>
                    </View>
                </View>
                <View style={styles.historyRight}>
                    <Text style={[
                        styles.historyStatus,
                        { color: isCompleted ? Colors.dark.success : Colors.dark.danger },
                    ]}>
                        {isCompleted ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.historyDuration}>
                        {formatTime(item.durationSeconds)}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.title}>📊 Lịch sử thử thách</Text>
            </Animated.View>

            {/* Summary Stats */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryEmoji}>🔥</Text>
                    <Text style={[styles.summaryValue, { color: Colors.dark.warning }]}>{streak}</Text>
                    <Text style={styles.summaryLabel}>Streak</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryEmoji}>✅</Text>
                    <Text style={[styles.summaryValue, { color: Colors.dark.success }]}>{completedCount}</Text>
                    <Text style={styles.summaryLabel}>Hoàn thành</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryEmoji}>❌</Text>
                    <Text style={[styles.summaryValue, { color: Colors.dark.danger }]}>{failedCount}</Text>
                    <Text style={styles.summaryLabel}>Thất bại</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryEmoji}>⏱️</Text>
                    <Text style={[styles.summaryValue, { color: Colors.dark.primary }]}>
                        {Math.round(totalMinutes)}
                    </Text>
                    <Text style={styles.summaryLabel}>Phút</Text>
                </View>
            </Animated.View>

            {/* History List */}
            {history.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>Chưa có thử thách nào</Text>
                    <Text style={styles.emptySubtext}>Bắt đầu thử thách đầu tiên nào!</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    backButton: {
        marginBottom: Spacing.md,
    },
    backText: {
        fontSize: FontSize.md,
        color: Colors.dark.primary,
        fontWeight: '600',
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: Colors.dark.text,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        alignItems: 'center',
    },
    summaryEmoji: {
        fontSize: 20,
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: FontSize.xl,
        fontWeight: '800',
    },
    summaryLabel: {
        fontSize: FontSize.xs,
        color: Colors.dark.textMuted,
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    historyItem: {
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 3,
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    historyIcon: {
        fontSize: 28,
    },
    historyTitle: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.dark.text,
    },
    historyDate: {
        fontSize: FontSize.xs,
        color: Colors.dark.textMuted,
        marginTop: 2,
    },
    historyRight: {
        alignItems: 'flex-end',
    },
    historyStatus: {
        fontSize: 18,
    },
    historyDuration: {
        fontSize: FontSize.sm,
        color: Colors.dark.textSecondary,
        fontWeight: '600',
        marginTop: 2,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: Spacing.md,
    },
    emptyText: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.dark.text,
    },
    emptySubtext: {
        fontSize: FontSize.md,
        color: Colors.dark.textMuted,
        marginTop: Spacing.xs,
    },
});
