// Manage effect packs loaded from JSON files
let moodEffectMap = {};
let zoneEffectMap = {};
window.zoneEffectMap = zoneEffectMap;
let effectPacks = {};
let currentEffectPack = localStorage.getItem('currentEffectPack') || 'cyberpunk';

// Global toggle to enable/disable audio-driven triggers
let audioTriggersEnabled = true;
window.audioTriggersEnabled = audioTriggersEnabled;

function updateEffectPackHUD(packName) {
  const label = document.getElementById('uh-hud-pack-label');
  if (label) label.textContent = packName;
  const sel = document.getElementById('uh-hud-pack');
  if (sel) sel.value = packName;
  window.currentEffectPack = packName;
}

// Load a single effect pack and update mappings
async function loadEffectPack(packName) {
  const resp = await fetch(`effect-packs/${packName}.json`);
  if (!resp.ok) throw new Error(`Could not load effect pack: ${packName}`);
  const pack = await resp.json();

  effectPacks[packName] = pack;
  moodEffectMap = pack.moods || {};
  zoneEffectMap = pack.zones || {};
  window.zoneEffectMap = zoneEffectMap;

  updateEffectPackHUD(pack.name);

  localStorage.setItem('currentEffectPack', packName);
}

// Initialize packs and populate dropdown
async function initializeEffectPacks() {
  const packNames = ['cyberpunk', 'dreamcore', 'industrial'];
  const sel = document.getElementById('uh-hud-pack');
  sel.innerHTML = '';
  for (let name of packNames) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    sel.appendChild(opt);
  }
  sel.value = currentEffectPack;
  await loadEffectPack(currentEffectPack);
}

// Create dropdown container
const packDiv = document.createElement('div');
packDiv.id = 'uh-hud-pack-select';
packDiv.style.margin = '10px 0';
packDiv.innerHTML = `
  <label for="uh-hud-pack" style="font-weight:bold; margin-right:6px;">Pack:</label>
  <select id="uh-hud-pack"></select>
  <span id="uh-hud-pack-label" style="margin-left:10px; font-weight:bold;">${currentEffectPack}</span>
`;

// --- BPM & Energy HUD Elements ---
const bpmDisplay = document.createElement('div');

function getEnergyLevel(bpm) {
  if (bpm < 100) return 'Low';
  if (bpm <= 130) return 'Medium';
  return 'High';
}

function getSimulatedBPM() {
  return Math.floor(Math.random() * (160 - 80 + 1)) + 80;
}

// Startup when HUD exists
window.addEventListener('DOMContentLoaded', async () => {
  const panel = document.getElementById('uh-hud-panel');
  if (panel) {
    panel.appendChild(packDiv);
    panel.appendChild(bpmDisplay);
    await initializeEffectPacks();
    document.getElementById('uh-hud-pack').onchange = async e => {
      await loadEffectPack(e.target.value);
    };
  }
});

// Helper to use current mappings
function getEffectsForMood(mood) {
  return moodEffectMap[mood] || [];
}

function getZoneEffect(zone) {
  return zoneEffectMap[zone];
}

// --- Zone-based effect selection helpers ---
function pickZone() {
  const names = Object.keys(zoneEffectMap);
  if (!names.length) return null;
  return names[Math.floor(Math.random() * names.length)];
}

function pickEffectForZone(zone) {
  const effects = zoneEffectMap[zone] || [];
  if (!effects.length) return null;
  return effects[Math.floor(Math.random() * effects.length)];
}

function triggerZoneEffect() {
  const zone = pickZone();
  if (!zone) return;
  const effect = pickEffectForZone(zone);
  if (!effect) return;

  triggerNamedZoneEffect(effect, zone);

  document.getElementById('uh-hud-effect-zone')?.remove();
  const hudDiv = document.createElement('div');
  hudDiv.id = 'uh-hud-effect-zone';
  hudDiv.style.margin = '10px 0';
  hudDiv.style.fontWeight = 'bold';
  hudDiv.innerHTML = `Effect: <span style="color:#19e22e;">${effect}</span> | Zone: <span style="color:#1982e2;">${zone}</span>`;
  document.getElementById('uh-hud-panel')?.appendChild(hudDiv);
}

