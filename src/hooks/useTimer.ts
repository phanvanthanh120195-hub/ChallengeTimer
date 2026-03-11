import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseTimerProps {
    totalSeconds: number;
    onComplete: () => void;
    startTimestamp?: number;
}

export function useTimer({ totalSeconds, onComplete, startTimestamp }: UseTimerProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(startTimestamp || 0);
    const pausedAtRef = useRef<number>(0);
    const totalPausedRef = useRef<number>(0);
    const appStateRef = useRef(AppState.currentState);

    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    const progress = totalSeconds > 0 ? Math.min(1, elapsedSeconds / totalSeconds) : 0;

    const updateElapsed = useCallback(() => {
        if (!startTimeRef.current || isPaused) return;

        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current - totalPausedRef.current) / 1000);
        setElapsedSeconds(Math.min(elapsed, totalSeconds));

        if (elapsed >= totalSeconds) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            onComplete();
        }
    }, [totalSeconds, onComplete, isPaused]);

    const start = useCallback(() => {
        startTimeRef.current = startTimestamp || Date.now();
        totalPausedRef.current = 0;
        setElapsedSeconds(0);
        setIsRunning(true);
        setIsPaused(false);
    }, [startTimestamp]);

    const pause = useCallback(() => {
        if (!isPaused) {
            pausedAtRef.current = Date.now();
            setIsPaused(true);
        }
    }, [isPaused]);

    const resume = useCallback(() => {
        if (isPaused) {
            totalPausedRef.current += Date.now() - pausedAtRef.current;
            setIsPaused(false);
        }
    }, [isPaused]);

    const reset = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setElapsedSeconds(0);
        setIsRunning(false);
        setIsPaused(false);
        startTimeRef.current = 0;
        totalPausedRef.current = 0;
    }, []);

    // Main timer loop
    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(updateElapsed, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, isPaused, updateElapsed]);

    // Handle app going to background and coming back
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (
                appStateRef.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground - recalculate elapsed
                if (isRunning && !isPaused) {
                    updateElapsed();
                }
            }
            appStateRef.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [isRunning, isPaused, updateElapsed]);

    return {
        elapsedSeconds,
        remainingSeconds,
        progress,
        isPaused,
        isRunning,
        start,
        pause,
        resume,
        reset,
    };
}

export function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
}
