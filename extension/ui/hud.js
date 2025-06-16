// HUD Panel for Urban Hallucination Overlay

// 0. Restore hallucination state from localStorage
let hallucinationsEnabled = JSON.parse(localStorage.getItem('hallucinationsEnabled') ?? 'true');
window.hallucinationsEnabled = hallucinationsEnabled;

// 0b. Restore session mood from localStorage or set default
let sessionMood = localStorage.getItem('currentMood') || 'medium';
window.sessionMood = sessionMood;

// Restore step count from storage or start at 0
let stepCount = Number(localStorage.getItem('stepCount') || 0);
window.stepCount = stepCount;

// Restore effect count from storage or start at 0
let effectCount = Number(localStorage.getItem('effectCount') || 0);

// Restore effect pack selection or set default
let currentEffectPack = localStorage.getItem('currentEffectPack') || '';
window.currentEffectPack = currentEffectPack;

// ---- Hallucination Pack Setup ----
const packMap = {
  Default: {
    low: ["soft", "fade"],
    medium: ["pulse", "float"],
    high: ["flash", "strobe"],
  },
  Cyberpunk: {
    low: ["glitch", "pulse"],
    medium: ["static-drift", "scanline"],
    high: ["neon-bloom", "electric-smear"],
  },
  Dreamcore: {
    low: ["haze", "pastel-float"],
    medium: ["echo-glow", "drift-wave"],
    high: ["vapor-burst", "rainbow-veil"],
  },
};

const packNames = Object.keys(packMap);
let currentPack = localStorage.getItem('currentPack') || packNames[0];
let moodEffectMap = packMap[currentPack];
window.currentPack = currentPack;
window.moodEffectMap = moodEffectMap;

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
  <span id="uh-hud-mood-label" style="margin-left:10px;font-weight:bold;">Mood: ${sessionMood.charAt(0).toUpperCase() + sessionMood.slice(1)}</span>
`;

hudPanel.appendChild(moodDiv);

// ---- Hallucination Pack dropdown ----
const packDiv = document.createElement('div');
packDiv.id = 'uh-hud-pack-switcher';
packDiv.style.margin = '12px 0';
packDiv.innerHTML = `
  <label for="uh-hud-pack-select" style="font-weight:bold; margin-right:8px;">Hallucination Pack:</label>
  <select id="uh-hud-pack-select"></select>
  <span id="uh-hud-pack-label" style="margin-left:10px; font-weight:bold;">Pack: ${currentPack}</span>
`;
hudPanel.appendChild(packDiv);

const packSelect = document.getElementById('uh-hud-pack-select');
packNames.forEach(name => {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  packSelect.appendChild(opt);
});
packSelect.value = currentPack;
packSelect.onchange = e => {
  currentPack = e.target.value;
  moodEffectMap = packMap[currentPack];
  window.currentPack = currentPack;
  window.moodEffectMap = moodEffectMap;
  localStorage.setItem('currentPack', currentPack);
  document.getElementById('uh-hud-pack-label').textContent = 'Pack: ' + currentPack;
};


// Set initial mood and handler
const moodSelect = document.getElementById('uh-hud-mood-select');
moodSelect.value = sessionMood;
moodSelect.onchange = e => {
  sessionMood = e.target.value;
  window.sessionMood = sessionMood;
  localStorage.setItem('currentMood', sessionMood);
  document.getElementById('uh-hud-mood-label').textContent =
    'Mood: ' + sessionMood.charAt(0).toUpperCase() + sessionMood.slice(1);
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
  <label for="uh-hud-freq-select" style="font-weight:bold; margin-right:8px;">Intensity:</label>
  <select id="uh-hud-freq-select" style="padding:4px 8px; border-radius:8px;">
    <option value="chill">Chill</option>
    <option value="normal">Normal</option>
    <option value="intense">Intense</option>
  </select>
  <span id="uh-hud-freq-label" style="margin-left:10px;font-weight:bold;">Intensity: ${effectFrequency.charAt(0).toUpperCase() + effectFrequency.slice(1)}</span>
`;
hudPanel.appendChild(freqDiv);
document.getElementById('uh-hud-freq-select').value = effectFrequency;
document.getElementById('uh-hud-freq-select').onchange = e => {
  effectFrequency = e.target.value;
  window.effectFrequency = effectFrequency;
  localStorage.setItem('effectFrequency', effectFrequency);
  document.getElementById('uh-hud-freq-label').textContent =
    'Intensity: ' + effectFrequency.charAt(0).toUpperCase() + effectFrequency.slice(1);
  restartEffectInterval();
  if (typeof window.__uhHUDFreqCB === 'function') {
    window.__uhHUDFreqCB(effectFrequency);
  }
};

// Add Reset Session button
const resetDiv = document.createElement('div');
resetDiv.id = 'uh-hud-reset';
resetDiv.style.margin = '12px 0';
resetDiv.innerHTML = `
  <button id="uh-hud-reset-btn" style="font-weight:bold; font-size:1em; border-radius:10px; border:none; padding:7px 18px; background:#f23a3a; color:white; box-shadow:0 2px 8px #0002; transition:background 0.3s;">
    Reset Session
  </button>
`;
hudPanel.appendChild(resetDiv);

