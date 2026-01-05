import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VoiceNote } from '../types';

interface Props {
  note: VoiceNote;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlay: () => void;
  onStop: () => void;
  onDelete: () => void;
  onSpeedChange: () => void;
  onTitleEdit: () => void;
}

export default function RecordingListItem({
  note,
  isPlaying,
  playbackSpeed,
  onPlay,
  onStop,
  onDelete,
  onSpeedChange,
  onTitleEdit,
}: Props) {
  const date = new Date(note.date).toLocaleString();

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.info}>
          {note.title ? (
            <>
              <Text style={styles.title} numberOfLines={1}>
                {note.title}
              </Text>
              <Text style={styles.date}>{date}</Text>
            </>
          ) : (
            <Text style={styles.date}>{date}</Text>
          )}
          {note.duration && <Text style={styles.duration}>{note.duration.toFixed(1)}s</Text>}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onTitleEdit} style={styles.actionBtn}>
            <Ionicons name="create-outline" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity onPress={isPlaying ? onStop : onPlay} style={styles.actionBtn}>
            <Ionicons
              name={isPlaying ? 'stop-circle' : 'play-circle'}
              size={40}
              color="#007AFF"
            />
          </TouchableOpacity>

          {isPlaying && (
            <TouchableOpacity onPress={onSpeedChange} style={styles.speedBtn}>
              <Text style={styles.speedText}>{playbackSpeed}x</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
            <Ionicons name="trash-bin" size={28} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: { flex: 1, marginRight: 12 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#000',
  },
  date: { fontSize: 14, fontWeight: '500', color: '#666' },
  duration: { fontSize: 13, color: '#888', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtn: {
    padding: 4,
  },
  speedBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  speedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});