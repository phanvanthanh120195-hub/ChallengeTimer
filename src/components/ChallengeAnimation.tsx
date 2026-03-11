import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    useSharedValue,
    Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect, Ellipse, Circle, Line, Path } from 'react-native-svg';
import { Colors } from '../constants/themes';
import { ChallengeType } from '../constants/challenges';
import { IceMeltAnimation } from './IceMeltAnimation';
import { HourglassAnimation } from './HourglassAnimation';

interface ChallengeAnimationProps {
    type: ChallengeType;
    progress: number;
    size?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

// ==================== CANDLE ====================
function CandleAnimation({ progress, size }: { progress: number; size: number }) {
    const flicker = useSharedValue(1);
    const sway = useSharedValue(0);

    React.useEffect(() => {
        flicker.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 200 + Math.random() * 300 }),
                withTiming(1, { duration: 200 + Math.random() * 300 }),
                withTiming(0.85, { duration: 150 }),
                withTiming(1, { duration: 250 })
            ), -1, true
        );
        sway.value = withRepeat(
            withSequence(
                withTiming(3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ), -1, true
        );
    }, []);

    const flickerStyle = useAnimatedStyle(() => ({
        opacity: flicker.value,
        transform: [{ rotate: `${sway.value}deg` }],
    }));

    const candleH = size * 0.5 * (1 - progress * 0.85);
    const waxDrip = progress * size * 0.15;

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            {/* Wax pool */}
            <View style={[styles.centered, { position: 'absolute', bottom: size * 0.08 }]}>
                <Svg width={size * 0.5} height={30}>
                    <Ellipse cx={size * 0.25} cy={15} rx={size * 0.2} ry={Math.max(4, waxDrip * 0.8)} fill="#f5e6ca" opacity={0.6} />
                </Svg>
            </View>

            {/* Candle body */}
            <View style={{ position: 'absolute', bottom: size * 0.1, alignItems: 'center' }}>
                <Svg width={size * 0.2} height={candleH + 10} viewBox={`0 0 ${size * 0.2} ${candleH + 10}`}>
                    <Defs>
                        <LinearGradient id="candleGrad" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="#ffe0b2" />
                            <Stop offset="0.5" stopColor="#fff8e1" />
                            <Stop offset="1" stopColor="#ffe0b2" />
                        </LinearGradient>
                    </Defs>
                    <Rect x={2} y={5} width={size * 0.2 - 4} height={candleH} rx={4} fill="url(#candleGrad)" />
                    {/* Wick */}
                    <Line x1={size * 0.1} y1={0} x2={size * 0.1} y2={8} stroke="#333" strokeWidth={2} />
                </Svg>
            </View>

            {/* Flame */}
            {candleH > 10 && (
                <AnimatedView style={[{
                    position: 'absolute',
                    bottom: size * 0.1 + candleH + 5,
                    alignItems: 'center',
                }, flickerStyle]}>
                    <Text style={{ fontSize: Math.max(20, 40 * (1 - progress * 0.5)) }}>🔥</Text>
                </AnimatedView>
            )}
        </View>
    );
}

