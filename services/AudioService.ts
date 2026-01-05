import { Audio } from 'expo-av';
import { RecordingQuality } from '../types';

const getRecordingOptions = (quality: RecordingQuality): Audio.RecordingOptions => {
  switch (quality) {
    case 'LOW':
      return Audio.RecordingOptionsPresets.LOW_QUALITY;
    case 'MEDIUM':
      return {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 96000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 96000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 96000,
        },
      };
    case 'HIGH':
    default:
      return Audio.RecordingOptionsPresets.HIGH_QUALITY;
  }
};

export const AudioService = {
  async start(quality: RecordingQuality = 'HIGH'): Promise<Audio.Recording> {
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(getRecordingOptions(quality));
    await recording.startAsync();
    return recording;
  },

  async stopRecording(recording: Audio.Recording): Promise<{ uri: string; duration: number }> {
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI()!;
    const { sound } = await recording.createNewLoadedSoundAsync();
    const status = await sound.getStatusAsync();

    const duration = status.isLoaded ? (status.durationMillis || 0) / 1000 : 0;

    await sound.unloadAsync();

    return { uri, duration };
  },

  async play(uri: string, playbackSpeed: number = 1.0): Promise<Audio.Sound> {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, rate: playbackSpeed, shouldCorrectPitch: true }
    );
    return sound;
  },

  async setPlaybackSpeed(sound: Audio.Sound, speed: number): Promise<void> {
    await sound.setRateAsync(speed, true);
  },

  async stopSound(sound: Audio.Sound | null): Promise<void> {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  },
};
