import { useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { AUDIO_TRACKS, AudioTrack } from '../constants/audio';
import { AppState, AppStateStatus } from 'react-native';

export function useAudio() {
    // Select a random track initially
    const getRandomTrack = () => AUDIO_TRACKS[Math.floor(Math.random() * AUDIO_TRACKS.length)];
    const defaultTrack = useRef(getRandomTrack()).current;

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [currentTrack, setCurrentTrack] = useState<AudioTrack>(defaultTrack);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Keep track of intended playing state vs actual (for app backgrounding)
    const intendedPlayingRef = useRef(false);

    // Initialize audio mode
    useEffect(() => {
        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldDuckAndroid: true,
                });
            } catch (e) {
                console.warn('Audio Setup Error:', e);
            }
        };
        setupAudio();
    }, []);

    // Load track
    const loadTrack = useCallback(async (track: AudioTrack, shouldPlay: boolean = false) => {
        try {
            setIsLoaded(false);
            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                track.file,
                {
                    shouldPlay: shouldPlay && !isMuted,
                    isLooping: true,
                    isMuted: isMuted,
                }
            );

            setSound(newSound);
            setCurrentTrack(track);
            setIsLoaded(true);

            if (shouldPlay) {
                setIsPlaying(true);
                intendedPlayingRef.current = true;
            }
        } catch (error) {
            console.error('Error loading audio track:', error);
        }
    }, [sound, isMuted]);

    // Initial load
    useEffect(() => {
        if (!sound && !isLoaded) {
            loadTrack(defaultTrack, false);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    // Handle App State (pause music when app is in background, resume if it was playing)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
            if (!sound) return;

            if (nextAppState === 'active') {
                if (intendedPlayingRef.current) {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                const status = await sound.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [sound]);

    const play = useCallback(async () => {
        if (sound) {
            intendedPlayingRef.current = true;
            await sound.playAsync();
            setIsPlaying(true);
        } else if (!isLoaded) {
            await loadTrack(currentTrack, true);
        }
    }, [sound, isLoaded, currentTrack, loadTrack]);

    const pause = useCallback(async () => {
        if (sound) {
            intendedPlayingRef.current = false;
            await sound.pauseAsync();
            setIsPlaying(false);
        }
    }, [sound]);

    const toggleMute = useCallback(async () => {
        if (sound) {
            const newMutedState = !isMuted;
            await sound.setIsMutedAsync(newMutedState);
            setIsMuted(newMutedState);
        } else {
            setIsMuted(!isMuted);
        }
    }, [sound, isMuted]);

    const changeTrack = useCallback(async (trackId: string) => {
        const track = AUDIO_TRACKS.find(t => t.id === trackId);
        if (track && track.id !== currentTrack.id) {
            // Keep playing if it was currently playing
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
