// HUD Panel for Urban Hallucination Overlay

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

// 4. Show/hide panel when HUD icon is clicked
hudIcon.onclick = () => {
  hudPanel.style.display = (hudPanel.style.display === 'none') ? 'flex' : 'none';
};

// 5. Add both to the document
document.body.appendChild(hudIcon);
document.body.appendChild(hudPanel);

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

// 8. Exported functions (to connect data later)
// Use window.uhHUD.setStepCount(n), setInputSource('SlimeVR'), etc.
window.uhHUD = {
  setStepCount: n => document.getElementById('uh-hud-stepcount').textContent = n,
  setInputSource: src => document.getElementById('uh-hud-input').textContent = src,
  setPack: pack => document.getElementById('uh-hud-pack').value = pack,
  getPlaylist: () => document.getElementById('uh-hud-playlist').value,
  onPackChange: cb => document.getElementById('uh-hud-pack').onchange = e => cb(e.target.value),
};
