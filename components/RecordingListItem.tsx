import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  
  console.log('📊 Rendering note:', note.id, 'Duration:', note.duration);

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
          <Text style={[styles.duration, { fontSize: 16, fontWeight: '600', color: note.duration ? '#34C759' : '#FF3B30' }]}>
            {note.duration ? `⏱️ ${note.duration.toFixed(1)}s` : '⏱️ Duration unknown'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onTitleEdit} style={styles.actionBtn}>
            <Ionicons name="create-outline" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              console.log('▶️ PLAY/STOP BUTTON PRESSED!');
              console.log('Current state - isPlaying:', isPlaying);
              console.log('Note path:', note.path);
              if (isPlaying) {
                console.log('Stopping playback...');
                onStop();
              } else {
                console.log('Starting playback...');
                onPlay();
              }
            }} 
            style={[
              styles.actionBtn, 
              { 
                backgroundColor: isPlaying ? 'rgba(255, 59, 48, 0.2)' : 'rgba(52, 199, 89, 0.2)',
                borderWidth: 2,
                borderColor: isPlaying ? '#FF3B30' : '#34C759',
                borderRadius: 25,
              }
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'stop-circle' : 'play-circle'}
              size={40}
              color={isPlaying ? '#FF3B30' : '#34C759'}
            />
          </TouchableOpacity>

          {isPlaying && (
            <TouchableOpacity onPress={onSpeedChange} style={styles.speedBtn}>
              <Text style={styles.speedText}>{playbackSpeed}x</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={() => {
              console.log('🗑️ DELETE BUTTON PRESSED FOR NOTE:', note.id);
              console.log('Calling onDelete callback...');
              onDelete();
            }} 
            style={[styles.actionBtn, { backgroundColor: 'rgba(255, 0, 0, 0.1)' }]}
            activeOpacity={0.5}
          >
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