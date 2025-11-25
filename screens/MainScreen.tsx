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
import FileSystem from 'expo-file-system'; // Correct import
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { VoiceNote } from '../types';
import { loadNotes, saveNotes } from '../utils/storage';
import { AudioService } from '../services/AudioService';
import RecordingListItem from '../components/RecordingListItem';

// Correct directory path
const RECORDINGS_DIR = `${FileSystem.documentDirectory}recordings/`;

export default function MainScreen() {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [search, setSearch] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await ensureDirectoryExists();
    await loadAllNotes();
  };

  const ensureDirectoryExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
    }
  };

  const loadAllNotes = async () => {
    const saved = await loadNotes();
    setNotes(saved);
  };

  const startRecord = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is required to record.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = await AudioService.start();
      setRecording(rec);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
      console.error(error);
    }
  };

  const stopRecord = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      const { uri, duration } = await AudioService.stop(recording);

      const filename = `recording_${Date.now()}.m4a`;
      const newPath = `${RECORDINGS_DIR}${filename}`;

      // This now works — moveAsync exists!
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      const newNote: VoiceNote = {
        id: Date.now().toString(),
        path: newPath,
        date: new Date().toISOString(),
        duration,
      };

      const updatedNotes = [...notes, newNote];
      await saveNotes(updatedNotes);
      setNotes(updatedNotes);
      setRecording(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save recording');
      console.error(error);
    }
  };

  const play = async (note: VoiceNote) => {
    try {
      if (currentSound) {
        await AudioService.stop(currentSound);
      }

      const sound = await AudioService.play(note.path);
      setCurrentSound(sound);
      setPlayingId(note.id);

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          setCurrentSound(null);
        }
      });
    } catch (error) {
      Alert.alert('Playback Failed', 'Could not play audio');
    }
  };

  const stopPlayback = async () => {
    if (currentSound) {
      await AudioService.stop(currentSound);
      setCurrentSound(null);
      setPlayingId(null);
    }
  };

  const deleteNote = (id: string, path: string) => {
    Alert.alert('Delete Recording', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await FileSystem.deleteAsync(path, { idempotent: true });
            const updated = notes.filter((n) => n.id !== id);
            await saveNotes(updated);
            setNotes(updated);

            if (playingId === id) {
              await stopPlayback();
            }
          } catch (error) {
            Alert.alert('Error', 'Could not delete file');
          }
        },
      },
    ]);
  };

  const filteredNotes = notes.filter((note) =>
    new Date(note.date).toLocaleString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audio Recorder</Text>
        <Text style={styles.subtitle}>{notes.length} recordings</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search recordings..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
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
          <Text style={styles.emptyText}>No recordings yet. Tap the mic to record!</Text>
        }
      />

      <View style={styles.recordButtonContainer}>
        <TouchableOpacity
          onPress={isRecording ? stopRecord : startRecord}
          style={[styles.recordButton, isRecording && styles.recordingActive]}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic-circle'}
            size={90}
            color={isRecording ? '#FF3B30' : '#34C759'}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.feedbackButton}
        onPress={() => Alert.alert('Support', 'Email: support@audio-recorder.app')}
      >
        <Text style={styles.feedbackText}>Feedback & Support</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 6 },
  searchInput: {
    margin: 16,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: { textAlign: 'center', marginTop: 80, fontSize: 18, color: '#888' },
  recordButtonContainer: { alignItems: 'center', padding: 20 },
  recordButton: {
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  recordingActive: {
    shadowColor: '#FF3B30',
    shadowOpacity: 0.6,
  },
  feedbackButton: { alignItems: 'center', padding: 16 },
  feedbackText: { color: '#007AFF', fontSize: 16 },
});