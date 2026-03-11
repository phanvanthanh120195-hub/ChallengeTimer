import { useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { AUDIO_TRACKS, AudioTrack } from '../constants/audio';
import { AppState, AppStateStatus } from 'react-native';

export function useAudio() {
    // Select a random track initially
    const getRandomTrack = () => AUDIO_TRACKS[Math.floor(Math.random() * AUDIO_TRACKS.length)];
    const defaultTrack = useRef(getRandomTrack()).current;

    // Use Refs for synchronous tracking to prevent race conditions & overlaps
    const soundRef = useRef<Audio.Sound | null>(null);
    const isLoadingRef = useRef(false);
    const intendedPlayingRef = useRef(false);
    const isMutedRef = useRef(false);

    const [currentTrack, setCurrentTrack] = useState<AudioTrack>(defaultTrack);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize audio mode
    useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
        }).catch(e => console.warn('Audio Setup Error:', e));
    }, []);

    const unloadCurrentSound = async () => {
        if (soundRef.current) {
            try {
                // Ensure it stops properly before unloading to prevent ghost sounds
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
            } catch (e) {
                // Ignore unload errors
            }
            soundRef.current = null;
        }
    };

    const loadTrack = useCallback(async (track: AudioTrack, shouldPlay: boolean = false) => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;

        if (shouldPlay) {
            intendedPlayingRef.current = true;
            setIsPlaying(true);
        }

        try {
            setIsLoaded(false);
            await unloadCurrentSound();

            const { sound: newSound } = await Audio.Sound.createAsync(
                track.file,
                {
                    shouldPlay: intendedPlayingRef.current,
                    isLooping: true,
                    isMuted: isMutedRef.current,
                }
            );

            soundRef.current = newSound;
            setCurrentTrack(track);
            setIsLoaded(true);
        } catch (error) {
            console.error('Error loading audio track:', error);
        } finally {
            isLoadingRef.current = false;
            // Catch up in case play/pause or mute changed while loading
            if (soundRef.current) {
                soundRef.current.setIsMutedAsync(isMutedRef.current).catch(() => {});
                if (intendedPlayingRef.current) {
                    soundRef.current.playAsync().catch(() => {});
                } else {
                    soundRef.current.pauseAsync().catch(() => {});
                }
            }
        }
    }, []);

    // Initial load
    useEffect(() => {
        if (!soundRef.current && !isLoadingRef.current) {
            // setTimeout prevents duplicate synchronous mount triggers
            setTimeout(() => {
                if (!soundRef.current && !isLoadingRef.current) {
                    loadTrack(defaultTrack, false);
                }
            }, 0);
        }
    }, [loadTrack, defaultTrack]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            unloadCurrentSound();
        };
    }, []);

    // Handle App State (pause music when app is in background, resume if it was playing)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
            if (!soundRef.current) return;

            if (nextAppState === 'active') {
                if (intendedPlayingRef.current) {
                    await soundRef.current.playAsync().catch(() => {});
                    setIsPlaying(true);
                }
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                const status = await soundRef.current.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    await soundRef.current.pauseAsync().catch(() => {});
                    setIsPlaying(false);
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const play = useCallback(async () => {
        intendedPlayingRef.current = true;
        setIsPlaying(true);
        if (soundRef.current) {
            await soundRef.current.playAsync().catch(() => {});
        } else if (!isLoadingRef.current && !isLoaded) {
            await loadTrack(currentTrack, true);
        }
    }, [isLoaded, currentTrack, loadTrack]);

    const pause = useCallback(async () => {
        intendedPlayingRef.current = false;
        setIsPlaying(false);
        if (soundRef.current) {
            await soundRef.current.pauseAsync().catch(() => {});
        }
    }, []);

    const toggleMute = useCallback(async () => {
        const newMutedState = !isMutedRef.current;
        isMutedRef.current = newMutedState;
        setIsMuted(newMutedState);
        
        if (soundRef.current) {
            await soundRef.current.setIsMutedAsync(newMutedState).catch(() => {});
        }
    }, []);

    const changeTrack = useCallback(async (trackId: string) => {
        const track = AUDIO_TRACKS.find(t => t.id === trackId);
        if (track && track.id !== currentTrack.id) {
            await loadTrack(track, intendedPlayingRef.current);
        }
    }, [currentTrack.id, loadTrack]);

    return {
        currentTrack,
        isPlaying,
        isMuted,
        isLoaded,
        tracks: AUDIO_TRACKS,
        play,
        pause,
        toggleMute,
        changeTrack,
    };
}
