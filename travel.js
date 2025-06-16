// === ROUTE TRACKER SYSTEM ===
// Placeholder travel routes – you’ll fill these in later
const travelRoutes = [
  {
    id: "placeholder-1",
    name: "Placeholder Route 1",
    stops: ["Start", "Middle", "End"],
    totalMiles: 1000
  },
  {
    id: "placeholder-2",
    name: "Placeholder Route 2",
    stops: ["Alpha", "Beta", "Gamma"],
    totalMiles: 750
  },
  {
    id: "placeholder-3",
    name: "Placeholder Route 3",
    stops: ["Zone A", "Zone B", "Zone C"],
    totalMiles: 500
  }
];

// Setup state
let selectedRouteId = localStorage.getItem("selectedRouteId") || travelRoutes[0].id;
let milesTraveled = parseFloat(localStorage.getItem("milesTraveled")) || 0;

// Create dropdown UI
const routeSelector = document.createElement("select");
routeSelector.id = "route-selector";
travelRoutes.forEach(route => {
  const option = document.createElement("option");
  option.value = route.id;
  option.textContent = route.name;
  if (route.id === selectedRouteId) option.selected = true;
  routeSelector.appendChild(option);
});
routeSelector.addEventListener("change", () => {
  selectedRouteId = routeSelector.value;
  milesTraveled = 0;
  localStorage.setItem("selectedRouteId", selectedRouteId);
  localStorage.setItem("milesTraveled", "0");
  updateRouteDisplay();
});
document.body.appendChild(routeSelector);

// Display progress UI
const routeDisplay = document.createElement("div");
routeDisplay.id = "route-display";
routeDisplay.style.padding = "8px";
routeDisplay.style.fontFamily = "monospace";
document.body.appendChild(routeDisplay);

function updateRouteDisplay() {
  const route = travelRoutes.find(r => r.id === selectedRouteId);
  if (!route) return;
  const progress = `${milesTraveled.toFixed(1)} / ${route.totalMiles} mi`;
  routeDisplay.textContent = `Route: ${route.name}\nProgress: ${progress}`;
}

// Function to update mileage
function logRun(milesThisSession) {
  milesTraveled += milesThisSession;
  localStorage.setItem("milesTraveled", milesTraveled.toFixed(2));
  updateRouteDisplay();
}

// Initialize display on load
updateRouteDisplay();

// Example usage:
// logRun(2.5); // Call this after each run to update mileage