// ==================== CITY BUILDER ====================
function CityBuilderAnimation({ progress, size }: { progress: number; size: number }) {
    const buildPhase = Math.floor(progress * 8); // 0-7 phases

    const buildings = [
        { emoji: '🏗️', minPhase: 0 },
        { emoji: '🏠', minPhase: 1 },
        { emoji: '🏢', minPhase: 2 },
        { emoji: '🏬', minPhase: 3 },
        { emoji: '🏛️', minPhase: 4 },
        { emoji: '🏙️', minPhase: 5 },
        { emoji: '🌳', minPhase: 5 },
        { emoji: '⛲', minPhase: 6 },
        { emoji: '🏰', minPhase: 7 },
    ];

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            {/* Ground */}
            <View style={{ position: 'absolute', bottom: size * 0.05, width: size * 0.9, height: 4, backgroundColor: '#4caf50', borderRadius: 2, opacity: 0.5 }} />

            {/* Road */}
            {buildPhase >= 1 && (
                <View style={{ position: 'absolute', bottom: size * 0.08, width: size * 0.7, height: 3, backgroundColor: '#616161', borderRadius: 2 }} />
            )}

            {/* Buildings grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, maxWidth: size * 0.8, marginTop: size * 0.15 }}>
                {buildings.filter(b => buildPhase >= b.minPhase).map((b, i) => (
                    <Animated.Text
                        key={i}
                        style={{ fontSize: 28 + Math.min(i * 2, 10), opacity: 0.9 }}
                    >
                        {b.emoji}
                    </Animated.Text>
                ))}
            </View>

            {/* Progress label */}
            <Text style={styles.phaseLabel}>
                {buildPhase === 0 ? '🏗️ Bãi đất trống' :
                    buildPhase < 4 ? '🏠 Đang xây dựng...' :
                        buildPhase < 7 ? '🏙️ Thành phố lớn dần' :
                            '🌆 Thành phố hoàn chỉnh!'}
            </Text>
        </View>
    );
}

// ==================== OCEAN SHIP ====================
function OceanShipAnimation({ progress, size }: { progress: number; size: number }) {
    const bob = useSharedValue(0);
    const wave = useSharedValue(0);

    React.useEffect(() => {
        bob.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                withTiming(5, { duration: 1200, easing: Easing.inOut(Easing.ease) })
            ), -1, true
        );
        wave.value = withRepeat(
            withTiming(1, { duration: 3000, easing: Easing.linear }), -1
        );
    }, []);

    const bobStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: bob.value },
            { rotate: `${bob.value * 0.5}deg` },
        ],
    }));

    const shipX = progress * size * 0.7;

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            {/* Sky gradient line */}
            <View style={{ position: 'absolute', top: size * 0.2, width: size * 0.9, height: 1, backgroundColor: '#1565c0', opacity: 0.3 }} />

            {/* Islands */}
            <Text style={{ position: 'absolute', left: size * 0.05, top: size * 0.3, fontSize: 28 }}>🏝️</Text>
            <Text style={{ position: 'absolute', right: size * 0.05, top: size * 0.3, fontSize: 28, opacity: progress > 0.7 ? 1 : 0.3 }}>🏖️</Text>

            {/* Ship path indicator */}
            <View style={{ position: 'absolute', top: size * 0.45, left: size * 0.12, width: size * 0.76, height: 2, backgroundColor: '#1565c0', opacity: 0.15, borderRadius: 1 }} />
            <View style={{ position: 'absolute', top: size * 0.45, left: size * 0.12, width: shipX, height: 2, backgroundColor: '#42a5f5', borderRadius: 1 }} />

            {/* Ship */}
            <AnimatedView style={[{
                position: 'absolute',
                left: size * 0.08 + shipX,
                top: size * 0.35,
            }, bobStyle]}>
                <Text style={{ fontSize: 36 }}>⛵</Text>
            </AnimatedView>

            {/* Waves */}
            <View style={{ position: 'absolute', bottom: size * 0.15, flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontSize: 18, opacity: 0.5 }}>🌊</Text>
                <Text style={{ fontSize: 14, opacity: 0.3 }}>🌊</Text>
                <Text style={{ fontSize: 18, opacity: 0.4 }}>🌊</Text>
                <Text style={{ fontSize: 14, opacity: 0.3 }}>🌊</Text>
            </View>
        </View>
    );
}

