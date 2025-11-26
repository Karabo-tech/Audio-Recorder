# Audio Recorder – Voice Journal App

A beautiful, fully functional **React Native** voice recording app built with **Expo** and **TypeScript**.  
Allows users to record, play, search, and delete voice notes offline — perfect as a personal audio journal.

**Submitted for:** Task 3 – React Native Audio Recorder (Lesson 5)  
**Date:** 25 November 2025

## Features

- Record high-quality audio using device microphone
- List all recordings with date, time, and duration
- Play / Stop playback with smooth UI feedback
- Delete unwanted recordings
- Search recordings by date/time
- Fully offline — all data stored locally
- Modern, clean, and responsive UI
- Permissions handling (microphone)
- Feedback & Support section
- Built with **TypeScript** for type safety
- Uses **latest Expo FileSystem API** (no deprecation warnings)
- No third-party backend required

## Tech Stack

- **Framework**: React Native + Expo (SDK 54+)
- **Language**: TypeScript
- **Audio**: `expo-av`
- **Storage**:
  - Local files: `expo-file-system` (new `File` & `Directory` API)
  - Metadata: `@react-native-async-storage/async-storage`
- **Icons**: `@expo/vector-icons`
- **Entry Point**: `index.tsx`

## Google Drive Submission Link

**Download the full project here:**  
https://drive.google.com/file/d/1xY0urDr1v3L1nkF0rY0urDr1v3L1nkF0/view?usp=sharing

*(Link set to "Anyone with the link can view" – ready for your instructor)*

## Setup & Installation

1. Clone the repository
   ```bash
   git clone https://github.com/karabo-tech/Audio-Recorder.git
   cd Audio-Recorder

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install

3. Install Expo packages

   ```bash
   npx expo install expo-av expo-file-system @react-native-async-storage/async-storage @expo/vector-icons

4. Start the app

   ```bash
   npx expo start