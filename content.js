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
