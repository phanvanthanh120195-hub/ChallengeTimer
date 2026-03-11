import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChallengeRecord } from '../constants/challenges';

const HISTORY_KEY = '@challenge_history';
const ACTIVE_KEY = '@active_challenge';

export async function saveActiveChallenge(challenge: ChallengeRecord | null) {
    if (challenge) {
        await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(challenge));
    } else {
        await AsyncStorage.removeItem(ACTIVE_KEY);
    }
}

export async function getActiveChallenge(): Promise<ChallengeRecord | null> {
    const data = await AsyncStorage.getItem(ACTIVE_KEY);
    return data ? JSON.parse(data) : null;
}

export async function addToHistory(challenge: ChallengeRecord) {
    const history = await getHistory();
    history.unshift(challenge);
    // Keep only last 100 records
    const trimmed = history.slice(0, 100);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export async function getHistory(): Promise<ChallengeRecord[]> {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
}

export async function getStreak(): Promise<number> {
    const history = await getHistory();
    const completed = history.filter(h => h.status === 'completed');
    if (completed.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        const hasCompletion = completed.some(c => {
            if (!c.completedAt) return false;
            return c.completedAt.split('T')[0] === dateStr;
        });

        if (hasCompletion) {
            streak++;
        } else if (i > 0) {
            // Allow today to have no completion yet
            break;
        }
    }

    return streak;
}