function updateEffectCountHUD(count) {
  const el = document.getElementById('uh-hud-effect-count-val');
  if (el) el.textContent = count;
  localStorage.setItem('effectCount', count);
}

function updateStepCountHUD(count) {
  const el = document.getElementById('uh-hud-stepcount');
  if (el) el.textContent = count;
  localStorage.setItem('stepCount', count);
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

// Hook up Reset Session button
document.getElementById('uh-hud-reset-btn').onclick = () => {
  resetSession();
  const panel = document.getElementById('uh-hud-panel');
  panel.style.transition = 'box-shadow 0.5s, background 0.5s';
  panel.style.boxShadow = '0 0 30px 10px #f23a3a66';
  setTimeout(() => {
    panel.style.boxShadow = '';
  }, 350);
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
    if (typeof window.triggerZoneEffect === 'function') {
      window.triggerZoneEffect();
    }
    effectCount++;
    updateEffectCountHUD(effectCount);
  }
}

function triggerEffectForMood(mood) {
  const options = moodEffectMap[mood] || [];
  const effect = options[Math.floor(Math.random() * options.length)];
  if (effect) {
    // Placeholder for actual effect triggering logic
    console.log('Triggering effect:', effect);
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
  resetEffectCount();
}

function resetSession() {
  stepCount = 0;
  effectCount = 0;
  sessionMood = 'medium';
  currentEffectPack = localStorage.getItem('currentEffectPack') || currentEffectPack || 'urban';
  sessionStartTime = Date.now();

  window.stepCount = stepCount;
  window.sessionMood = sessionMood;
  window.currentEffectPack = currentEffectPack;
  window.sessionStartTime = sessionStartTime;

  localStorage.setItem('stepCount', stepCount);
  localStorage.setItem('effectCount', effectCount);
  localStorage.setItem('currentMood', sessionMood);
  localStorage.setItem('currentEffectPack', currentEffectPack);
  localStorage.setItem('sessionStartTime', sessionStartTime);

  updateStepCountHUD(stepCount);
  document.getElementById('uh-hud-mood-select').value = sessionMood;
  document.getElementById('uh-hud-mood-label').textContent =
    'Mood: ' + sessionMood.charAt(0).toUpperCase() + sessionMood.slice(1);
  if (typeof window.updateEffectPackHUD === 'function') {
    window.updateEffectPackHUD(currentEffectPack);
  } else {
    const sel = document.getElementById('uh-hud-pack');
    if (sel) sel.value = currentEffectPack;
  }
  updateElapsedTimeDisplay(0);
  updateEffectCountHUD(effectCount);
}

// 8. Exported functions (to connect data later)
// Use window.uhHUD.setStepCount(n), setInputSource('SlimeVR'), etc.
window.uhHUD = {
  setStepCount: n => {
    stepCount = n;
    updateStepCountHUD(stepCount);
  },
  setInputSource: src => document.getElementById('uh-hud-input').textContent = src,
  setPack: pack => {
    if (typeof window.updateEffectPackHUD === 'function') {
      window.updateEffectPackHUD(pack);
    } else {
      const sel = document.getElementById('uh-hud-pack');
      if (sel) sel.value = pack;
    }
    currentEffectPack = pack;
    window.currentEffectPack = pack;
    localStorage.setItem('currentEffectPack', pack);
  },
  getPlaylist: () => document.getElementById('uh-hud-playlist').value,
  getPack: () => currentEffectPack,
  onPackChange: cb => window.__uhHUDPackCB = cb,
  setHallucinationMode: enabled => updateHallucinationMode(enabled),
  setMood: mood => {
    document.getElementById('uh-hud-mood-select').value = mood;
    sessionMood = mood;
    window.sessionMood = mood;
    localStorage.setItem('currentMood', mood);
    document.getElementById('uh-hud-mood-label').textContent =
      'Mood: ' + mood.charAt(0).toUpperCase() + mood.slice(1);
  },
  getMood: () => sessionMood,
  onMoodChange: cb => window.__uhHUDMoodCB = cb,
  setEffectFrequency: freq => {
    document.getElementById('uh-hud-freq-select').value = freq;
    effectFrequency = freq;
    window.effectFrequency = freq;
    localStorage.setItem('effectFrequency', freq);
    document.getElementById('uh-hud-freq-label').textContent =
      'Intensity: ' + freq.charAt(0).toUpperCase() + freq.slice(1);
    restartEffectInterval();
  },
  getEffectFrequency: () => effectFrequency,
  onEffectFrequencyChange: cb => window.__uhHUDFreqCB = cb,
  resetEffectCount,
  resetSessionStartTime,
  resetSession,
};

// Sync counter on startup
updateEffectCountHUD(effectCount);
updateStepCountHUD(stepCount);

// Export triggerEffect and reset function to global scope if needed
window.triggerEffect = triggerEffect;
window.triggerEffectForMood = triggerEffectForMood;
window.resetEffectCount = resetEffectCount;
window.resetSessionStartTime = resetSessionStartTime;
window.resetSession = resetSession;
