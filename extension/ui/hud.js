// HUD Panel for Urban Hallucination Overlay

// 0. Restore hallucination state from localStorage
let hallucinationsEnabled = JSON.parse(localStorage.getItem('hallucinationsEnabled') ?? 'true');
window.hallucinationsEnabled = hallucinationsEnabled;

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
  <div><b>Time:</b> <span id="uh-hud-timer">00:00:00</span></div>
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

// Create the hallucination mode label
const modeDiv = document.createElement('div');
modeDiv.id = 'uh-hud-hallucination-mode';
modeDiv.innerHTML = `<b>Hallucination Mode: <span id="uh-hud-mode-status">OFF</span></b>`;
modeDiv.style.fontSize = '1.3em';
modeDiv.style.margin = '12px 0';
hudPanel.appendChild(modeDiv);

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
  statusSpan.style.color = enabled ? '#19e22e' : '#c9302c';
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

// 7. (Optional) Simple timer logic (replace this with your real session timer)
let sessionSeconds = 0;
setInterval(() => {
  sessionSeconds++;
  let h = String(Math.floor(sessionSeconds / 3600)).padStart(2, '0');
  let m = String(Math.floor((sessionSeconds % 3600) / 60)).padStart(2, '0');
  let s = String(sessionSeconds % 60).padStart(2, '0');
  document.getElementById('uh-hud-timer').textContent = `${h}:${m}:${s}`;
}, 1000);

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

function triggerEffect(...args) {
  if (hallucinationsEnabled) {
    // ... existing effect code here ...
  }
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
};
