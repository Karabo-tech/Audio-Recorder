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
    
    // Get the status BEFORE stopping to capture the duration
    const statusBeforeStop = await recording.getStatusAsync();
    console.log('Recording status before stop:', JSON.stringify(statusBeforeStop, null, 2));
    
    // Calculate duration from the recording status
    let duration = 0;
    if (statusBeforeStop.isRecording && statusBeforeStop.durationMillis) {
      duration = statusBeforeStop.durationMillis / 1000;
      console.log('✅ Duration from recording status:', duration, 'seconds');
    }
    
    await recording.stopAndUnloadAsync();
    console.log('Recording stopped and unloaded');

    const uri = recording.getURI();
    console.log('Recording URI:', uri);
    
    if (!uri) {
      console.error('❌ No URI returned from recording');
      return { uri: '', duration: 0 };
    }
    
    // If we couldn't get duration from recording status, try loading the file
    if (duration === 0) {
      console.log('⚠️ Duration was 0, attempting to load audio file to get duration...');
      try {
        const { sound } = await Audio.Sound.createAsync({ uri });
        console.log('Sound loaded from URI');
        
        const status = await sound.getStatusAsync();
        console.log('Sound status:', JSON.stringify(status, null, 2));

        duration = status.isLoaded ? (status.durationMillis || 0) / 1000 : 0;
        console.log('Calculated duration from file:', duration, 'seconds');

        await sound.unloadAsync();
        console.log('Sound unloaded');
      } catch (error) {
        console.error('❌ Error getting duration from audio file:', error);
        // Return URI anyway, duration will be 0
      }
    }

    console.log('Returning: uri =', uri, 'duration =', duration);
    return { uri, duration };
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
