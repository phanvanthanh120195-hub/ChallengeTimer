import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/themes';
import { AudioTrack } from '../constants/audio';

interface TrackSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    tracks: AudioTrack[];
    currentTrackId: string;
    onSelectTrack: (trackId: string) => void;
}

export function TrackSelectorModal({
    visible,
    onClose,
    tracks,
    currentTrackId,
    onSelectTrack,
}: TrackSelectorModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Chọn Nhạc Nền 🎵</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={tracks}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => {
                            const isSelected = item.id === currentTrackId;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.trackItem,
                                        isSelected && styles.trackItemSelected
                                    ]}
                                    onPress={() => {
                                        onSelectTrack(item.id);
                                        onClose();
                                    }}
                                >
                                    <Text style={[
                                        styles.trackName,
                                        isSelected && styles.trackNameSelected
                                    ]}>
                                        {item.name}
                                    </Text>
                                    {isSelected && <Text style={styles.playingIndicator}>▶ Đang phát</Text>}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.dark.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.dark.text,
    },
    closeButton: {
        padding: Spacing.sm,
    },
    closeButtonText: {
        fontSize: FontSize.xl,
        color: Colors.dark.textSecondary,
    },
    listContent: {
        padding: Spacing.md,
    },
    trackItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        backgroundColor: Colors.dark.surfaceLight,
    },
    trackItemSelected: {
        backgroundColor: Colors.dark.primary + '20', // 20% opacity primary color
        borderColor: Colors.dark.primary,
        borderWidth: 1,
    },
    trackName: {
        fontSize: FontSize.md,
        color: Colors.dark.text,
    },
    trackNameSelected: {
        fontWeight: '700',
        color: Colors.dark.primary,
    },
    playingIndicator: {
        fontSize: FontSize.sm,
        color: Colors.dark.primary,
        fontWeight: '600',
    },
});
