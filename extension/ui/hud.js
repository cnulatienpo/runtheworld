// HUD Panel for Urban Hallucination Overlay

// 0. Restore hallucination state from localStorage
let hallucinationsEnabled = JSON.parse(localStorage.getItem('hallucinationsEnabled') ?? 'true');
window.hallucinationsEnabled = hallucinationsEnabled;

// 0b. Restore session mood from localStorage or set default
let sessionMood = localStorage.getItem('sessionMood') || 'medium';
window.sessionMood = sessionMood;

// Restore effect count from storage or start at 0
let effectCount = Number(localStorage.getItem('effectCount') || 0);

// Restore or initialize session start time
let sessionStartTime = Number(localStorage.getItem('sessionStartTime') || Date.now());
localStorage.setItem('sessionStartTime', sessionStartTime);
window.sessionStartTime = sessionStartTime;

// Frequency presets and restore setting
const frequencyPresets = {
  chill: 15000,
  normal: 10000,
  intense: () => Math.floor(Math.random() * 2000) + 4000,
};
let effectFrequency = localStorage.getItem('effectFrequency') || 'normal';
window.effectFrequency = effectFrequency;

// 1. Create main HUD button and panel
const hudIcon = document.createElement('div');
hudIcon.id = 'uh-hud-icon';
hudIcon.textContent = '👁️'; // use any emoji or icon here
hudIcon.style.position = 'fixed';
hudIcon.style.top = '24px';
hudIcon.style.right = '24px';
hudIcon.style.width = '48px';
hudIcon.style.height = '48px';
hudIcon.style.background = 'rgba(30,30,40,0.8)';
hudIcon.style.borderRadius = '50%';
hudIcon.style.display = 'flex';
hudIcon.style.alignItems = 'center';
hudIcon.style.justifyContent = 'center';
hudIcon.style.cursor = 'pointer';
hudIcon.style.zIndex = 99999;
hudIcon.style.transition = 'background 0.2s';

// 2. Create the panel (hidden by default)
const hudPanel = document.createElement('div');
hudPanel.id = 'uh-hud-panel';
hudPanel.style.position = 'fixed';
hudPanel.style.top = '80px';
hudPanel.style.right = '24px';
hudPanel.style.width = '320px';
hudPanel.style.background = 'rgba(24,24,32,0.98)';
hudPanel.style.borderRadius = '18px';
hudPanel.style.padding = '22px';
hudPanel.style.boxShadow = '0 6px 36px 0 rgba(0,0,0,0.34)';
hudPanel.style.color = '#fff';
hudPanel.style.fontFamily = 'sans-serif';
hudPanel.style.display = 'none';
hudPanel.style.flexDirection = 'column';
hudPanel.style.gap = '18px';
hudPanel.style.zIndex = 99999;

// 3. Populate the panel with HUD fields
hudPanel.innerHTML = `
  <div style="font-size:1.3em; margin-bottom:8px;"><b>Urban Hallucination HUD</b></div>
  <div><b>Steps:</b> <span id="uh-hud-stepcount">0</span></div>
  <div>
    <b>Playlist:</b>
    <input id="uh-hud-playlist" type="text" placeholder="Paste YouTube/Spotify link" style="width:180px;"/>
  </div>
  <div><b>Input:</b> <span id="uh-hud-input">Keyboard</span></div>
  <div><b>Session Time:</b> <span id="uh-hud-session-elapsed">00:00</span></div>
  <div id="uh-hud-bpm">
    <b>BPM:</b> <span id="uh-hud-bpm-val">120</span><br>
    <b>Energy:</b> <span id="uh-hud-energy-val">Medium</span>
  </div>
  <div>
    <b>Hallucination Pack:</b>
    <select id="uh-hud-pack">
      <option value="urban">Urban</option>
      <option value="cyberpunk">Cyberpunk</option>
      <option value="nature">Nature</option>
      <option value="random">Random</option>
    </select>
  </div>
`;

// Add Mood dropdown to HUD
const moodDiv = document.createElement('div');
moodDiv.id = 'uh-hud-mood-dropdown';
moodDiv.style.margin = '12px 0';

moodDiv.innerHTML = `
  <label for="uh-hud-mood-select" style="font-weight:bold; margin-right:8px;">Mood:</label>
  <select id="uh-hud-mood-select" style="padding:4px 8px; border-radius:8px;">
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>
`;

hudPanel.appendChild(moodDiv);

