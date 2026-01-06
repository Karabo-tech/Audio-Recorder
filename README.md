# Audio Recording Journal App

A comprehensive digital voice notes application built with React Native and Expo. Record, organize, and playback audio notes with advanced features like customizable recording quality, playback speed control, and searchable titles.

## Features

### ✅ Core Functionality

- **Recording** - Record audio notes using device microphone with high-quality audio capture
- **Playback** - Play back recorded voice notes with smooth audio controls
- **Delete** - Remove unwanted voice notes with confirmation dialogs
- **Storage Management** - Efficient local storage using AsyncStorage and file system

### ✅ Advanced Features

- **Titles & Organization** - Add custom titles to voice notes for easy identification
- **Search Functionality** - Search recordings by title or date/time
- **Playback Speed Control** - Adjust playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x) while playing
- **Recording Quality Settings** - Choose between Low, Medium, and High quality recordings
- **Recording Timer** - Visual indicator showing recording duration in real-time
- **Settings Screen** - Customize default recording quality and playback speed

### ✅ User Experience

- **Permissions Handling** - Proper microphone and storage permissions management
- **Offline Functionality** - Full offline support - record and access notes without internet
- **User-Friendly Interface** - Clean, intuitive design with Material icons
- **Feedback & Support** - Built-in support contact information

## Technical Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and SDK
- **Expo AV** - Audio recording and playback
- **Expo File System** - File management
- **AsyncStorage** - Persistent data storage
- **TypeScript** - Type-safe development

## Project Structure

```
├── screens/
│   ├── MainScreen.tsx          # Main app screen with recording list
│   └── SettingsScreen.tsx      # Settings configuration screen
├── components/
│   └── RecordingListItem.tsx   # Individual recording item component
├── services/
│   └── AudioService.ts         # Audio recording and playback service
├── utils/
│   └── storage.ts              # AsyncStorage utilities
├── types/
│   └── index.ts                # TypeScript type definitions
└── App.tsx                     # App entry point
```

## Installation

```bash
npm install
```

## Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Usage Guide

### Recording a Voice Note

1. Tap the green microphone button at the bottom
2. Grant microphone permissions if prompted
3. Watch the recording timer indicator
4. Tap the red stop button to finish recording
5. Add an optional title when prompted

### Playing Back Recordings

1. Tap the play button on any recording
2. Use the speed button (appears during playback) to adjust playback speed
3. Tap stop to end playback

### Editing Recording Titles

1. Tap the edit icon (pencil) on any recording
2. Enter or modify the title
3. Tap "Save" to update

### Searching Recordings

1. Use the search bar at the top
2. Search by title or date/time
3. Results filter automatically

### Configuring Settings

1. Tap the settings icon in the top-right
2. Choose recording quality (affects file size and audio quality)
3. Set default playback speed
4. Changes save automatically

### Deleting Recordings

1. Tap the trash icon on any recording
2. Confirm deletion in the dialog
3. Recording and file are permanently removed

## Requirements Met

✅ Recording Functionality - Full microphone recording support  
✅ List of Voice Notes - Display with date, time, duration, and titles  
✅ Playback Functionality - Play recordings with speed control  
✅ Delete Functionality - Remove recordings with confirmation  
✅ Create New Voice Note - Simple tap-to-record interface  
✅ Storage Management - Efficient file and metadata storage  
✅ User Interface - Clean, modern, user-friendly design  
✅ Permissions Handling - Microphone and storage permissions  
✅ Search Functionality - Search by title or date/time  
✅ Settings - Customize recording quality and playback speed  
✅ Offline Functionality - Works completely offline  
✅ Feedback and Support - Built-in support contact

## Optional Features

❌ Backup and Restore - Not implemented (can be added with cloud storage integration)

## Notes

- All recordings are stored locally on the device
- Permissions must be granted for recording functionality
- iOS users: Ensure "Allow Microphone Access" is enabled in Settings
- Android users: Microphone permission will be requested on first recording

## Support

For feedback or support, tap the "Feedback & Support" button in the app or email: support@audio-recorder.app

## License

Private - Educational Project
