import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { VoiceNote } from '../types';
import { loadNotes, saveNotes } from '../utils/storage';
import { AudioService } from '../services/AudioService';
import RecordingListItem from '../components/RecordingListItem';

const DIR = `${FileSystem.documentDirectory}recordings/`;

export default function MainScreen() {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [search, setSearch] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await ensureDir();
      await loadAll();
    })();
  }, []);

  const ensureDir = async () => {
    const info = await FileSystem.getInfoAsync(DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  };

  const loadAll = async () => setNotes(await loadNotes());

  const startRecord = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Microphone access is required');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const rec = await AudioService.start();
    setRecording(rec);
    setIsRecording(true);
  };

  const stopRecord = async () => {
    if (!recording) return;
    setIsRecording(false);

    const { uri, duration } = await AudioService.stop(recording);
    const filename = `note_${Date.now()}.m4a`;
    const path = `${DIR}${filename}`;
    await FileSystem.moveAsync({ from: uri, to: path });

    const newNote: VoiceNote = {
      id: Date.now().toString(),
      path,
      date: new Date().toISOString(),
      duration,
    };

    const updated = [...notes, newNote];
    await saveNotes(updated);
    setNotes(updated);
    setRecording(null);
  };

  const play = async (note: VoiceNote) => {
    await AudioService.stop(currentSound);
    const sound = await AudioService.play(note.path);
    setCurrentSound(sound);
    setPlayingId(note.id);

    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded && s.didJustFinish) {
        setPlayingId(null);
        setCurrentSound(null);
      }
    });
  };

  const stopPlayback = async () => {
    await AudioService.stop(currentSound);
    setCurrentSound(null);
    setPlayingId(null);
  };

  const deleteNote = (id: string, path: string) => {
    Alert.alert('Delete', 'Remove this voice note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await FileSystem.deleteAsync(path, { idempotent: true });
          const updated = notes.filter((n) => n.id !== id);
          await saveNotes(updated);
          setNotes(updated);
          if (playingId === id) await stopPlayback();
        },
      },
    ]);
  };

  const filtered = notes.filter((n) =>
    new Date(n.date).toLocaleString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audio Recorder</Text>
        <Text style={styles.count}>{notes.length} recordings</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search by date/time..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <RecordingListItem
            note={item}
            isPlaying={playingId === item.id}
            onPlay={() => play(item)}
            onStop={stopPlayback}
            onDelete={() => deleteNote(item.id, item.path)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No recordings yet. Tap the mic!</Text>
        }
      />

      <View style={styles.recordBtn}>
        <TouchableOpacity
          onPress={isRecording ? stopRecord : startRecord}
          style={[styles.fab, isRecording && styles.recording]}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic-circle'}
            size={90}
            color={isRecording ? '#FF3B30' : '#34C759'}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.feedback} onPress={() => Alert.alert('Support', 'Email: support@audio-recorder.app')}>
        <Text style={styles.feedbackText}>Feedback & Support</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 34, fontWeight: 'bold' },
  count: { fontSize: 16, color: '#666', marginTop: 4 },
  search: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 18, color: '#888' },
  recordBtn: { alignItems: 'center', padding: 20 },
  fab: {
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  recording: { shadowColor: '#FF3B30', shadowOpacity: 0.6 },
  feedback: { alignItems: 'center', padding: 16 },
  feedbackText: { color: '#007AFF', fontSize: 16 },
});