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
  const [showTitleEdit, setShowTitleEdit] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
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
    console.log('⏱️ Recording stopped. Duration:', duration, 'seconds');

    const filename = `note_${Date.now()}.m4a`;
    let path: string;
    
    if (Platform.OS !== 'web') {
      // On native platforms, move the file to our recordings directory
      path = `${DIR}${filename}`;
      await FileSystem.moveAsync({ from: uri, to: path });
    } else {
      // On web, use the blob URI directly since we can't move files
      path = uri;
      console.log('📱 Web platform - using blob URI:', path);
    }

    const newNote: VoiceNote = {
      id: Date.now().toString(),
      path,
      date: new Date().toISOString(),
      duration,
      title: '',
    };
    
    console.log('📝 New note created:', JSON.stringify(newNote, null, 2));

    const updated = [...notes, newNote];
    await saveNotes(updated);
    setNotes(updated);
    setRecording(null);
    setRecordingTime(0);

    // Prompt for title
    setTimeout(() => promptForTitle(newNote.id), 500);
  };

  const play = async (note: VoiceNote) => {
    console.log('🎵 PLAY FUNCTION CALLED for note:', note.id);
    
    try {
      // Stop any current playback
      if (currentSound) {
        console.log('Stopping previous sound...');
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
        } catch (e) {
          console.log('Error stopping previous sound (ok to ignore):', e);
        }
        setCurrentSound(null);
      }

      // Set audio mode
      console.log('Setting audio mode...');
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (audioModeError) {
        console.log('Audio mode error (continuing anyway):', audioModeError);
      }

      // Verify file exists before trying to play
      if (Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(note.path);
        console.log('File info:', fileInfo);
        
        if (!fileInfo.exists) {
          console.error('❌ File does not exist at path:', note.path);
          Alert.alert('Playback Error', 'Recording file not found. It may have been deleted.');
          return;
        }
      }

      console.log('Creating sound from:', note.path);
      console.log('Playback speed:', playbackSpeed);
      
      // First set the state to show we're playing
      setPlayingId(note.id);
      console.log('✅ Set playingId to:', note.id);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: note.path },
        { 
          shouldPlay: true, 
          rate: playbackSpeed, 
          shouldCorrectPitch: true,
          volume: 1.0,
        }
      );
      
      console.log('✅ Sound created!');
      
      setCurrentSound(sound);
      
      // Listen for playback status changes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            console.log('✅ Playback finished naturally');
            setPlayingId(null);
            setCurrentSound(null);
          }
        }
      });
      
      console.log('✅ Play function completed successfully');
      
    } catch (error) {
      console.error('❌ PLAY ERROR:', error);
      Alert.alert('Playback Error', `Could not play: ${error instanceof Error ? error.message : error}`);
      setPlayingId(null);
      setCurrentSound(null);
    }
  };

  const stopPlayback = async () => {
    try {
      console.log('Stopping playback');
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }
      setCurrentSound(null);
      setPlayingId(null);
      console.log('Playback stopped');
    } catch (error) {
      console.error('Stop playback error:', error);
      setCurrentSound(null);
      setPlayingId(null);
    }
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

    setEditingNoteId(noteId);
    setTitleInput(note.title || '');
    setShowTitleEdit(true);
  };

  const saveTitleEdit = async () => {
    if (!editingNoteId) return;

    try {
      const updated = notes.map((n) =>
        n.id === editingNoteId ? { ...n, title: titleInput.trim() } : n
      );
      await saveNotes(updated);
      setNotes(updated);
      setShowTitleEdit(false);
      setEditingNoteId(null);
      setTitleInput('');
    } catch (error) {
      console.error('Save title error:', error);
      Alert.alert('Error', 'Could not save title. Please try again.');
    }
  };

  const cancelTitleEdit = () => {
    setShowTitleEdit(false);
    setEditingNoteId(null);
    setTitleInput('');
  };

  const deleteNote = async (id: string, path: string) => {
    console.log('🗑️ deleteNote called with id:', id, 'path:', path);
    
    try {
      // Stop playback if this recording is playing
      if (playingId === id) {
        console.log('Stopping playback before delete');
        await stopPlayback();
      }
      
      // Delete the audio file
      if (Platform.OS !== 'web') {
        try {
          console.log('Deleting file:', path);
          await FileSystem.deleteAsync(path, { idempotent: true });
          console.log('File deleted successfully');
        } catch (fileError) {
          console.log('File delete error (may be already deleted):', fileError);
        }
      }
      
      // Update notes list
      const updated = notes.filter((n) => n.id !== id);
      console.log('Saving updated notes, new count:', updated.length);
      await saveNotes(updated);
      setNotes(updated);
      console.log('✅ Delete completed successfully');
    } catch (error) {
      console.error('❌ Delete error:', error);
      Alert.alert('Delete Error', `Could not delete recording: ${error}`);
    }
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
            onPlay={() => {
              console.log('▶️ Play pressed');
              play(item);
            }}
            onStop={() => {
              console.log('⏹️ Stop pressed');
              stopPlayback();
            }}
            onDelete={() => {
              console.log('🗑️ onDelete triggered in MainScreen for:', item.id);
              deleteNote(item.id, item.path);
            }}
            onSpeedChange={() => {
              console.log('⚡ Speed change pressed');
              cyclePlaybackSpeed();
            }}
            onTitleEdit={() => {
              console.log('✏️ Edit pressed');
              promptForTitle(item.id);
            }}
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

      <Modal
        visible={showTitleEdit}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelTitleEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter recording title..."
              value={titleInput}
              onChangeText={setTitleInput}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelTitleEdit}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveTitleEdit}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonSave: {
    backgroundColor: '#007AFF',
  },
  modalButtonTextCancel: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSave: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
