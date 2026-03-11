import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== TOAST ====================
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
    id: number;
    text: string;
    type: ToastType;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

interface ToastContextType {
    showToast: (text: string, type?: ToastType, duration?: number) => void;
    showConfirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => { },
    showConfirm: () => { },
});

export const useToast = () => useContext(ToastContext);

// ==================== SINGLE TOAST ITEM ====================
function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
    const translateY = useSharedValue(-80);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
        opacity.value = withTiming(1, { duration: 200 });
    }, []);

    const dismiss = useCallback(() => {
        translateY.value = withTiming(-80, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onDismiss)(toast.id);
        });
    }, [toast.id]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
        success: { bg: '#0d2818', border: Colors.dark.success, icon: '✅' },
        error: { bg: '#2d0a0a', border: Colors.dark.danger, icon: '❌' },
        warning: { bg: '#2d2200', border: Colors.dark.warning, icon: '⚠️' },
        info: { bg: '#0a1a2d', border: Colors.dark.primary, icon: 'ℹ️' },
    };

    const c = colors[toast.type];

    return (
        <Animated.View style={[styles.toastItem, animStyle, { backgroundColor: c.bg, borderColor: c.border }]}>
            <Text style={styles.toastIcon}>{c.icon}</Text>
            <Text style={styles.toastText}>{toast.text}</Text>
            <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.toastDismiss}>✕</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ==================== CONFIRM MODAL ====================
function ConfirmModal({ options, onClose }: { options: ConfirmOptions; onClose: () => void }) {
    const overlayOpacity = useSharedValue(0);
    const cardScale = useSharedValue(0.85);
    const cardOpacity = useSharedValue(0);

    React.useEffect(() => {
        overlayOpacity.value = withTiming(1, { duration: 200 });
        cardScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.2)) });
        cardOpacity.value = withTiming(1, { duration: 200 });
    }, []);

    const closeWithAnimation = useCallback((callback?: () => void) => {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        cardScale.value = withTiming(0.85, { duration: 200 });
        cardOpacity.value = withTiming(0, { duration: 150 }, () => {
            runOnJS(onClose)();
            if (callback) {
                runOnJS(callback)();
            }
        });
    }, [onClose]);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
        opacity: cardOpacity.value,
    }));

    return (
        <View style={styles.confirmContainer}>
            <Animated.View style={[styles.confirmOverlay, overlayStyle]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={() => closeWithAnimation(options.onCancel)}
                />
            </Animated.View>

            <Animated.View style={[styles.confirmCard, cardStyle]}>
                <Text style={styles.confirmIcon}>⚠️</Text>
                <Text style={styles.confirmTitle}>{options.title}</Text>
                <Text style={styles.confirmMessage}>{options.message}</Text>

                <View style={styles.confirmButtons}>
                    <TouchableOpacity
                        style={styles.confirmCancelBtn}
                        onPress={() => closeWithAnimation(options.onCancel)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.confirmCancelText}>{options.cancelText || 'Hủy bỏ'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.confirmActionBtn, { backgroundColor: options.confirmColor || Colors.dark.danger }]}
                        onPress={() => closeWithAnimation(options.onConfirm)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.confirmActionText}>{options.confirmText || 'Xác nhận'}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

// ==================== PROVIDER ====================
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);
    const idRef = useRef(0);

    const showToast = useCallback((text: string, type: ToastType = 'info', duration = 3000) => {
        const id = ++idRef.current;
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const dismissToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showConfirm = useCallback((options: ConfirmOptions) => {
        setConfirm(options);
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirm(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast container */}
            <View style={styles.toastContainer} pointerEvents="box-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </View>

            {/* Confirm modal */}
            {confirm && (
                <ConfirmModal options={confirm} onClose={closeConfirm} />
            )}
        </ToastContext.Provider>
    );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
    // Toast
    toastContainer: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        pointerEvents: 'box-none',
    },
    toastItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginBottom: Spacing.sm,
        maxWidth: SCREEN_WIDTH * 0.9,
        minWidth: 280,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    toastIcon: {
        fontSize: 16,
        marginRight: Spacing.sm,
    },
    toastText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.dark.text,
        fontWeight: '600',
    },
    toastDismiss: {
        fontSize: 14,
        color: Colors.dark.textMuted,
        marginLeft: Spacing.sm,
        padding: 4,
    },

    // Confirm Modal
    confirmContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
    },
    confirmOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    confirmCard: {
        backgroundColor: Colors.dark.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        width: '85%',
        maxWidth: 380,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.glassBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    confirmIcon: {
        fontSize: 40,
        marginBottom: Spacing.md,
    },
    confirmTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: Colors.dark.text,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    confirmMessage: {
        fontSize: FontSize.md,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    confirmButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
        width: '100%',
    },
    confirmCancelBtn: {
        flex: 1,
        paddingVertical: Spacing.sm + 4,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        backgroundColor: Colors.dark.surfaceLight,
    },
    confirmCancelText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.dark.textSecondary,
    },
    confirmActionBtn: {
        flex: 1,
        paddingVertical: Spacing.sm + 4,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    confirmActionText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: '#fff',
    },
});
