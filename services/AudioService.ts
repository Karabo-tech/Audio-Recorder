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
    console.log('🎙️ AudioService.stopRecording called');
    
    await recording.stopAndUnloadAsync();
    console.log('Recording stopped and unloaded');

    const uri = recording.getURI();
    console.log('Recording URI:', uri);
    
    if (!uri) {
      console.error('❌ No URI returned from recording');
      return { uri: '', duration: 0 };
    }
    
    try {
      const { sound } = await recording.createNewLoadedSoundAsync();
      console.log('Sound created from recording');
      
      const status = await sound.getStatusAsync();
      console.log('Sound status:', JSON.stringify(status, null, 2));

      const duration = status.isLoaded ? (status.durationMillis || 0) / 1000 : 0;
      console.log('Calculated duration:', duration, 'seconds');

      await sound.unloadAsync();
      console.log('Sound unloaded');

      console.log('Returning: uri =', uri, 'duration =', duration);
      return { uri, duration };
    } catch (error) {
      console.error('❌ Error getting duration from recording:', error);
      // Return URI anyway, duration will be 0
      return { uri, duration: 0 };
    }
  },

  async play(uri: string, playbackSpeed: number = 1.0): Promise<Audio.Sound> {
    console.log('🎵 AudioService.play called with URI:', uri);
    
    // Set audio mode before playing
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, rate: playbackSpeed, shouldCorrectPitch: true, volume: 1.0 }
    );
    
    console.log('✅ Sound created successfully');
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
