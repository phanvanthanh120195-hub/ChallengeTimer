import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    useSharedValue,
    Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Path, Rect, Line, Circle } from 'react-native-svg';
import { Colors } from '../constants/themes';

interface HourglassAnimationProps {
    progress: number; // 0 to 1
    size?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function HourglassAnimation({ progress, size = 280 }: HourglassAnimationProps) {
    const breathe = useSharedValue(1);
    const particleY = useSharedValue(0);

    React.useEffect(() => {
        breathe.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.98, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        particleY.value = withRepeat(
            withSequence(
                withTiming(-1, { duration: 2000, easing: Easing.linear }),
                withTiming(0, { duration: 0 })
            ),
            -1
        );
    }, []);

    const breatheStyle = useAnimatedStyle(() => ({
        transform: [{ scale: breathe.value }],
    }));

    const w = size;
    const h = size * 1.3;
    const glassW = w * 0.55;
    const glassH = h * 0.85;
    const neckW = glassW * 0.12;
    const halfH = glassH / 2;

    // Sand levels: top fills up as progress increases (reverse hourglass)
    const topSandHeight = halfH * 0.65 * progress;
    const bottomSandHeight = halfH * 0.65 * (1 - progress);

    // Glass outline path
    const cx = glassW / 2;
    const topLeft = glassW * 0.05;
    const topRight = glassW * 0.95;
    const neckLeft = cx - neckW / 2;
    const neckRight = cx + neckW / 2;

    const glassPath = `
    M ${topLeft} 0
    L ${topRight} 0
    L ${topRight} ${halfH * 0.08}
    Q ${topRight} ${halfH * 0.7} ${neckRight} ${halfH * 0.95}
    L ${neckRight} ${halfH * 1.05}
    Q ${topRight} ${halfH * 1.3} ${topRight} ${glassH * 0.92}
    L ${topRight} ${glassH}
    L ${topLeft} ${glassH}
    L ${topLeft} ${glassH * 0.92}
    Q ${topLeft} ${halfH * 1.3} ${neckLeft} ${halfH * 1.05}
    L ${neckLeft} ${halfH * 0.95}
    Q ${topLeft} ${halfH * 0.7} ${topLeft} ${halfH * 0.08}
    Z
  `;

    return (
        <View style={[styles.container, { width: w, height: h }]}>
            <AnimatedView style={[styles.glassContainer, breatheStyle]}>
                <Svg width={glassW + 20} height={glassH + 20} viewBox={`-10 -10 ${glassW + 20} ${glassH + 20}`}>
                    <Defs>
                        <LinearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={Colors.dark.sand} stopOpacity="0.9" />
                            <Stop offset="1" stopColor={Colors.dark.sandDark} stopOpacity="1" />
                        </LinearGradient>
                        <LinearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="rgba(255,255,255,0.15)" />
                            <Stop offset="0.5" stopColor="rgba(255,255,255,0.05)" />
                            <Stop offset="1" stopColor="rgba(255,255,255,0.12)" />
                        </LinearGradient>
                    </Defs>

                    {/* Glass body fill */}
                    <Path d={glassPath} fill="url(#glassGrad)" />

                    {/* Top sand (filling up) */}
                    {topSandHeight > 0 && (
                        <>
                            {/* Top bulb sand */}
                            <Rect
                                x={topLeft + glassW * 0.08}
                                y={halfH * 0.85 - topSandHeight}
                                width={glassW * 0.74}
                                height={topSandHeight}
                                fill="url(#sandGrad)"
                                rx={4}
                                clipPath="url(#topClip)"
                            />
                            {/* Sand surface curve */}
                            <Path
                                d={`M ${topLeft + glassW * 0.08} ${halfH * 0.85 - topSandHeight}
                    Q ${cx} ${halfH * 0.85 - topSandHeight - 6} ${topRight - glassW * 0.08} ${halfH * 0.85 - topSandHeight}`}
                                fill={Colors.dark.sand}
                                opacity={0.7}
                            />
                        </>
                    )}

                    {/* Bottom sand (draining) */}
                    {bottomSandHeight > 0 && (
                        <Rect
                            x={topLeft + glassW * 0.08}
                            y={glassH - bottomSandHeight - glassH * 0.05}
                            width={glassW * 0.74}
                            height={bottomSandHeight}
                            fill="url(#sandGrad)"
                            rx={4}
                        />
                    )}

                    {/* Sand stream through neck */}
                    {progress > 0.02 && progress < 0.98 && (
                        <Line
                            x1={cx}
                            y1={glassH - bottomSandHeight - glassH * 0.05}
                            x2={cx}
                            y2={halfH * 0.85 - topSandHeight + 2}
                            stroke={Colors.dark.sand}
                            strokeWidth={2}
                            opacity={0.6}
                        />
                    )}

                    {/* Floating sand particles */}
                    {progress > 0.02 && progress < 0.98 && (
                        <>
                            <Circle cx={cx - 2} cy={halfH * 0.95} r={1.5} fill={Colors.dark.sand} opacity={0.8} />
                            <Circle cx={cx + 1} cy={halfH * 1.02} r={1} fill={Colors.dark.sand} opacity={0.6} />
                            <Circle cx={cx} cy={halfH * 0.88} r={1.2} fill={Colors.dark.sand} opacity={0.7} />
                        </>
                    )}

                    {/* Glass outline */}
                    <Path d={glassPath} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />

                    {/* Glass highlight */}
                    <Line
                        x1={topLeft + glassW * 0.12}
                        y1={halfH * 0.15}
                        x2={neckLeft + 2}
                        y2={halfH * 0.8}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={1.5}
                    />

                    {/* Frame top */}
                    <Rect x={-5} y={-4} width={glassW + 10} height={6} rx={3} fill="rgba(255,255,255,0.25)" />
                    {/* Frame bottom */}
                    <Rect x={-5} y={glassH - 2} width={glassW + 10} height={6} rx={3} fill="rgba(255,255,255,0.25)" />
                </Svg>
            </AnimatedView>

            {/* Glow */}
            <View style={[styles.glow, {
                width: glassW * 0.7,
                height: glassH * 0.5,
                borderRadius: glassW * 0.35,
                backgroundColor: Colors.dark.sandDark,
                opacity: 0.1,
            }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glassContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    glow: {
        position: 'absolute',
    },
});
