# Audio Recording App - Demo Guide

## Quick Demo Script (5 minutes)

### 1. **App Overview** (30 seconds)
- Launch the app
- Show the main screen with title "Audio Recorder"
- Point out the recording count at the top
- Show the microphone button at the bottom

### 2. **Create First Recording** (60 seconds)
**Action:** Tap the green microphone button
- ✅ Permission dialog appears (grant microphone access)
- ✅ Red recording indicator appears with timer "Recording: 0:00"
- ✅ Timer counts up in real-time
- ✅ Microphone button turns red with stop icon

**Action:** Record for 5-10 seconds, then tap stop
- ✅ Recording stops
- ✅ Title prompt appears: "Add Title"
- ✅ Enter title: "My First Note"
- ✅ Recording appears in the list

### 3. **List View Features** (45 seconds)
**Show the recording card:**
- ✅ Title: "My First Note"
- ✅ Date and time
- ✅ Duration in seconds
- ✅ Four action buttons visible:
  - Edit (pencil icon)
  - Play (play button)
  - Delete (trash icon)

### 4. **Playback with Speed Control** (45 seconds)
**Action:** Tap the play button
- ✅ Audio starts playing
- ✅ Play button changes to stop button
- ✅ Speed indicator appears showing "1x"

**Action:** Tap the speed button repeatedly
- ✅ Speed cycles: 1x → 1.25x → 1.5x → 2x → 0.5x → 0.75x → 1x
- ✅ Audio speed changes in real-time
- ✅ Pitch correction maintains voice quality

**Action:** Tap stop button
- ✅ Playback stops

### 5. **Edit Recording Title** (30 seconds)
**Action:** Tap the edit (pencil) icon
- ✅ Edit dialog appears with current title
- ✅ Change title to: "Updated Journal Entry"
- ✅ Tap "Save"
- ✅ Title updates in the list

### 6. **Search Functionality** (45 seconds)
**Action:** Create 2 more recordings with different titles
- Recording 2: "Meeting Notes"
- Recording 3: "Personal Thoughts"

**Action:** Use the search bar
- Type "meeting" → ✅ Only "Meeting Notes" shows
- Type "journal" → ✅ Only "Updated Journal Entry" shows
- Type today's date → ✅ All recordings show
- Clear search → ✅ All recordings visible again

### 7. **Settings Screen** (60 seconds)
**Action:** Tap the settings icon (top-right)
- ✅ Settings screen slides up

**Show Recording Quality Section:**
- ✅ Three options: Low, Medium, High
- ✅ Current selection highlighted in green
- ✅ Descriptions for each quality level

**Action:** Select "Medium Quality"
- ✅ Selection updates with checkmark

**Show Playback Speed Section:**
- ✅ Six speed buttons: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- ✅ Current default highlighted in blue

**Action:** Select "1.5x" as default
- ✅ Selection updates

**Action:** Tap "X" to close settings
- ✅ Settings save automatically
- ✅ Return to main screen

### 8. **Test New Settings** (45 seconds)
**Action:** Record a new note
- ✅ Records with Medium quality
- ✅ File size should be smaller than High quality

**Action:** Play the new recording
- ✅ Automatically starts at 1.5x speed (default setting)

### 9. **Delete Functionality** (30 seconds)
**Action:** Tap trash icon on any recording
- ✅ Confirmation dialog appears
- ✅ Two options: "Cancel" and "Delete"

**Action:** Tap "Delete"
- ✅ Recording removed from list
- ✅ Recording count updates
- ✅ File deleted from storage

### 10. **Support Feature** (15 seconds)
**Action:** Scroll to bottom, tap "Feedback & Support"
- ✅ Alert shows support email
- ✅ Easy way for users to get help

---

## Feature Checklist

### ✅ CRUD Operations
- [x] **Create** - Record new voice notes with microphone
- [x] **Read** - Display list of all recordings with details
- [x] **Update** - Edit recording titles
- [x] **Delete** - Remove recordings with confirmation