// Map effect names to implementation type
const effectTypeMap = {
  'soft-glow': 'css',
  'flicker-lines': 'canvas',
  'static-drift': 'canvas',
  'scanline-burst': 'canvas',
  'neon-bloom': 'css',
  'electric-smear': 'css',
  'hazy-fade': 'css',
  'pastel-flow': 'css',
  'echo-swirl': 'canvas',
  'deep-mist': 'css',
  'vivid-flash': 'css',
  'liquid-shift': 'canvas',
  'rust-grain': 'css',
  'smoke-overlay': 'css',
  'gear-spark': 'canvas',
  'steam-bleed': 'css',
  'metal-clang': 'canvas',
  'factory-blast': 'canvas'
};

// Simple CSS filter presets per effect
const effectFilters = {
  'soft-glow': 'blur(3px) brightness(1.2)',
  'neon-bloom': 'contrast(1.4) saturate(1.8)',
  'electric-smear': 'hue-rotate(90deg) saturate(2.5)',
  'hazy-fade': 'blur(6px) opacity(0.7)',
  'pastel-flow': 'hue-rotate(180deg) saturate(1.3)',
  'deep-mist': 'blur(8px)',
  'vivid-flash': 'brightness(1.6) contrast(1.5)',
  'rust-grain': 'sepia(0.8) contrast(1.1)',
  'smoke-overlay': 'grayscale(0.4) blur(2px)',
  'steam-bleed': 'brightness(1.3) blur(4px)'
};

// Canvas draw callbacks per effect
const canvasDrawMap = {
  'flicker-lines': drawScanlines,
  'static-drift': drawScanlines,
  'scanline-burst': drawScanlines,
  'echo-swirl': drawEchoSwirl,
  'liquid-shift': drawRipple,
  'gear-spark': drawSpark,
  'metal-clang': drawSpark,
  'factory-blast': drawSpark
};

function triggerNamedZoneEffect(effect, zoneName) {
  if (effectTypeMap[effect] === 'css') {
    const filter = effectFilters[effect] || '';
    applyCssZoneEffect(effect, zoneName, filter);
  } else if (effectTypeMap[effect] === 'canvas') {
    const drawFn = canvasDrawMap[effect];
    if (typeof drawFn === 'function') {
      applyCanvasZoneEffect(effect, zoneName, drawFn);
    }
  }
}

// Helper for CSS overlay
function applyCssZoneEffect(effect, zoneName, filterString) {
  const zone = screenZones[zoneName];
  if (!zone) return;
  const div = document.createElement('div');
  Object.assign(div.style, zone, {
    position: 'fixed',
    zIndex: 10010,
    pointerEvents: 'none',
    filter: filterString,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    mixBlendMode: 'overlay'
  });
  div.className = 'uh-css-effect-overlay';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1200);
}

// Helper for canvas based overlay
function applyCanvasZoneEffect(effect, zoneName, drawEffectFn) {
  const zone = screenZones[zoneName];
  if (!zone) return;
  let canvas = document.getElementById('uh-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'uh-canvas';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 10000
    });
    document.body.appendChild(canvas);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.beginPath();
  let left = parseFloat(zone.left) / 100 * window.innerWidth || 0;
  let top = parseFloat(zone.top) / 100 * window.innerHeight || 0;
  if (zone.right) left = window.innerWidth - parseFloat(zone.right) / 100 * window.innerWidth - parseFloat(zone.width) / 100 * window.innerWidth;
  if (zone.bottom) top = window.innerHeight - parseFloat(zone.bottom) / 100 * window.innerHeight - parseFloat(zone.height) / 100 * window.innerHeight;
  let width = parseFloat(zone.width) / 100 * window.innerWidth;
  let height = parseFloat(zone.height) / 100 * window.innerHeight;
  ctx.rect(left, top, width, height);
  ctx.clip();

  drawEffectFn(ctx, left, top, width, height);

  ctx.restore();
}

// Example canvas effect implementations
function drawScanlines(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  for (let i = 0; i < h; i += 6) {
    ctx.fillRect(x, y + i, w, 2);
  }
}

