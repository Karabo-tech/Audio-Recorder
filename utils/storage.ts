import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceNote, AppSettings } from '../types';

const NOTES_KEY = '@voice_notes';
const SETTINGS_KEY = '@app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  recordingQuality: 'HIGH',
  defaultPlaybackSpeed: 1.0,
};

export const loadNotes = async (): Promise<VoiceNote[]> => {
  try {
    const json = await AsyncStorage.getItem(NOTES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveNotes = async (notes: VoiceNote[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error(e);
  }
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : DEFAULT_SETTINGS;
  } catch (e) {
    console.error(e);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
};