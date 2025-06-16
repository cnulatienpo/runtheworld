// === MILES TRAVELED IN REAL TIME ===

// Constants
const STRIDE_LENGTH_M = 0.78; // average stride in meters (adjust per user)
const MILES_PER_METER = 0.000621371;

// State
let stepsThisSession = 0;
let milesThisSession = 0;
let sessionActive = false;
let paceTimer = null;

// Display UI
const paceDisplay = document.createElement("div");
paceDisplay.style.fontFamily = "monospace";
paceDisplay.style.padding = "8px";
document.body.appendChild(paceDisplay);

// Update UI
function updateMilesDisplay() {
  paceDisplay.textContent = `Miles this run: ${milesThisSession.toFixed(2)}`;
}

// Example: call this when run starts
function startSession() {
  sessionActive = true;
  stepsThisSession = 0;
  milesThisSession = 0;
  updateMilesDisplay();
}

// Example: call this when run ends
function endSession() {
  sessionActive = false;
  logRun(milesThisSession);       // update travel progress
  logSession(milesThisSession);   // post-run log
  updateMilesDisplay();
}

// Example: when receiving step data from WebSocket or device
function onStepReceived(stepCount = 1) {
  if (!sessionActive) return;

  stepsThisSession += stepCount;
  const meters = stepsThisSession * STRIDE_LENGTH_M;
  milesThisSession = meters * MILES_PER_METER;

  updateMilesDisplay();
}

// Hook into your fake server or real listener
// WebSocket example:
const ws = new WebSocket("ws://localhost:6789");
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.steps) {
    onStepReceived(data.steps);
  }
};
