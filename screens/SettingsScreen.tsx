import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppSettings, RecordingQuality } from '../types';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

const QUALITY_OPTIONS: { value: RecordingQuality; label: string; description: string }[] = [
  { value: 'LOW', label: 'Low Quality', description: 'Smaller file size, lower quality' },
  { value: 'MEDIUM', label: 'Medium Quality', description: 'Balanced size and quality' },
  { value: 'HIGH', label: 'High Quality', description: 'Larger file size, best quality' },
];

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export default function SettingsScreen({ settings, onUpdateSettings, onClose }: Props) {
  const updateQuality = (quality: RecordingQuality) => {
    onUpdateSettings({ ...settings, recordingQuality: quality });
  };

  const updateSpeed = (speed: number) => {
    onUpdateSettings({ ...settings, defaultPlaybackSpeed: speed });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Recording Quality Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recording Quality</Text>
          <Text style={styles.sectionDescription}>
            Choose the quality for new recordings
          </Text>
          {QUALITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                settings.recordingQuality === option.value && styles.optionSelected,
              ]}
              onPress={() => updateQuality(option.value)}
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    settings.recordingQuality === option.value && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              {settings.recordingQuality === option.value && (
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Playback Speed Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Playback Speed</Text>
          <Text style={styles.sectionDescription}>
            Choose the default speed for playing recordings
          </Text>
          <View style={styles.speedGrid}>
            {SPEED_OPTIONS.map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedOption,
                  settings.defaultPlaybackSpeed === speed && styles.speedOptionSelected,
                ]}
                onPress={() => updateSpeed(speed)}
              >
                <Text
                  style={[
                    styles.speedText,
                    settings.defaultPlaybackSpeed === speed && styles.speedTextSelected,
                  ]}
                >
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Audio Recording Journal App</Text>
            <Text style={styles.infoText}>Version 1.0.0</Text>
            <Text style={styles.infoSubtext}>
              A digital voice notes app with recording, playback, and organization features.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionSelected: {
    borderColor: '#34C759',
    backgroundColor: '#f0fdf4',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#34C759',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  speedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  speedOption: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  speedOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e8f4ff',
  },
  speedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  speedTextSelected: {
    color: '#007AFF',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
});