// Set initial mood and handler
const moodSelect = document.getElementById('uh-hud-mood-select');
moodSelect.value = sessionMood;
moodSelect.onchange = e => {
  sessionMood = e.target.value;
  window.sessionMood = sessionMood;
  localStorage.setItem('sessionMood', sessionMood);
  if (typeof window.__uhHUDMoodCB === 'function') {
    window.__uhHUDMoodCB(sessionMood);
  }
};

// Create and insert the hallucination mode status label
const statusDiv = document.createElement('div');
statusDiv.id = 'uh-hud-hallucination-status';
statusDiv.style.fontWeight = 'bold';
statusDiv.style.fontSize = '1.3em';
statusDiv.style.margin = '12px 0';
statusDiv.innerHTML = `
  Hallucination Mode: <span id="uh-hud-mode-status" style="color:#c9302c;">OFF</span>
`;

hudPanel.appendChild(statusDiv);

// Add hallucination toggle switch
const toggleDiv = document.createElement('div');
toggleDiv.id = 'uh-hud-hallucination-toggle';
toggleDiv.style.display = 'flex';
toggleDiv.style.alignItems = 'center';
toggleDiv.style.gap = '12px';
toggleDiv.style.margin = '12px 0';

toggleDiv.innerHTML = `
  <label style="font-weight:bold;">Hallucinations:</label>
  <button id="uh-hud-toggle-btn" style="font-weight:bold; font-size:1.1em; border-radius:20px; border:none; padding:5px 16px; background:${hallucinationsEnabled ? '#24e052' : '#b8b8b8'}; color:#222;">
    ${hallucinationsEnabled ? 'ON' : 'OFF'}
  </button>
`;

hudPanel.appendChild(toggleDiv);

// Display effect counter in HUD
const effectCountDiv = document.createElement('div');
effectCountDiv.id = 'uh-hud-effect-count';
effectCountDiv.style.fontWeight = 'bold';
effectCountDiv.style.fontSize = '1.1em';
effectCountDiv.style.margin = '10px 0';
effectCountDiv.innerHTML = `Effects Triggered: <span id="uh-hud-effect-count-val">${effectCount}</span>`;
hudPanel.appendChild(effectCountDiv);

// Add effect frequency dropdown
const freqDiv = document.createElement('div');
freqDiv.id = 'uh-hud-effect-frequency';
freqDiv.style.margin = '12px 0';
freqDiv.innerHTML = `
  <label for="uh-hud-freq-select" style="font-weight:bold; margin-right:8px;">Effect Frequency:</label>
  <select id="uh-hud-freq-select" style="padding:4px 8px; border-radius:8px;">
    <option value="chill">Chill</option>
    <option value="normal">Normal</option>
    <option value="intense">Intense</option>
  </select>
  <span id="uh-hud-freq-label" style="margin-left:10px;font-weight:bold;">Frequency: ${effectFrequency.charAt(0).toUpperCase() + effectFrequency.slice(1)}</span>
`;
hudPanel.appendChild(freqDiv);
document.getElementById('uh-hud-freq-select').value = effectFrequency;
document.getElementById('uh-hud-freq-select').onchange = e => {
  effectFrequency = e.target.value;
  window.effectFrequency = effectFrequency;
  localStorage.setItem('effectFrequency', effectFrequency);
  document.getElementById('uh-hud-freq-label').textContent =
    'Frequency: ' + effectFrequency.charAt(0).toUpperCase() + effectFrequency.slice(1);
  restartEffectInterval();
};

function updateEffectCountHUD(count) {
  const el = document.getElementById('uh-hud-effect-count-val');
  if (el) el.textContent = count;
  localStorage.setItem('effectCount', count);
}

function setHallucinationToggleUI(enabled) {
  const btn = document.getElementById('uh-hud-toggle-btn');
  if (!btn) return;
  btn.textContent = enabled ? 'ON' : 'OFF';
  btn.style.background = enabled ? '#24e052' : '#b8b8b8';
}

document.getElementById('uh-hud-toggle-btn').onclick = () => {
  hallucinationsEnabled = !hallucinationsEnabled;
  window.hallucinationsEnabled = hallucinationsEnabled;
  localStorage.setItem('hallucinationsEnabled', JSON.stringify(hallucinationsEnabled));
  setHallucinationToggleUI(hallucinationsEnabled);
  updateHallucinationMode(hallucinationsEnabled);
};

function updateHallucinationMode(enabled) {
  const statusSpan = document.getElementById('uh-hud-mode-status');
  if (!statusSpan) return;
  statusSpan.textContent = enabled ? 'ON' : 'OFF';
  statusSpan.style.color = enabled ? '#24e052' : '#c9302c';
  statusSpan.style.fontWeight = 'bold';
}

