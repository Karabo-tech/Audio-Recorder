import { Audio } from 'expo-av';

export const AudioService = {
  async start(): Promise<Audio.Recording> {
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    return recording;
  },

  async stop(recording: Audio.Recording): Promise<{ uri: string; duration: number }> {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI()!;
    const { sound } = await recording.createNewLoadedSoundAsync();
    const status = await sound.getStatusAsync();
    const duration = status.isLoaded ? (status.durationMillis || 0) / 1000 : 0;
    return { uri, duration };
  },

  async play(uri: string): Promise<Audio.Sound> {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    return sound;
  },

  async stop(sound: Audio.Sound | null): Promise<void> {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  },
};