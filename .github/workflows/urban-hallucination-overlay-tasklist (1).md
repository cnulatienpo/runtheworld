
# Urban Hallucination Overlay – GitHub Issues for Project Board

## 🌱 FREE PHASE TASKS

### Create folder structure for project
**Labels:** `cost: free`, `folder: root`  
Create the full project folder:
- `urban-hallucination-overlay/`
  - `extension/`
  - `assets/`
  - `step-bridge/`

---

### Write basic Chrome extension manifest.json
**Labels:** `cost: free`, `folder: extension`  
Write a manifest file with:
- Manifest v3
- Injects `content.js` and `style.css` on YouTube
- Minimal permissions: scripting, activeTab, storage

---

### Build content.js for playback control
**Labels:** `cost: free`, `folder: extension`  
Create a script that:
- Finds YouTube video
- Listens for “W” key
- Adjusts `video.playbackRate`
- Resets speed after 1–2 seconds

---

### Add floating UI to display step count
**Labels:** `cost: free`, `folder: extension`  
In content.js:
- Create a floating `<div>` on screen
- Show “Steps: [#]”
- Update with every keypress

---

### Style overlay with style.css
**Labels:** `cost: free`, `folder: extension`  
Make the floating UI readable and non-intrusive:
- Position: bottom-left
- Background: translucent
- Font: clean, legible

---

### Add a toggle to hide/show overlay
**Labels:** `cost: free`, `folder: extension`  
Let users press `H` to toggle the overlay UI off/on  
(optional future upgrade: toggle via settings panel)

---

### Create fake_step_server.py for test input
**Labels:** `cost: free`, `folder: step-bridge`  
Build a tiny WebSocket server that:
- Sends increasing step count every 3 seconds
- Hosts at `ws://localhost:6789`
- Sends JSON like `{ "steps": 1 }`

---

### Replace keybind with step server data
**Labels:** `cost: free`, `folder: extension`  
In content.js:
- Connect to WebSocket
- Replace keybind step counter
- Use step rate to modify video playback

---

### Create transparent canvas and PNG spawning
**Labels:** `cost: free`, `folder: extension`  
Inject a `<canvas>`:
- Draw transparent PNGs on steps
- Limit to 10 at a time
- Fade out oldest image as new ones spawn

---

### Write metadata.json for PNG tags
**Labels:** `cost: free`, `folder: assets`  
Each PNG gets:
- `category`: (urban, glitch, surreal)
- `tags`: (rare, static, glide, ambient)

---

## 💵 <$100 TASKS

### Build Flutter mobile app to read BLE
**Labels:** `cost: <$100`, `folder: mobile`  
- Use `flutter_blue_plus`
- Connect to smart ring/watch
- Read HR and step count
- Format JSON to match WebSocket

---

### Connect mobile app to WebSocket
**Labels:** `cost: <$100`, `folder: mobile`  
Send real step data from phone to:
`ws://localhost:6789`  
Match schema:
```json
{ "steps": 123, "heartRate": 88 }
```

---

### Update content.js to show BLE heart rate
**Labels:** `cost: <$100`, `folder: extension`  
Parse heart rate from WebSocket  
Display it in the overlay near step count

---

### Add basic interval timer logic
**Labels:** `cost: <$100`, `folder: extension`  
Let user set simple walk/run intervals (e.g. 1min/30s)  
Visually indicate interval status  
Optional: play a sound

---

## 🌀 USER-PAID TASKS (Self-Sustaining)

### Store session data in MongoDB
**Labels:** `cost: user-paid`, `folder: backend`  
Set up MongoDB Atlas  
Save each session:
- Start time, duration
- Steps
- HR avg
- Tags of images spawned

---

### Build HUD panel with playlist + settings
**Labels:** `cost: user-paid`, `folder: extension`  
Floating panel with:
- Playlist URL input
- Toggle input source
- Mood/pack selector
- Workout timer

---

### Add session summary popup at end
**Labels:** `cost: user-paid`, `folder: extension`  
When session ends:
- Show popup with stats
- Steps, duration, streaks
- Calories burned (approx)

---

### Implement BPM-aware playback syncing
**Labels:** `cost: user-paid`, `folder: extension`  
(Upgrade feature)
- Detect BPM of song
- Match spawn rate and video speed
- Visualize “workout zone” by tempo
