import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VoiceNote } from '../types';

interface Props {
  note: VoiceNote;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onDelete: () => void;
}

export default function RecordingListItem({ note, isPlaying, onPlay, onStop, onDelete }: Props) {
  const date = new Date(note.date).toLocaleString();

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.date}>{date}</Text>
        {note.duration && <Text style={styles.duration}>{note.duration.toFixed(1)}s</Text>}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={isPlaying ? onStop : onPlay}>
          <Ionicons
            name={isPlaying ? 'stop-circle' : 'play-circle'}
            size={40}
            color="#007AFF"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete}>
          <Ionicons name="trash-bin" size={36} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  info: { flex: 1 },
  date: { fontSize: 16, fontWeight: '600' },
  duration: { fontSize: 14, color: '#888', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 20 },
});