// ==================== BATTERY ====================
function BatteryAnimation({ progress, size }: { progress: number; size: number }) {
    const pulse = useSharedValue(1);

    React.useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ), -1, true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    const pct = Math.round(progress * 100);
    const fillColor = pct < 25 ? '#f44336' : pct < 50 ? '#ff9800' : pct < 75 ? '#ffc107' : '#4caf50';
    const battW = size * 0.35;
    const battH = size * 0.6;
    const fillH = battH * 0.85 * progress;

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            <AnimatedView style={pulseStyle}>
                <Svg width={battW + 20} height={battH + 20} viewBox={`0 0 ${battW + 20} ${battH + 20}`}>
                    <Defs>
                        <LinearGradient id="battFill" x1="0" y1="1" x2="0" y2="0">
                            <Stop offset="0" stopColor={fillColor} stopOpacity="0.9" />
                            <Stop offset="1" stopColor={fillColor} stopOpacity="0.6" />
                        </LinearGradient>
                    </Defs>
                    {/* Terminal */}
                    <Rect x={battW * 0.3 + 10} y={2} width={battW * 0.4} height={8} rx={3} fill="rgba(255,255,255,0.3)" />
                    {/* Body outline */}
                    <Rect x={10} y={10} width={battW} height={battH} rx={8} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2.5} />
                    {/* Fill */}
                    <Rect x={14} y={battH + 6 - fillH} width={battW - 8} height={fillH} rx={5} fill="url(#battFill)" />
                </Svg>

                {/* Percentage */}
                <View style={[StyleSheet.absoluteFill, styles.centered]}>
                    <Text style={[styles.batteryPct, { color: pct > 50 ? '#fff' : fillColor }]}>
                        {pct}%
                    </Text>
                    {progress < 1 && <Text style={{ fontSize: 16, marginTop: 2 }}>⚡</Text>}
                </View>
            </AnimatedView>
        </View>
    );
}

// ==================== SNOW MOUNTAIN ====================
function SnowMountainAnimation({ progress, size }: { progress: number; size: number }) {
    const snowCap = 1 - progress; // snow decreases as progress increases
    const sunY = size * 0.1 + progress * size * 0.15;
    const sunSize = 20 + progress * 15;

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            {/* Sun */}
            <Text style={{ position: 'absolute', top: sunY, right: size * 0.15, fontSize: sunSize }}>
                {progress < 0.5 ? '🌤️' : '☀️'}
            </Text>

            {/* Mountain */}
            <Svg width={size * 0.8} height={size * 0.65} viewBox={`0 0 ${size * 0.8} ${size * 0.65}`} style={{ position: 'absolute', bottom: size * 0.05 }}>
                <Defs>
                    <LinearGradient id="mtnGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#78909c" />
                        <Stop offset="1" stopColor="#455a64" />
                    </LinearGradient>
                    <LinearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
                        <Stop offset="1" stopColor="#e0e0e0" stopOpacity="0.3" />
                    </LinearGradient>
                </Defs>
                {/* Mountain body */}
                <Path d={`M ${size * 0.4} 10 L ${size * 0.75} ${size * 0.6} L ${size * 0.05} ${size * 0.6} Z`} fill="url(#mtnGrad)" />
                {/* Snow cap */}
                {snowCap > 0.05 && (
                    <Path
                        d={`M ${size * 0.4} 10 L ${size * 0.4 + size * 0.18 * snowCap} ${size * 0.6 * (1 - snowCap * 0.6)} L ${size * 0.4 - size * 0.18 * snowCap} ${size * 0.6 * (1 - snowCap * 0.6)} Z`}
                        fill="url(#snowGrad)"
                    />
                )}
            </Svg>

            {/* Water drops (melting) */}
            {progress > 0.1 && progress < 0.95 && (
                <View style={{ position: 'absolute', bottom: size * 0.02, flexDirection: 'row', gap: 4 }}>
                    <Text style={{ fontSize: 12, opacity: 0.6 }}>💧</Text>
                    <Text style={{ fontSize: 10, opacity: 0.4 }}>💧</Text>
                </View>
            )}
        </View>
    );
}