function drawEchoSwirl(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  for (let r = 5; r < Math.min(w, h) / 2; r += 10) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawRipple(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.strokeStyle = 'rgba(0,150,255,0.3)';
  for (let r = 0; r < Math.min(w, h) / 2; r += 8) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSpark(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(255,200,50,0.6)';
  for (let i = 0; i < 20; i++) {
    const sx = x + Math.random() * w;
    const sy = y + Math.random() * h;
    ctx.fillRect(sx, sy, 2, 2);
  }
}

// --- Screen zone definitions ---
const screenZones = {
  "top-left": { top: 0, left: 0, width: "30vw", height: "30vh" },
  "center": { top: "35vh", left: "35vw", width: "30vw", height: "30vh" },
  "bottom": { bottom: 0, left: 0, width: "100vw", height: "25vh" },
};

// Get computed style object for a zone
function getZoneStyles(zoneName) {
  const zone = screenZones[zoneName];
  if (!zone) return {};
  const style = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 99998,
    ...zone,
  };
  if (!style.top && style.top !== 0) style.top = "auto";
  if (!style.bottom && style.bottom !== 0) style.bottom = "auto";
  if (!style.left && style.left !== 0) style.left = "auto";
  if (!style.right && style.right !== 0) style.right = "auto";
  return style;
}

// Debug helpers to visualize zones
function showDebugZones() {
  Object.entries(screenZones).forEach(([name, _style], idx) => {
    const box = document.createElement("div");
    Object.assign(box.style, getZoneStyles(name));
    box.style.background = `rgba(${(60 * idx) % 255}, ${(180 * idx) % 255}, ${(90 * idx) % 255}, 0.18)`;
    box.style.border = "2px dashed #0008";
    box.style.fontSize = "1.2em";
    box.style.color = "#000";
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.className = "uh-debug-zone";
    box.innerText = name;
    document.body.appendChild(box);
  });
}

function removeDebugZones() {
  document.querySelectorAll(".uh-debug-zone").forEach(el => el.remove());
}

function createZoneOverlay(zoneName, effectElement) {
  Object.assign(effectElement.style, getZoneStyles(zoneName));
  document.body.appendChild(effectElement);
}

// Export helpers if needed
window.screenZones = screenZones;
window.getZoneStyles = getZoneStyles;
window.showDebugZones = showDebugZones;
window.removeDebugZones = removeDebugZones;
window.createZoneOverlay = createZoneOverlay;
window.triggerZoneEffect = triggerZoneEffect;

// --- WebSocket Step Listener ---
let stepCount = 0;
let inputSource = "Keyboard";
let socket;

function updateInputSource(source) {
  inputSource = source;
  const label = document.getElementById('input-source-display');
  if (label) label.innerText = `Input Source: ${source}`;
}

function updateStepCounter(count) {
  const stepLabel = document.getElementById('step-counter');
  if (stepLabel) stepLabel.innerText = `Steps: ${count}`;
}

function pickEffectForCurrentMood() {
  const effects = moodEffectMap[sessionMood] || [];
  return effects[Math.floor(Math.random() * effects.length)] || null;
}

function connectWebSocket() {
  socket = new WebSocket("ws://localhost:6789");

  socket.onopen = () => {
    console.log("[RunTheWorld] Connected to step server.");
    updateInputSource("WebSocket (Fake Server)");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.steps) {
        stepCount += data.steps;
        updateStepCounter(stepCount);
        if (typeof triggerEffect === 'function') {
          const eff = pickEffectForCurrentMood();
          if (eff) triggerEffect(eff);
        }
        console.log("[RunTheWorld] Step event → Effect triggered");
      }
    } catch (err) {
      console.error("[RunTheWorld] Invalid message:", event.data);
    }
  };

  socket.onerror = (err) => {
    console.error("[RunTheWorld] WebSocket error:", err);
    updateInputSource("Disconnected");
  };

  socket.onclose = () => {
    console.warn("[RunTheWorld] WebSocket closed. Retrying in 3s.");
    updateInputSource("Disconnected");
    setTimeout(connectWebSocket, 3000);
  };
}

connectWebSocket();

// Initial BPM display and periodic updates
function updateBPM() {
  const bpm = getSimulatedBPM();
  const energy = getEnergyLevel(bpm);
  bpmDisplay.innerText = `BPM: ${bpm} | Energy: ${energy}`;
  console.log(`[RunTheWorld] BPM: ${bpm}, Energy: ${energy}`);
}

updateBPM();
setInterval(updateBPM, 4000);

// Auto-mute YouTube videos on watch pages
const KEYWORDS = [
  'walk',
  'walking',
  'run',
  'running',
  'treadmill',
  'virtual tour',
  'stroll',
  'hiking',
  'jog',
  'city walk',
  'bike ride'
];

function isFitnessVideo() {
  const title = document.title.toLowerCase();
  let channel = '';
  const channelElem = document.querySelector('#channel-name, ytd-channel-name');
  if (channelElem) channel = channelElem.innerText.toLowerCase();
  return KEYWORDS.some((kw) => title.includes(kw) || channel.includes(kw));
}

