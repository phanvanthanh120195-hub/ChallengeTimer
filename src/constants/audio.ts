export type AudioTrack = {
    id: string;
    name: string;
    file: any;
};

export const AUDIO_TRACKS: AudioTrack[] = [
    {
        id: 'track1',
        name: 'Deep Focus Lofi',
        file: require('../../assets/audio/lofi/01.mp3'),
    },
    {
        id: 'track2',
        name: 'Chill Study Vibes',
        file: require('../../assets/audio/lofi/02.mp3'),
    },
    {
        id: 'track3',
        name: 'Aesthetic Rain Beats',
        file: require('../../assets/audio/lofi/03.mp3'),
    },
    {
        id: 'track4',
        name: 'Midnight Coding',
        file: require('../../assets/audio/lofi/04.mp3'),
    },
    {
        id: 'track5',
        name: 'Cozy Morning',
        file: require('../../assets/audio/lofi/05.mp3'),
    },
    {
        id: 'track6',
        name: 'Peaceful Ambient',
        file: require('../../assets/audio/lofi/06.mp3'),
    },
];
