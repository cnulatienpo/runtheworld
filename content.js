// Manage effect packs loaded from JSON files
let moodEffectMap = {};
let zoneEffectMap = {};
let effectPacks = {};
let currentEffectPack = localStorage.getItem('currentEffectPack') || 'cyberpunk';

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

// Startup when HUD exists
window.addEventListener('DOMContentLoaded', async () => {
  const panel = document.getElementById('uh-hud-panel');
  if (panel) {
    panel.appendChild(packDiv);
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