// 4. Show/hide panel when HUD icon is clicked
hudIcon.onclick = () => {
  hudPanel.style.display = (hudPanel.style.display === 'none') ? 'flex' : 'none';
};

// 5. Add both to the document
document.body.appendChild(hudIcon);
document.body.appendChild(hudPanel);

// Initialize hallucination mode display
setHallucinationToggleUI(hallucinationsEnabled);
updateHallucinationMode(hallucinationsEnabled);

// 6. (Optional) Animate icon on hover
hudIcon.onmouseenter = () => hudIcon.style.background = 'rgba(50,90,200,0.75)';
hudIcon.onmouseleave = () => hudIcon.style.background = 'rgba(30,30,40,0.8)';

// 7. Session timer logic
function updateElapsedTimeDisplay(elapsed) {
  let totalSeconds = Math.floor(elapsed / 1000);
  let h = Math.floor(totalSeconds / 3600);
  let m = Math.floor((totalSeconds % 3600) / 60);
  let s = totalSeconds % 60;
  let str =
    h > 0
      ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const el = document.getElementById('uh-hud-session-elapsed');
  if (el) el.textContent = str;
}

setInterval(() => {
  const elapsed = Date.now() - sessionStartTime;
  updateElapsedTimeDisplay(elapsed);
}, 1000);

// Show initial time on load
updateElapsedTimeDisplay(Date.now() - sessionStartTime);

// BPM / Energy logic
function getEnergy(bpm) {
  if (bpm < 100) return 'Low';
  if (bpm < 130) return 'Medium';
  return 'High';
}

function updateBPM() {
  const bpm = Math.floor(Math.random() * (160 - 80 + 1)) + 80;
  document.getElementById('uh-hud-bpm-val').textContent = bpm;
  document.getElementById('uh-hud-energy-val').textContent = getEnergy(bpm);
}

updateBPM();
setInterval(updateBPM, 3000);

// Effect interval logic
let effectInterval = null;
function startEffectInterval() {
  clearEffectInterval();
  let interval;
  if (effectFrequency === 'intense') {
    interval = frequencyPresets.intense();
  } else {
    interval = frequencyPresets[effectFrequency];
  }
  effectInterval = setTimeout(() => {
    triggerEffect();
    startEffectInterval();
  }, interval);
}
function clearEffectInterval() {
  if (effectInterval) clearTimeout(effectInterval);
}
function restartEffectInterval() {
  startEffectInterval();
}

startEffectInterval();

function triggerEffect(...args) {
  if (hallucinationsEnabled) {
    // ... existing effect code here ...
    // Mood can influence intensity, visuals, etc.
    // sessionMood will be 'low', 'medium', or 'high'
    effectCount++;
    updateEffectCountHUD(effectCount);
  }
}

function resetEffectCount() {
  effectCount = 0;
  updateEffectCountHUD(effectCount);
}

function resetSessionStartTime() {
  sessionStartTime = Date.now();
  localStorage.setItem('sessionStartTime', sessionStartTime);
  updateElapsedTimeDisplay(0);
}

// 8. Exported functions (to connect data later)
// Use window.uhHUD.setStepCount(n), setInputSource('SlimeVR'), etc.
window.uhHUD = {
  setStepCount: n => document.getElementById('uh-hud-stepcount').textContent = n,
  setInputSource: src => document.getElementById('uh-hud-input').textContent = src,
  setPack: pack => document.getElementById('uh-hud-pack').value = pack,
  getPlaylist: () => document.getElementById('uh-hud-playlist').value,
  onPackChange: cb => document.getElementById('uh-hud-pack').onchange = e => cb(e.target.value),
  setHallucinationMode: enabled => updateHallucinationMode(enabled),
  setMood: mood => {
    document.getElementById('uh-hud-mood-select').value = mood;
    sessionMood = mood;
    window.sessionMood = mood;
    localStorage.setItem('sessionMood', mood);
  },
  getMood: () => sessionMood,
  onMoodChange: cb => window.__uhHUDMoodCB = cb,
  resetEffectCount,
  resetSessionStartTime,
};

// Sync counter on startup
updateEffectCountHUD(effectCount);

// Export triggerEffect and reset function to global scope if needed
window.triggerEffect = triggerEffect;
window.resetEffectCount = resetEffectCount;
window.resetSessionStartTime = resetSessionStartTime;
