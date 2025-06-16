// === POST-RUN TRAVEL LOG SYSTEM ===
// Utility to get and save logs from localStorage
function getTravelLog() {
  const raw = localStorage.getItem("travelLog");
  return raw ? JSON.parse(raw) : [];
}

function saveTravelLog(log) {
  localStorage.setItem("travelLog", JSON.stringify(log));
}

// Call this after a run ends
function logSession(milesRan, note = "") {
  const today = new Date().toISOString().split("T")[0];
  const route = travelRoutes.find(r => r.id === selectedRouteId);
  const entry = {
    date: today,
    routeId: selectedRouteId,
    routeName: route ? route.name : "Unknown Route",
    miles: milesRan,
    note: note
  };
  const log = getTravelLog();
  log.unshift(entry); // Most recent first
  saveTravelLog(log);
}

// UI to display session log
const logDisplay = document.createElement("div");
logDisplay.id = "travel-log";
logDisplay.style.padding = "8px";
logDisplay.style.fontFamily = "monospace";
logDisplay.style.maxHeight = "200px";
logDisplay.style.overflowY = "auto";
document.body.appendChild(logDisplay); // Attach to your HUD

function renderTravelLog() {
  const log = getTravelLog();
  if (log.length === 0) {
    logDisplay.textContent = "No travel logs yet.";
    return;
  }
  logDisplay.innerHTML = log.map(entry => {
    return `
      <div style="margin-bottom: 0.5em;">
        \ud83d\udcc5 ${entry.date} — ${entry.routeName}<br>
        \u27a4 ${entry.miles.toFixed(2)} mi — ${entry.note || "No notes"}
      </div>
    `;
  }).join("");
}

// === Hook this into your existing run end logic:
function endRun(milesRan) {
  // Already call this to update travel progress:
  logRun(milesRan);

  // Prompt for optional note (replace with better UI later)
  const note = prompt("How was your run? (optional)", "");
  logSession(milesRan, note);
  renderTravelLog();
}

// Call once on load to show past logs
renderTravelLog();