// ==================== NIGHT CITY ====================
function NightCityAnimation({ progress, size }: { progress: number; size: number }) {
    const twinkle = useSharedValue(0.5);

    React.useEffect(() => {
        twinkle.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.5, { duration: 1000 })
            ), -1, true
        );
    }, []);

    const twinkleStyle = useAnimatedStyle(() => ({
        opacity: twinkle.value,
    }));

    const lightsCount = Math.floor(progress * 12);
    const skyBrightness = progress * 0.3;

    const lightPositions = [
        { x: 0.15, y: 0.45 }, { x: 0.3, y: 0.38 }, { x: 0.45, y: 0.42 },
        { x: 0.6, y: 0.35 }, { x: 0.75, y: 0.4 }, { x: 0.85, y: 0.45 },
        { x: 0.2, y: 0.55 }, { x: 0.4, y: 0.52 }, { x: 0.55, y: 0.58 },
        { x: 0.7, y: 0.5 }, { x: 0.35, y: 0.48 }, { x: 0.65, y: 0.55 },
    ];

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            {/* Sky */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(25, 25, 60, ${1 - skyBrightness})`, borderRadius: 16 }]} />

            {/* Stars */}
            {progress < 0.5 && (
                <AnimatedView style={[{ position: 'absolute', top: size * 0.1, right: size * 0.2 }, twinkleStyle]}>
                    <Text style={{ fontSize: 14 }}>⭐</Text>
                </AnimatedView>
            )}

            {/* Moon/Sun transition */}
            <Text style={{ position: 'absolute', top: size * 0.08, right: size * 0.12, fontSize: 22 }}>
                {progress < 0.8 ? '🌙' : '🌅'}
            </Text>

            {/* Buildings silhouette */}
            <View style={{ position: 'absolute', bottom: size * 0.05, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                {['🏢', '🏬', '🏗️', '🏛️', '🏢', '🏠', '🏢'].map((b, i) => (
                    <Text key={i} style={{ fontSize: 24 + (i % 3) * 6, opacity: 0.7 }}>{b}</Text>
                ))}
            </View>

            {/* Lights */}
            {lightPositions.slice(0, lightsCount).map((pos, i) => (
                <AnimatedView
                    key={i}
                    style={[{
                        position: 'absolute',
                        left: pos.x * size,
                        top: pos.y * size,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#ffd54f',
                    }, i % 3 === 0 ? twinkleStyle : {}]}
                />
            ))}

            <Text style={[styles.phaseLabel, { bottom: 0 }]}>
                {lightsCount === 0 ? '🌑 Tối đen' :
                    lightsCount < 6 ? '🌃 Ánh đèn le lói' :
                        lightsCount < 10 ? '✨ Phố sáng dần' :
                            '🌆 Thành phố rực sáng!'}
            </Text>
        </View>
    );
}

// ==================== PLANET ====================
function PlanetAnimation({ progress, size }: { progress: number; size: number }) {
    const rotate = useSharedValue(0);

    React.useEffect(() => {
        rotate.value = withRepeat(
            withTiming(360, { duration: 20000, easing: Easing.linear }), -1
        );
    }, []);

    const rotateStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }],
    }));

    const phase = progress < 0.25 ? '🌅 Bình minh' :
        progress < 0.5 ? '☀️ Giữa trưa' :
            progress < 0.75 ? '🌇 Hoàng hôn' : '🌙 Đêm';
    const phaseEmoji = progress < 0.25 ? '🌅' : progress < 0.5 ? '☀️' : progress < 0.75 ? '🌇' : '🌙';

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            {/* Orbit ring */}
            <View style={{ position: 'absolute', width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* Planet */}
            <AnimatedView style={rotateStyle}>
                <Text style={{ fontSize: 70 }}>🌍</Text>
            </AnimatedView>

            {/* Phase indicator */}
            <Text style={{ position: 'absolute', top: size * 0.08, fontSize: 30 }}>{phaseEmoji}</Text>

            <Text style={[styles.phaseLabel, { bottom: size * 0.02 }]}>{phase}</Text>
        </View>
    );
}

// ==================== TRAIN ====================
function TrainAnimation({ progress, size }: { progress: number; size: number }) {
    const chug = useSharedValue(0);

    React.useEffect(() => {
        chug.value = withRepeat(
            withSequence(
                withTiming(-2, { duration: 200 }),
                withTiming(2, { duration: 200 })
            ), -1, true
        );
    }, []);

    const chugStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: chug.value }],
    }));

    const stations = ['🚉 Start', '🏘️ Ga 1', '🏙️ Ga 2', '🌆 Ga 3', '🎯 Đích'];
    const currentStation = Math.min(Math.floor(progress * 5), 4);
    const trainX = progress * size * 0.75;

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            {/* Track */}
            <View style={{ position: 'absolute', top: size * 0.45, left: size * 0.08, width: size * 0.84, height: 3, backgroundColor: '#616161' }} />

            {/* Rail ties */}
            {Array.from({ length: 12 }).map((_, i) => (
                <View key={i} style={{
                    position: 'absolute',
                    top: size * 0.44,
                    left: size * 0.08 + i * (size * 0.84 / 12),
                    width: 2,
                    height: 6,
                    backgroundColor: '#424242',
                }} />
            ))}

            {/* Station dots */}
            {stations.map((s, i) => {
                const x = size * 0.08 + (i / 4) * size * 0.75;
                const passed = i <= currentStation;
                return (
                    <View key={i} style={{ position: 'absolute', top: size * 0.5, left: x - 4, alignItems: 'center' }}>
                        <View style={{
                            width: 10, height: 10, borderRadius: 5,
                            backgroundColor: passed ? '#4caf50' : '#424242',
                            borderWidth: 2, borderColor: passed ? '#81c784' : '#616161',
                        }} />
                        <Text style={{ fontSize: 9, color: passed ? '#81c784' : '#616161', marginTop: 4, fontWeight: '600', width: 45, textAlign: 'center' }}>
                            {s}
                        </Text>
                    </View>
                );
            })}

            {/* Train */}
            <AnimatedView style={[{
                position: 'absolute',
                top: size * 0.32,
                left: size * 0.04 + trainX,
            }, chugStyle]}>
                <Text style={{ fontSize: 32 }}>🚆</Text>
            </AnimatedView>
        </View>
    );
}

// ==================== STAR UNIVERSE ====================
function StarUniverseAnimation({ progress, size }: { progress: number; size: number }) {
    const twinkle = useSharedValue(0.6);

    React.useEffect(() => {
        twinkle.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1200 }),
                withTiming(0.4, { duration: 1200 })
            ), -1, true
        );
    }, []);

    const twinkleStyle = useAnimatedStyle(() => ({
        opacity: twinkle.value,
    }));

    const totalStars = Math.floor(progress * 20);

    // Deterministic star positions
    const starPositions = Array.from({ length: 20 }).map((_, i) => ({
        x: ((i * 37 + 13) % 80 + 10) / 100,
        y: ((i * 53 + 7) % 70 + 10) / 100,
        size: 10 + (i % 4) * 6,
        emoji: i % 5 === 0 ? '⭐' : i % 7 === 0 ? '🌟' : '✨',
    }));

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            {/* Dark sky */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0a1a', borderRadius: size * 0.4 }]} />

            {/* Stars */}
            {starPositions.slice(0, totalStars).map((star, i) => (
                <AnimatedView
                    key={i}
                    style={[{
                        position: 'absolute',
                        left: star.x * size,
                        top: star.y * size,
                    }, i % 3 === 0 ? twinkleStyle : { opacity: 0.8 }]}
                >
                    <Text style={{ fontSize: star.size }}>{star.emoji}</Text>
                </AnimatedView>
            ))}

            {/* Galaxy center */}
            {progress > 0.6 && (
                <Text style={{ fontSize: 24, opacity: progress - 0.5 }}>🌌</Text>
            )}

            <Text style={[styles.phaseLabel, { bottom: size * 0.02 }]}>
                {totalStars < 5 ? '🌑 Bầu trời trống' :
                    totalStars < 12 ? `✨ ${totalStars} ngôi sao` :
                        '🌌 Bầu trời đầy sao!'}
            </Text>
        </View>
    );
}

// ==================== FIREWORKS ====================
function FireworksAnimation({ progress, size }: { progress: number; size: number }) {
    const pulse = useSharedValue(1);

    React.useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 500 }),
                withTiming(1, { duration: 500 })
            ), -1, true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: progress >= 1 ? pulse.value : 1 }],
    }));

    const rockets = Math.floor(progress * 8);
    const rocketPositions = [
        { x: 0.2, y: 0.5 }, { x: 0.5, y: 0.4 }, { x: 0.8, y: 0.5 },
        { x: 0.35, y: 0.55 }, { x: 0.65, y: 0.45 }, { x: 0.15, y: 0.6 },
        { x: 0.5, y: 0.55 }, { x: 0.85, y: 0.58 },
    ];

    return (
        <View style={[styles.centered, { width: size, height: size }]}>
            {/* Dark sky */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0d0d1a', borderRadius: 20 }]} />

            {/* Rockets collecting */}
            {rocketPositions.slice(0, rockets).map((pos, i) => (
                <Text key={i} style={{
                    position: 'absolute',
                    left: pos.x * size,
                    top: pos.y * size,
                    fontSize: 22,
                }}>
                    🧨
                </Text>
            ))}

            {/* Final explosion */}
            {progress >= 0.95 && (
                <AnimatedView style={[styles.centered, pulseStyle]}>
                    <Text style={{ fontSize: 50 }}>🎆</Text>
                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                        <Text style={{ fontSize: 20 }}>🎇</Text>
                        <Text style={{ fontSize: 28 }}>🎆</Text>
                        <Text style={{ fontSize: 20 }}>🎇</Text>
                    </View>
                </AnimatedView>
            )}

            <Text style={[styles.phaseLabel, { bottom: size * 0.02 }]}>
                {rockets < 3 ? `🧨 Tích lũy: ${rockets}/8 pháo` :
                    rockets < 8 ? `🧨 Đã có ${rockets}/8 pháo!` :
                        '🎆 Sẵn sàng nổ!'}
            </Text>
        </View>
    );
}

// ==================== MAIN COMPONENT ====================
export function ChallengeAnimation({ type, progress, size = 280 }: ChallengeAnimationProps) {
    switch (type) {
        case 'ice_melt':
            return <IceMeltAnimation progress={progress} size={size} />;
        case 'hourglass':
            return <HourglassAnimation progress={progress} size={size} />;
        case 'candle':
            return <CandleAnimation progress={progress} size={size} />;
        case 'city_builder':
            return <CityBuilderAnimation progress={progress} size={size} />;
        case 'ocean_ship':
            return <OceanShipAnimation progress={progress} size={size} />;
        case 'battery':
            return <BatteryAnimation progress={progress} size={size} />;
        case 'snow_mountain':
            return <SnowMountainAnimation progress={progress} size={size} />;
        case 'night_city':
            return <NightCityAnimation progress={progress} size={size} />;
        case 'planet':
            return <PlanetAnimation progress={progress} size={size} />;
        case 'train':
            return <TrainAnimation progress={progress} size={size} />;
        case 'star_universe':
            return <StarUniverseAnimation progress={progress} size={size} />;
        case 'fireworks':
            return <FireworksAnimation progress={progress} size={size} />;
        default:
            return <IceMeltAnimation progress={progress} size={size} />;
    }
}

const styles = StyleSheet.create({
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    phaseLabel: {
        position: 'absolute',
        bottom: 8,
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        textAlign: 'center',
    },
    batteryPct: {
        fontSize: 22,
        fontWeight: '800',
    },
});
