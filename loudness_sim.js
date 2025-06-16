// Simulated Loudness Effect Trigger System

// Create floating HUD if not already present
const hud = document.createElement('div');
hud.style.position = 'fixed';
hud.style.bottom = '10px';
hud.style.left = '10px';
hud.style.background = 'rgba(0, 0, 0, 0.6)';
hud.style.color = 'white';
hud.style.fontFamily = 'monospace';
hud.style.padding = '8px 12px';
hud.style.borderRadius = '8px';
hud.style.zIndex = '99999';
document.body.appendChild(hud);

// Add loudness display
const loudnessDisplay = document.createElement('div');
hud.appendChild(loudnessDisplay);

// Simulated loudness generator
function getSimulatedLoudness() {
  return Math.random(); // 0.0 to 1.0
}

// Trigger hallucination effect
function triggerLoudnessEffect() {
  if (typeof window.audioTriggersEnabled !== 'undefined' && !window.audioTriggersEnabled) {
    // Skip trigger if audio-driven effects are disabled
    return;
  }
  if (typeof window.triggerEffect === 'function') {
    window.triggerEffect();
  } else {
    console.log('🎆 LOUDNESS TRIGGERED: Effect activated!');
  }
}

// Check loudness every second
setInterval(() => {
  const loudness = getSimulatedLoudness();
  loudnessDisplay.innerText = `Loudness: ${loudness.toFixed(2)}`;

  if (loudness > 0.7) {
    console.log(`Loudness: ${loudness.toFixed(2)} → TRIGGER`);
    triggerLoudnessEffect();
  } else {
    console.log(`Loudness: ${loudness.toFixed(2)}`);
  }
}, 1000);
