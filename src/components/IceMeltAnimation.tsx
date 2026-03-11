import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    useSharedValue,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect, Ellipse, Circle } from 'react-native-svg';
import { Colors } from '../constants/themes';

interface IceMeltAnimationProps {
    progress: number; // 0 to 1
    size?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function IceMeltAnimation({ progress, size = 280 }: IceMeltAnimationProps) {
    const shimmer = useSharedValue(0);
    const dropY = useSharedValue(0);

    React.useEffect(() => {
        shimmer.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        dropY.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500, easing: Easing.in(Easing.quad) }),
                withTiming(0, { duration: 0 })
            ),
            -1
        );
    }, []);

    const iceScale = 1 - progress * 0.7; // Ice shrinks to 30% of original
    const meltLevel = progress; // Water level rises
    const iceOpacity = Math.max(0.3, 1 - progress * 0.8);

    const shimmerStyle = useAnimatedStyle(() => ({
        opacity: 0.3 + shimmer.value * 0.4,
    }));

    const dropStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: dropY.value * 40 }],
        opacity: 1 - dropY.value,
    }));

    const iceHeight = size * 0.6 * iceScale;
    const iceWidth = size * 0.5 * (1 - progress * 0.3);
    const waterHeight = size * 0.15 * meltLevel;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Glow effect behind ice */}
            <View style={[styles.glow, {
                width: size * 0.7,
                height: size * 0.7,
                borderRadius: size * 0.35,
                opacity: (1 - progress) * 0.3,
            }]} />

            {/* Water puddle */}
            <View style={[styles.waterContainer, { bottom: size * 0.05 }]}>
                <Svg width={size * 0.8} height={waterHeight + 20} viewBox={`0 0 ${size * 0.8} ${waterHeight + 20}`}>
                    <Defs>
                        <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={Colors.dark.iceGlow} stopOpacity="0.6" />
                            <Stop offset="1" stopColor={Colors.dark.primaryDark} stopOpacity="0.8" />
                        </LinearGradient>
                    </Defs>
                    <Ellipse
                        cx={size * 0.4}
                        cy={waterHeight + 10}
                        rx={size * 0.38}
                        ry={Math.max(8, waterHeight * 0.6)}
                        fill="url(#waterGrad)"
                    />
                </Svg>
            </View>

            {/* Ice block */}
            <View style={[styles.iceContainer, {
                bottom: size * 0.05 + Math.max(0, waterHeight * 0.3),
            }]}>
                <Svg width={iceWidth + 20} height={iceHeight + 20} viewBox={`0 0 ${iceWidth + 20} ${iceHeight + 20}`}>
                    <Defs>
                        <LinearGradient id="iceGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#e1f5fe" stopOpacity={iceOpacity.toString()} />
                            <Stop offset="0.3" stopColor="#81d4fa" stopOpacity={(iceOpacity * 0.9).toString()} />
                            <Stop offset="0.7" stopColor="#4fc3f7" stopOpacity={(iceOpacity * 0.8).toString()} />
                            <Stop offset="1" stopColor="#29b6f6" stopOpacity={(iceOpacity * 0.7).toString()} />
                        </LinearGradient>
                    </Defs>
                    <Rect
                        x={10}
                        y={10}
                        width={iceWidth}
                        height={iceHeight}
                        rx={iceWidth * 0.15}
                        ry={iceHeight * 0.1}
                        fill="url(#iceGrad)"
                    />
                    {/* Ice highlights */}
                    <Rect
                        x={iceWidth * 0.2 + 10}
                        y={iceHeight * 0.15 + 10}
                        width={iceWidth * 0.15}
                        height={iceHeight * 0.4}
                        rx={4}
                        fill="rgba(255,255,255,0.35)"
                    />
                    <Rect
                        x={iceWidth * 0.45 + 10}
                        y={iceHeight * 0.25 + 10}
                        width={iceWidth * 0.08}
                        height={iceHeight * 0.2}
                        rx={3}
                        fill="rgba(255,255,255,0.25)"
                    />
                </Svg>

                {/* Shimmer overlay */}
                <AnimatedView style={[styles.shimmer, shimmerStyle, {
                    width: iceWidth * 0.3,
                    height: iceHeight,
                    left: iceWidth * 0.15 + 10,
                    top: 10,
                }]} />
            </View>

            {/* Dripping water drops */}
            {progress > 0.05 && progress < 0.95 && (
                <>
                    <AnimatedView style={[styles.waterDrop, dropStyle, {
                        left: size * 0.42,
                        bottom: size * 0.1 + waterHeight * 0.3 + iceHeight * 0.3,
                    }]} />
                    <AnimatedView style={[styles.waterDrop, {
                        ...dropStyle,
                        left: size * 0.55,
                        bottom: size * 0.12 + waterHeight * 0.3 + iceHeight * 0.2,
                    }]} />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    glow: {
        position: 'absolute',
        backgroundColor: Colors.dark.iceGlow,
    },
    iceContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    shimmer: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 4,
    },
    waterContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    waterDrop: {
        position: 'absolute',
        width: 6,
        height: 10,
        borderRadius: 3,
        backgroundColor: Colors.dark.iceGlow,
        opacity: 0.7,
    },
});