function isYouTubeWatchPage() {
  return (
    window.location.hostname === 'www.youtube.com' &&
    window.location.pathname === '/watch'
  );
}

if (isYouTubeWatchPage()) {
  if (isFitnessVideo()) {
    function muteVideo() {
      const video = document.querySelector('video');
      if (video && !video.muted) {
        video.muted = true;
        return true;
      }
      return false;
    }

    if (!muteVideo()) {
      let tries = 0;
      const maxTries = 20;
      const interval = setInterval(() => {
        if (muteVideo() || ++tries >= maxTries) clearInterval(interval);
      }, 250);

      const observer = new MutationObserver(() => {
        if (muteVideo()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
}


// --- Manual Mute Toggle with HUD Status ---
function updateAudioStatus() {
  let status = 'Unknown';
  const video = document.querySelector('video');
  if (video) status = video.muted ? 'Muted' : 'Unmuted';

  let hud = document.getElementById('urban-hallucination-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'urban-hallucination-hud';
    hud.style.position = 'fixed';
    hud.style.top = '20px';
    hud.style.right = '20px';
    hud.style.background = 'rgba(0,0,0,0.7)';
    hud.style.color = '#fff';
    hud.style.padding = '8px 18px';
    hud.style.fontSize = '18px';
    hud.style.zIndex = '999999';
    hud.style.borderRadius = '8px';
    document.body.appendChild(hud);
  }

  let statusEl = document.getElementById('uh-audio-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'uh-audio-status';
    hud.appendChild(statusEl);
  }
  statusEl.textContent = `Audio: ${status}`;
}

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'm') {
    const video = document.querySelector('video');
    if (video) {
      video.muted = !video.muted;
      updateAudioStatus();
    }
  }
});

const observeAudio = () => {
  const video = document.querySelector('video');
  if (video) {
    video.addEventListener('volumechange', updateAudioStatus);
    updateAudioStatus();
  }
};

observeAudio();

// --- Add a playlist dropdown to the HUD ---

function getPlaylists() {
  // Hardcode playlists for now; fetch dynamically later if needed
  return [
    { name: 'YouTube Music', value: 'ytmusic' },
    { name: 'Morning Run Mix', value: 'morning_run' },
    { name: 'Night City Walks', value: 'night_city' },
    { name: 'Dreamcore Journeys', value: 'dreamcore' }
  ];
}

function updatePlaylistHUD() {
  // Find or create the main HUD container
  let hud = document.getElementById('urban-hallucination-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'urban-hallucination-hud';
    hud.style.position = 'fixed';
    hud.style.top = '20px';
    hud.style.right = '20px';
    hud.style.background = 'rgba(0,0,0,0.7)';
    hud.style.color = '#fff';
    hud.style.padding = '8px 18px';
    hud.style.fontSize = '18px';
    hud.style.zIndex = '999999';
    hud.style.borderRadius = '8px';
    document.body.appendChild(hud);
  }

  // Remove existing playlist selector, if present
  let playlistWrap = document.getElementById('playlist-hud-wrap');
  if (playlistWrap) playlistWrap.remove();

  // Create wrapper for playlist dropdown + button
  playlistWrap = document.createElement('div');
  playlistWrap.id = 'playlist-hud-wrap';
  playlistWrap.style.marginTop = '12px';

  // Label
  const label = document.createElement('label');
  label.textContent = 'Playlist: ';
  label.style.marginRight = '8px';

  // Dropdown
  const select = document.createElement('select');
  select.id = 'playlist-dropdown';
  select.style.fontSize = '16px';

  // Populate options
  getPlaylists().forEach(pl => {
    const option = document.createElement('option');
    option.value = pl.value;
    option.textContent = pl.name;
    select.appendChild(option);
  });

  // Optional: handle selection change
  select.addEventListener('change', e => {
    const value = e.target.value;
    console.log('Selected playlist:', value);
  });

  // Start Playlist Button
  const button = document.createElement('button');
  button.textContent = 'Start Playlist';
  button.style.marginLeft = '12px';
  button.style.fontSize = '16px';
  button.style.padding = '4px 14px';
  button.style.background = '#222';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '6px';
  button.style.cursor = 'pointer';
  button.addEventListener('click', () => {
    const selected = select.value;
    // TODO: Replace with real playlist start logic
    console.log('Starting playlist:', selected);
    // You can trigger overlay logic, send a message, or launch a link here
  });

  playlistWrap.appendChild(label);
  playlistWrap.appendChild(select);
  playlistWrap.appendChild(button);
  hud.appendChild(playlistWrap);
}

// Call this after HUD is created
updatePlaylistHUD();

// --- Display current YouTube Music track ---
function getCurrentSongInfo() {
  if (!window.location.hostname.includes('music.youtube.com')) return null;

  const titleElem = document.querySelector('.title.ytmusic-player-bar');
  const artistElem = document.querySelector('.byline.ytmusic-player-bar');

  if (titleElem && artistElem) {
    const title = titleElem.textContent.trim();
    const artist = artistElem.textContent.trim();
    return { title, artist };
  }
  return null;
}

function updateSongHUD() {
  const info = getCurrentSongInfo();
  if (!info) return;

  let hud = document.getElementById('urban-hallucination-hud');
  if (!hud) return;

  let songInfo = document.getElementById('hud-song-info');
  if (!songInfo) {
    songInfo = document.createElement('div');
    songInfo.id = 'hud-song-info';
    songInfo.style.marginTop = '8px';
    hud.appendChild(songInfo);
  }

  songInfo.textContent = `Now Playing: ${info.title} — ${info.artist}`;
}

setInterval(updateSongHUD, 2000);

// --- Natural hallucination spawn timer ---
function getNaturalInterval() {
  // Slight bias to shorter intervals for natural feel
  const base = 8000 + Math.random() * 10000; // 8s–18s
  // Add a tiny random jitter (±500ms)
  const jitter = (Math.random() - 0.5) * 1000;
  return Math.max(5000, Math.floor(base + jitter)); // never shorter than 5s
}

function spawnHallucination() {
  // TODO: Replace with your hallucination-spawning logic
  console.log('🌈 Spawn hallucination! (replace with your effect)');
  // e.g., drawPNGOnCanvas(), applyVisualEffect(), etc.
}

function startNaturalSpawnTimer() {
  function scheduleNext() {
    const interval = getNaturalInterval();
    setTimeout(() => {
      spawnHallucination();
      scheduleNext();
    }, interval);
  }
  scheduleNext();
}

// Start the natural spawn timer when ready
startNaturalSpawnTimer();

// --- Session Timer ---
let sessionStart = Date.now();

function formatTime(ms) {
  // Format ms as mm:ss
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateSessionTimer() {
  const now = Date.now();
  const elapsed = now - sessionStart;

  // Find or create the HUD
  let hud = document.getElementById('urban-hallucination-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'urban-hallucination-hud';
    hud.style.position = 'fixed';
    hud.style.top = '20px';
    hud.style.right = '20px';
    hud.style.background = 'rgba(0,0,0,0.7)';
    hud.style.color = '#fff';
    hud.style.padding = '8px 18px';
    hud.style.fontSize = '18px';
    hud.style.zIndex = '999999';
    hud.style.borderRadius = '8px';
    document.body.appendChild(hud);
  }

  // Find or create session timer field
  let timer = document.getElementById('session-timer');
  if (!timer) {
    timer = document.createElement('div');
    timer.id = 'session-timer';
    timer.style.marginTop = '8px';
    hud.appendChild(timer);
  }

  timer.textContent = `Session: ${formatTime(elapsed)}`;
}

// Start and update the timer every second
setInterval(updateSessionTimer, 1000);
updateSessionTimer(); // show immediately on load

// --- "Just Let Me Run" Toggle ---
function addJustLetMeRunToggle() {
  let hud = document.getElementById('urban-hallucination-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'urban-hallucination-hud';
    hud.style.position = 'fixed';
    hud.style.top = '20px';
    hud.style.right = '20px';
    hud.style.background = 'rgba(0,0,0,0.7)';
    hud.style.color = '#fff';
    hud.style.padding = '8px 18px';
    hud.style.fontSize = '18px';
    hud.style.zIndex = '999999';
    hud.style.borderRadius = '8px';
    document.body.appendChild(hud);
  }

  // Remove if it already exists
  let runWrap = document.getElementById('run-toggle-wrap');
  if (runWrap) runWrap.remove();

  // Create wrapper
  runWrap = document.createElement('div');
  runWrap.id = 'run-toggle-wrap';
  runWrap.style.marginTop = '12px';

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'just-let-me-run';
  checkbox.style.marginRight = '6px';

  // Label
  const label = document.createElement('label');
  label.htmlFor = 'just-let-me-run';
  label.textContent = 'Just Let Me Run (Simple Timed Mode)';

  // Handler: enable/disable simple timed mode
  checkbox.addEventListener('change', (e) => {
    audioTriggersEnabled = !e.target.checked; // Disable if checked
    window.audioTriggersEnabled = audioTriggersEnabled;
    if (e.target.checked) {
      console.log("Simple Timed Mode: ON (Audio triggers paused)");
      // Optionally, pause/stop any ongoing audio-triggered intervals or effects here
    } else {
      console.log("Simple Timed Mode: OFF (Audio triggers resumed)");
      // Optionally, resume audio triggers
    }
  });

  runWrap.appendChild(checkbox);
  runWrap.appendChild(label);
  hud.appendChild(runWrap);
}

addJustLetMeRunToggle();

// --- Music Tag Cache for YouTube Music ---
// Saves a tag for each song, loads tag when song changes/repeats, and confirms in HUD

function getSongId(info) {
  return info ? `${info.title} — ${info.artist}` : null;
}

function getTagCache() {
  return JSON.parse(localStorage.getItem('tagCache') || '{}');
}

function setTagCache(cache) {
  localStorage.setItem('tagCache', JSON.stringify(cache));
}

function addTagButtons(tags, onTagClick, getCurrentSong) {
  let hud = document.getElementById('urban-hallucination-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'urban-hallucination-hud';
    hud.style.position = 'fixed';
    hud.style.top = '20px';
    hud.style.right = '20px';
    hud.style.background = 'rgba(0,0,0,0.7)';
    hud.style.color = '#fff';
    hud.style.padding = '8px 18px';
    hud.style.fontSize = '18px';
    hud.style.zIndex = '999999';
    hud.style.borderRadius = '8px';
    document.body.appendChild(hud);
  }

  let tagWrap = document.getElementById('hud-tag-buttons');
  if (tagWrap) tagWrap.remove();

  tagWrap = document.createElement('div');
  tagWrap.id = 'hud-tag-buttons';
  tagWrap.style.marginTop = '12px';

  let tagStatus = document.getElementById('hud-tag-status');
  if (!tagStatus) {
    tagStatus = document.createElement('div');
    tagStatus.id = 'hud-tag-status';
    tagStatus.style.marginTop = '6px';
    tagStatus.style.fontSize = '16px';
    hud.appendChild(tagStatus);
  }

  function updateTagUI(selectedTag) {
    Array.from(tagWrap.children).forEach(b =>
      b.style.background = b.textContent === selectedTag ? '#29a19c' : '#353535'
    );
    tagStatus.textContent = selectedTag
      ? `Selected tag: ${selectedTag}`
      : 'No tag selected';
    console.log('Selected tag:', selectedTag);
  }

  const info = getCurrentSong();
  const songId = getSongId(info);
  const cache = getTagCache();
  const savedTag = songId ? cache[songId] : null;

  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.style.margin = '0 6px 6px 0';
    btn.style.padding = '4px 14px';
    btn.style.background = tag === savedTag ? '#29a19c' : '#353535';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.fontSize = '16px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      if (!info) return;
      const id = getSongId(info);
      const cache = getTagCache();
      cache[id] = tag;
      setTagCache(cache);
      updateTagUI(tag);
      onTagClick(tag);
    });
    tagWrap.appendChild(btn);
  });

  hud.appendChild(tagWrap);
  updateTagUI(savedTag);
}

function onSongChange(tags, onTagClick) {
  const info = getCurrentSongInfo();
  const songId = getSongId(info);
  if (songId !== lastSongId) {
    lastSongId = songId;
    addTagButtons(tags, onTagClick, getCurrentSongInfo);
  }
}

const tags = ['Urban', 'Nature', 'Dreamcore', 'Glide', 'Ambient', 'Rare'];
addTagButtons(tags, tag => {
  console.log('Tag clicked & saved:', tag);
}, getCurrentSongInfo);

let lastSongId = null;
setInterval(() => onSongChange(tags, () => {}), 2000);

document.addEventListener('keydown', e => {
  if (!document.getElementById('urban-hallucination-hud')) return;
  const num = parseInt(e.key);
  if (num >= 1 && num <= tags.length) {
    const tagBtn = Array.from(
      document.getElementById('hud-tag-buttons').children
    )[num - 1];
    if (tagBtn) tagBtn.click();
  }
});
