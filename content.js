// Load effect packs and integrate with HUD
let effectPacks = {};
let effectPackList = [];
let currentEffectPack = localStorage.getItem('currentEffectPack') || '';

async function loadEffectPacks() {
  const packNames = ['cyberpunk', 'dreamcore', 'industrial'];
  for (let name of packNames) {
    try {
      const resp = await fetch(`effect-packs/${name}.json`);
      if (resp.ok) {
        const pack = await resp.json();
        effectPacks[pack.name] = pack;
        effectPackList.push(pack.name);
      }
    } catch (err) {
      console.error('Failed to load pack', name, err);
    }
  }

  if (!currentEffectPack || !effectPacks[currentEffectPack]) {
    currentEffectPack = effectPackList[Math.floor(Math.random() * effectPackList.length)];
    localStorage.setItem('currentEffectPack', currentEffectPack);
  }

  populatePackDropdown();
  updateEffectPackHUD(currentEffectPack);
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

function populatePackDropdown() {
  const sel = document.getElementById('uh-hud-pack');
  sel.innerHTML = '';
  effectPackList.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
  sel.value = currentEffectPack;
}

function updateEffectPackHUD(packName) {
  const label = document.getElementById('uh-hud-pack-label');
  if (label) label.textContent = packName;
  const sel = document.getElementById('uh-hud-pack');
  if (sel) sel.value = packName;
  window.currentEffectPack = packName;
}

function handlePackChange(e) {
  currentEffectPack = e.target.value;
  localStorage.setItem('currentEffectPack', currentEffectPack);
  updateEffectPackHUD(currentEffectPack);
  if (window.__uhHUDPackCB) window.__uhHUDPackCB(currentEffectPack);
}

// Wait for HUD panel then append dropdown and load packs
window.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('uh-hud-panel');
  if (panel) {
    panel.appendChild(packDiv);
    document.getElementById('uh-hud-pack').onchange = handlePackChange;
    loadEffectPacks();
  }
});

// Example helper to get effects for current mood
function getEffectsForMood(mood) {
  const pack = effectPacks[currentEffectPack];
  if (pack && pack.moods[mood]) {
    return pack.moods[mood];
  }
  return [];
}
