import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceNote } from '../types';

const KEY = '@voice_notes';

export const loadNotes = async (): Promise<VoiceNote[]> => {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveNotes = async (notes: VoiceNote[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(notes));
  } catch (e) {
    console.error(e);
  }
};