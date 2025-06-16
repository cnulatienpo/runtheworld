// Content script for step overlay
// Connects to local WebSocket server and displays step count.

(function() {
  // Create floating HUD div
  const hud = document.createElement('div');
  hud.id = 'step-count';
  hud.style.position = 'fixed';
  hud.style.bottom = '20px';
  hud.style.left = '20px';
  hud.style.background = 'rgba(0,0,0,0.5)';
  hud.style.color = '#fff';
  hud.style.padding = '8px 12px';
  hud.style.borderRadius = '8px';
  hud.style.zIndex = '9999';
  hud.textContent = 'Steps: 0';
  document.body.appendChild(hud);

  let stepCount = 0;
  let socket;

  // Update the HUD text
  function updateStepCount(count) {
    stepCount = count;
    hud.style.background = 'rgba(0,0,0,0.5)';
    hud.style.color = '#fff';
    hud.textContent = `Steps: ${count}`;
  }

  // Display error state
  function showDisconnected() {
    hud.textContent = 'Disconnected from wearable';
    hud.style.background = 'rgba(100,0,0,0.7)';
  }

  // Open WebSocket connection to local server
  function connect() {
    socket = new WebSocket('ws://localhost:6789');

    socket.onopen = () => {
      console.log('[StepClient] Connected to server');
    };

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.steps === 'number') {
          updateStepCount(data.steps);
          // Optional: spawn images on each step here
          spawnStepImage();
        }
      } catch (err) {
        console.error('[StepClient] Error parsing message', err);
      }
    };

    socket.onerror = err => {
      console.error('[StepClient] WebSocket error', err);
      showDisconnected();
    };

    socket.onclose = () => {
      console.warn('[StepClient] WebSocket closed');
      showDisconnected();
      // Try reconnecting every 3 seconds
      setTimeout(connect, 3000);
    };
  }

  // ----- Optional image spawning on step events -----
  const images = [];
  const MAX_IMAGES = 10;
  function spawnStepImage() {
    // Replace with real assets if available
    const imgSrc = chrome.runtime?.getURL?.('assets/step.png');
    if (!imgSrc) return;
    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.position = 'fixed';
    img.style.zIndex = '9998';
    img.style.pointerEvents = 'none';
    const areaHeight = window.innerHeight / 2;
    img.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
    img.style.top = `${areaHeight + Math.random() * areaHeight}px`;
    document.body.appendChild(img);
    images.push(img);
    if (images.length > MAX_IMAGES) {
      const old = images.shift();
      old.remove();
    }
    // Remove after 5s
    setTimeout(() => img.remove(), 5000);
  }

  connect();
})();