### ✅ Core Features
- [x] Recording with visual timer
- [x] Playback with controls
- [x] List view with date, time, duration
- [x] Storage management
- [x] Permissions handling

### ✅ Advanced Features
- [x] Custom titles for organization
- [x] Search by title or date
- [x] Variable playback speed (6 options)
- [x] Recording quality settings (3 levels)
- [x] Settings persistence
- [x] Offline functionality

### ✅ User Experience
- [x] Clean, modern interface
- [x] Visual recording feedback
- [x] Confirmation dialogs
- [x] Support contact
- [x] Real-time search filtering

---

## Testing Scenarios

### Scenario 1: First-Time User
1. Open app → Permission prompt
2. Grant permission
3. Record first note
4. Add title when prompted
5. Play back recording

**Expected:** Smooth onboarding, clear instructions

### Scenario 2: Power User
1. Open app with 10+ recordings
2. Use search to find specific note
3. Edit title quickly
4. Adjust playback speed during listening
5. Delete old recordings

**Expected:** Fast navigation, efficient workflow

### Scenario 3: Settings Configuration
1. Open settings
2. Change quality to Low (save space)
3. Set default speed to 1.5x (faster listening)
4. Record new note
5. Verify settings applied

**Expected:** Settings persist and work correctly

### Scenario 4: Offline Usage
1. Turn off WiFi and mobile data
2. Record multiple notes
3. Play back recordings
4. Edit titles
5. Delete recordings

**Expected:** All features work without internet

---

## Performance Expectations

| Feature | Expected Time |
|---------|--------------|
| App launch | < 2 seconds |
| Start recording | < 1 second |
| Stop recording | < 2 seconds |
| Start playback | < 1 second |
| Search filter | Instant |
| Open settings | < 0.5 seconds |

---

## Troubleshooting

### Issue: No permission prompt
**Solution:** Check device settings → App permissions → Enable microphone

### Issue: Recording doesn't start
**Solution:** Ensure microphone permission granted, restart app

### Issue: Playback is silent
**Solution:** Check device volume, ensure audio mode is set correctly

### Issue: Recordings disappear
**Solution:** Check storage permissions, ensure sufficient disk space

---

## Technical Details

**Audio Format:** M4A (MPEG-4 Audio)
**Quality Options:**
- Low: ~48 kbps, smallest file size
- Medium: ~96 kbps, balanced
- High: ~128 kbps, best quality

**Storage Location:** Device local storage (expo-file-system)
**Metadata Storage:** AsyncStorage (JSON)
**Offline Support:** 100% - no network required

---

## Demo Tips

1. **Prepare sample recordings** before demo to show full list
2. **Use clear, short titles** that are easy to read
3. **Test audio playback** volume before presenting
4. **Show speed control** - it's a unique feature
5. **Demonstrate search** with varied recording names
6. **Highlight the timer** during recording
7. **Show settings persistence** by closing/reopening app

---

## Questions to Answer During Demo

**Q: Can I organize recordings?**
A: Yes! Add custom titles and use search to find specific notes.

**Q: Can I speed up playback?**
A: Yes! Choose from 6 speeds (0.5x to 2x) during playback.

**Q: How much storage do recordings use?**
A: Depends on quality setting. 1 minute ≈ 360KB (Low) to 960KB (High).

**Q: Do I need internet?**
A: No! Fully offline - record, play, and manage without connectivity.

**Q: Can I backup recordings?**
A: Currently local only. Cloud backup can be added in future updates.

**Q: What happens if I delete by accident?**
A: Confirmation dialog prevents accidents, but deleted files can't be recovered.

---

## Future Enhancement Ideas
- ☐ Cloud backup/sync
- ☐ Audio waveform visualization
- ☐ Recording pause/resume
- ☐ Export/share recordings
- ☐ Categories/folders
- ☐ Recording bookmarks
- ☐ Transcript generation
- ☐ Dark mode
