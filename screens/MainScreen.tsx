import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { VoiceNote, AppSettings } from '../types';
import { loadNotes, saveNotes, loadSettings, saveSettings } from '../utils/storage';
import { AudioService } from '../services/AudioService';
import RecordingListItem from '../components/RecordingListItem';
import SettingsScreen from './SettingsScreen';

const DIR = Platform.OS !== 'web' ? `${(FileSystem as any).documentDirectory}recordings/` : 'recordings/';

export default function MainScreen() {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [search, setSearch] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [settings, setSettings] = useState<AppSettings>({
    recordingQuality: 'HIGH',
    defaultPlaybackSpeed: 1.0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      await ensureDir();
      await loadAll();
      const loadedSettings = await loadSettings();
      setSettings(loadedSettings);
      setPlaybackSpeed(loadedSettings.defaultPlaybackSpeed);
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const ensureDir = async () => {
    if (Platform.OS !== 'web') {
      const info = await FileSystem.getInfoAsync(DIR);
      if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
    }
  };

  const loadAll = async () => setNotes(await loadNotes());

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
    setPlaybackSpeed(newSettings.defaultPlaybackSpeed);
  };

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

    const rec = await AudioService.start(settings.recordingQuality);
    setRecording(rec);
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecord = async () => {
    if (!recording) return;
    setIsRecording(false);

    // Stop timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const { uri, duration } = await AudioService.stopRecording(recording);

    const filename = `note_${Date.now()}.m4a`;
    const path = `${DIR}${filename}`;
    if (Platform.OS !== 'web') {
      await FileSystem.moveAsync({ from: uri, to: path });
    }

    const newNote: VoiceNote = {
      id: Date.now().toString(),
      path,
      date: new Date().toISOString(),
      duration,
      title: '',
    };

    const updated = [...notes, newNote];
    await saveNotes(updated);
    setNotes(updated);
    setRecording(null);
    setRecordingTime(0);

    // Prompt for title
    setTimeout(() => promptForTitle(newNote.id), 500);
  };

  const play = async (note: VoiceNote) => {
    await AudioService.stopSound(currentSound);

    const sound = await AudioService.play(note.path, playbackSpeed);
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
    await AudioService.stopSound(currentSound);
    setCurrentSound(null);
    setPlayingId(null);
  };

  const cyclePlaybackSpeed = async () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);

    if (currentSound) {
      await AudioService.setPlaybackSpeed(currentSound, nextSpeed);
    }
  };

  const promptForTitle = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    Alert.prompt(
      'Add Title',
      'Give this recording a name (optional)',
      [
        { text: 'Skip', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (title?: string) => {
            if (title && title.trim()) {
              const updated = notes.map((n) =>
                n.id === noteId ? { ...n, title: title.trim() } : n
              );
              await saveNotes(updated);
              setNotes(updated);
            }
          },
        },
      ],
      'plain-text',
      note.title || ''
    );
  };

  const deleteNote = (id: string, path: string) => {
    Alert.alert('Delete', 'Remove this voice note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (Platform.OS !== 'web') {
            await FileSystem.deleteAsync(path, { idempotent: true });
          }
          const updated = notes.filter((n) => n.id !== id);
          await saveNotes(updated);
          setNotes(updated);

          if (playingId === id) await stopPlayback();
        },
      },
    ]);
  };

  const filtered = notes.filter((n) => {
    const searchLower = search.toLowerCase();
    const dateStr = new Date(n.date).toLocaleString().toLowerCase();
    const titleStr = (n.title || '').toLowerCase();
    return dateStr.includes(searchLower) || titleStr.includes(searchLower);
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Audio Recorder</Text>
          <Text style={styles.count}>{notes.length} recordings</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search by title or date/time..."
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
            playbackSpeed={playbackSpeed}
            onPlay={() => play(item)}
            onStop={stopPlayback}
            onDelete={() => deleteNote(item.id, item.path)}
            onSpeedChange={cyclePlaybackSpeed}
            onTitleEdit={() => promptForTitle(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No recordings yet. Tap the mic!</Text>
        }
      />

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording: {formatTime(recordingTime)}</Text>
        </View>
      )}

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

      <TouchableOpacity
        style={styles.feedback}
        onPress={() => Alert.alert('Support', 'Email: support@audio-recorder.app')}
      >
        <Text style={styles.feedbackText}>Feedback & Support</Text>
      </TouchableOpacity>

      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <SettingsScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerLeft: { flex: 1 },
  title: { fontSize: 34, fontWeight: 'bold' },
  count: { fontSize: 16, color: '#666', marginTop: 4 },
  settingsBtn: { padding: 4 },
  search: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 18, color: '#888' },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 25,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  recordingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
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
