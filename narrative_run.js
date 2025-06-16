// === NARRATIVE RUNNER ENGINE ===

// === 1. GOAL POOL ===
const possibleGoals = [
  "Deliver a secret message",
  "Escape surveillance",
  "Retrieve a lost artifact",
  "Follow the ghost signal",
  "Find the hidden monument"
];

// === 2. ROUTE DEFINITION ===
const narrativeRoute = {
  id: "mystery-run-1",
  name: "Mystery Run",
  segments: [
    {
      city: "Lisbon",
      video: "https://www.youtube.com/embed/VIDEO_ID_1",
      storyPrompt: "Begin your search in the market district. Someone left a clue near the fountain.",
      distanceMiles: 1.5
    },
    {
      city: "Zurich",
      video: "https://www.youtube.com/embed/VIDEO_ID_2",
      storyPrompt: "Avoid the patrols. You’ll recognize the safehouse by the blue light in the window.",
      distanceMiles: 2.0
    },
    {
      city: "Oslo",
      video: "https://www.youtube.com/embed/VIDEO_ID_3",
      storyPrompt: "Climb the final hill. When you see the tower, your mission is complete.",
      distanceMiles: 2.5
    }
  ],
  timeLimitMin: 45
};

// === 3. RANDOM GOAL PICKER ===
let storyGoal = possibleGoals[Math.floor(Math.random() * possibleGoals.length)];

// === 4. STATE TRACKING ===
let milesThisSession = 0;
let segmentIndex = 0;
let sessionStarted = false;
let segmentsCompleted = [];

// === 5. HUD DISPLAY ===
const storyHUD = document.createElement("div");
storyHUD.style.fontFamily = "monospace";
storyHUD.style.padding = "8px";
storyHUD.style.background = "#111";
storyHUD.style.color = "#0f0";
document.body.appendChild(storyHUD);

function updateStoryHUD() {
  const seg = narrativeRoute.segments[segmentIndex] || {};
  storyHUD.innerHTML = `
    🎯 Goal: ${storyGoal}<br>
    🏙️ Segment: ${seg.city || "Complete"}<br>
    🧍🏽‍♀️ Prompt: ${seg.storyPrompt || "Mission complete."}<br>
    🚣️ Distance: ${milesThisSession.toFixed(2)} mi / ${getTotalRouteMiles()} mi
  `;
}

// === 6. CALC HELPERS ===
function getTotalRouteMiles() {
  return narrativeRoute.segments.reduce((sum, seg) => sum + seg.distanceMiles, 0);
}

// === 7. STEP/MILE HANDLER ===
function onStepReceived(stepCount = 1) {
  if (!sessionStarted) return;

  const STRIDE_LENGTH_M = 0.78;
  const MILES_PER_METER = 0.000621371;
  const meters = stepCount * STRIDE_LENGTH_M;
  milesThisSession += meters * MILES_PER_METER;

  checkForSegmentAdvance();
  updateStoryHUD();
}

// === 8. SEGMENT AUTO-LOGGING ===
function checkForSegmentAdvance() {
  const currentSegment = narrativeRoute.segments[segmentIndex];
  if (!currentSegment) return;

  const milesNeeded = narrativeRoute.segments
    .slice(0, segmentIndex + 1)
    .reduce((sum, seg) => sum + seg.distanceMiles, 0);

  if (milesThisSession >= milesNeeded) {
    segmentsCompleted.push(currentSegment.city);
    segmentIndex += 1;
  }
}

// === 9. START SESSION ===
function startNarrativeRun() {
  sessionStarted = true;
  milesThisSession = 0;
  segmentIndex = 0;
  segmentsCompleted = [];
  storyGoal = possibleGoals[Math.floor(Math.random() * possibleGoals.length)];
  updateStoryHUD();
}

// === 10. END + LOG SESSION ===
function endNarrativeRun() {
  sessionStarted = false;
  const entry = {
    date: new Date().toISOString().split("T")[0],
    routeName: narrativeRoute.name,
    goal: storyGoal,
    segmentsCompleted: [...segmentsCompleted],
    miles: milesThisSession.toFixed(2),
    note: segmentIndex >= narrativeRoute.segments.length
      ? "Mission complete."
      : "Run ended early—mission incomplete."
  };
  const log = getTravelLog();
  log.unshift(entry);
  saveTravelLog(log);
  updateStoryHUD();
}

// === 11. TRAVEL LOG UTILS (reuse from earlier) ===
function getTravelLog() {
  const raw = localStorage.getItem("travelLog");
  return raw ? JSON.parse(raw) : [];
}

function saveTravelLog(log) {
  localStorage.setItem("travelLog", JSON.stringify(log));
}

// === 12. WEBSOCKET HOOK (steps listener) ===
const ws = new WebSocket("ws://localhost:6789");
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.steps) {
    onStepReceived(data.steps);
  }
};

// === 13. MANUAL START/STOP FOR TESTING ===
// You can hook these to buttons later
window.startNarrativeRun = startNarrativeRun;
window.endNarrativeRun = endNarrativeRun;
