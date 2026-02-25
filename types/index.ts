export type VoiceNote = {
  id: string;
  path: string;
  date: string;        
  duration?: number;   
  title?: string;      
};

export type RecordingQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export type AppSettings = {
  recordingQuality: RecordingQuality;
  defaultPlaybackSpeed: number;
};