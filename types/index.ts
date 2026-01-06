export type VoiceNote = {
  id: string;
  path: string;
  date: string;        // ISO string
  duration?: number;   // seconds
  title?: string;      // optional title for the note
};

export type RecordingQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export type AppSettings = {
  recordingQuality: RecordingQuality;
  defaultPlaybackSpeed: number;
};