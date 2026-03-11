export type ChallengeType =
    | 'ice_melt'
    | 'hourglass'
    | 'candle'
    | 'city_builder'
    | 'ocean_ship'
    | 'battery'
    | 'snow_mountain'
    | 'night_city'
    | 'planet'
    | 'train'
    | 'star_universe'
    | 'fireworks';

export interface ChallengeConfig {
    id: ChallengeType;
    name: string;
    description: string;
    icon: string;
    gradient: [string, string, string];
    completionMessage: string;
}

export const CHALLENGES: ChallengeConfig[] = [
    {
        id: 'ice_melt',
        name: 'Đá Tan',
        description: 'Khối băng tan dần khi bạn hoàn thành',
        icon: '🧊',
        gradient: ['#0288d1', '#4fc3f7', '#b3e5fc'],
        completionMessage: '🧊 Khối băng đã tan hoàn toàn!',
    },
    {
        id: 'hourglass',
        name: 'Đồng Hồ Cát',
        description: 'Cát chảy ngược lên khi bạn tiến bộ',
        icon: '⏳',
        gradient: ['#f57f17', '#ffd54f', '#fff9c4'],
        completionMessage: '⏳ Đồng hồ cát đã đảo ngược!',
    },
    {
        id: 'candle',
        name: 'Nến Cháy',
        description: 'Giữ ngọn lửa tập trung cháy ổn định',
        icon: '🕯️',
        gradient: ['#e65100', '#ff9800', '#ffe0b2'],
        completionMessage: '🔥 Bạn đã giữ ngọn lửa tập trung!',
    },
    {
        id: 'city_builder',
        name: 'Xây Thành Phố',
        description: 'Mỗi giờ xây thêm công trình mới',
        icon: '🏗️',
        gradient: ['#1565c0', '#42a5f5', '#bbdefb'],
        completionMessage: '🏙️ Thành phố đã hoàn chỉnh!',
    },
    {
        id: 'ocean_ship',
        name: 'Tàu Vượt Biển',
        description: 'Con tàu vượt đại dương đến đích',
        icon: '⛵',
        gradient: ['#01579b', '#039be5', '#81d4fa'],
        completionMessage: '🚢 Tàu đã cập bến thành công!',
    },
    {
        id: 'battery',
        name: 'Pin Năng Lượng',
        description: 'Sạc pin từ 0% đến 100%',
        icon: '🔋',
        gradient: ['#1b5e20', '#4caf50', '#c8e6c9'],
        completionMessage: '⚡ Pin đã sạc đầy 100%!',
    },
    {
        id: 'snow_mountain',
        name: 'Núi Tuyết Tan',
        description: 'Tuyết trên núi tan dần theo thời gian',
        icon: '🏔️',
        gradient: ['#4a148c', '#7c4dff', '#e8eaf6'],
        completionMessage: '☀️ Tuyết đã tan hết trên núi!',
    },
    {
        id: 'night_city',
        name: 'Thắp Sáng Phố',
        description: 'Mỗi giờ thêm ánh đèn sáng thành phố',
        icon: '🌃',
        gradient: ['#0d47a1', '#1e88e5', '#ffd54f'],
        completionMessage: '🌆 Thành phố đã sáng rực!',
    },
    {
        id: 'planet',
        name: 'Hành Tinh Quay',
        description: 'Hành tinh quay từ bình minh đến đêm',
        icon: '🌍',
        gradient: ['#1a237e', '#3f51b5', '#e8eaf6'],
        completionMessage: '🌏 Hành tinh đã quay một vòng!',
    },
    {
        id: 'train',
        name: 'Tàu Điện',
        description: 'Tàu đi qua các ga đến đích',
        icon: '🚆',
        gradient: ['#b71c1c', '#f44336', '#ffcdd2'],
        completionMessage: '🚉 Tàu đã đến ga cuối!',
    },
    {
        id: 'star_universe',
        name: 'Vũ Trụ Sao',
        description: 'Mỗi giờ thêm ngôi sao lấp lánh',
        icon: '✨',
        gradient: ['#1a1a2e', '#4a148c', '#e1bee7'],
        completionMessage: '🌌 Bầu trời đầy sao!',
    },
    {
        id: 'fireworks',
        name: 'Pháo Hoa',
        description: 'Tích lũy pháo hoa, nổ tung khi xong',
        icon: '🎆',
        gradient: ['#880e4f', '#e91e63', '#fce4ec'],
        completionMessage: '🎇 Pháo hoa rực rỡ!',
    },
];

export const TIME_PRESETS = [
    { label: '10 phút', seconds: 10 * 60 },
    { label: '25 phút', seconds: 25 * 60 },
    { label: '1 giờ', seconds: 60 * 60 },
    { label: '2 giờ', seconds: 2 * 60 * 60 },
    { label: '4 giờ', seconds: 4 * 60 * 60 },
    { label: '8 giờ', seconds: 8 * 60 * 60 },
];

export interface ChallengeRecord {
    id: string;
    type: ChallengeType;
    durationSeconds: number;
    startedAt: string;
    completedAt?: string;
    status: 'completed' | 'failed' | 'in_progress';
}
