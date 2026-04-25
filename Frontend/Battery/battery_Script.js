// State variables
let manualNextUpId = null;
let isEditMode = false;

// Mock telemetry data (Updated with dailyUses and competitionUses)
let batteryData = [
    { id: "That One", charge: 100, dischargeCycles: 45, lastRint: 12.4, avgRint: 12.1, dailyUses: 2, competitionUses: 14 },
    { id: "This One", charge: 85,  dischargeCycles: 12, lastRint: 11.2, avgRint: 11.0, dailyUses: 1, competitionUses: 5 },
    { id: "Which One", charge: 20,  dischargeCycles: 150, lastRint: 18.5, avgRint: 16.2, dailyUses: 4, competitionUses: 42 },
    { id: "Going & Going", charge: 60,  dischargeCycles: 88, lastRint: 14.1, avgRint: 13.8, dailyUses: 0, competitionUses: 21 },
    { id: "Saquon Sparkley", charge: 98,  dischargeCycles: 5,  lastRint: 10.5, avgRint: 10.6, dailyUses: 3, competitionUses: 8 },
    { id: "2025-05", charge: 42,  dischargeCycles: 210, lastRint: 22.1, avgRint: 20.4, dailyUses: 2, competitionUses: 56 }
];

function getChargeColor(level) {
    if (level >= 80) return 'var(--success)';
    if (level >= 30) return 'var(--warning)';
    return 'var(--danger)';
}

// Generates HTML for a battery card. Includes sorting index for edit mode.
function createBatteryCardHTML(battery, isNextUpCard = false, index = -1) {
    const color = getChargeColor(battery.charge);
    const isManual = isNextUpCard && manualNextUpId === battery.id;
    
    return `
        <div class="battery-card">
            <div class="battery-header">
                <h3>
                    ${battery.id} 
                    ${isManual ? '<span class="manual-badge">Manual Override</span>' : ''}
                </h3>
                <span style="color: ${color}; font-weight: bold;">${battery.charge}%</span>
            </div>
            
            <div class="battery-graphic">
                <div class="battery-level" style="width: ${battery.charge}%; background-color: ${color};"></div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item"><div class="stat-label">Last R-Int</div><div class="stat-value">${battery.lastRint} <span class="stat-unit">mΩ</span></div></div>
                <div class="stat-item"><div class="stat-label">Avg R-Int</div><div class="stat-value">${battery.avgRint} <span class="stat-unit">mΩ</span></div></div>
                <div class="stat-item"><div class="stat-label">Daily Uses</div><div class="stat-value">${battery.dailyUses}</div></div>
                <div class="stat-item"><div class="stat-label">Comp Uses</div><div class="stat-value">${battery.competitionUses}</div></div>
                <div class="stat-item"><div class="stat-label">Total Cycles</div><div class="stat-value">${battery.dischargeCycles}</div></div>
                <div class="stat-item">
                    <div class="stat-label">Health Status</div>
                    <div class="stat-value" style="color: ${battery.avgRint > 18 ? 'var(--danger)' : 'var(--success)'}">
                        ${battery.avgRint > 18 ? 'Degraded' : 'Good'}
                    </div>
                </div>
            </div>

            ${!isNextUpCard ? `
                <div class="card-buttons">
                    <button class="set-next-btn" onclick="setManualNextUp('${battery.id}')" ${manualNextUpId === battery.id ? 'disabled' : ''}>
                        ${manualNextUpId === battery.id ? 'Currently Next Up' : 'Set as Next Up'}
                    </button>
                    <div class="edit-controls">
                        <button class="move-btn" onclick="moveBattery(${index}, -1)" ${index === 0 ? 'disabled' : ''}>◀ Move Left</button>
                        <button class="move-btn" onclick="moveBattery(${index}, 1)" ${index === batteryData.length - 1 ? 'disabled' : ''}>Move Right ▶</button>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderDashboard() {
    // 1. Determine "Next Up"
    let nextUpBattery = null;

    if (manualNextUpId) {
        // Find the manually selected battery
        nextUpBattery = batteryData.find(b => b.id === manualNextUpId);
    } 
    
    if (!nextUpBattery) {
        // Fallback to auto-logic if manual is missing/invalid
        const readyBatteries = [...batteryData]
            .filter(b => b.charge >= 90)
            .sort((a, b) => {
                if (b.charge !== a.charge) return b.charge - a.charge;
                return a.lastRint - b.lastRint; 
            });
        nextUpBattery = readyBatteries.length > 0 ? readyBatteries[0] : null;
    }

    const nextUpContainer = document.getElementById('next-up-container');
    if (nextUpBattery) {
        nextUpContainer.innerHTML = createBatteryCardHTML(nextUpBattery, true);
    } else {
        nextUpContainer.innerHTML = `<div class="battery-card"><p>No batteries currently fully charged and ready.</p></div>`;
    }

    // 2. Render all batteries in the grid based on current array order
    const gridContainer = document.getElementById('battery-grid');
    gridContainer.innerHTML = batteryData.map((b, index) => createBatteryCardHTML(b, false, index)).join('');
    
    // Apply edit mode classes
    if (isEditMode) {
        gridContainer.classList.add('editing-mode');
    } else {
        gridContainer.classList.remove('editing-mode');
    }
}

// User Actions
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btn = document.getElementById('edit-order-btn');
    btn.innerHTML = isEditMode ? "✅ Done Editing" : "✏️ Edit Battery Order";
    btn.style.backgroundColor = isEditMode ? "var(--success)" : "transparent";
    btn.style.color = isEditMode ? "#000" : "var(--text-primary)";
    renderDashboard();
}

function setManualNextUp(id) {
    // Toggle off if they click the one that's already selected
    if (manualNextUpId === id) {
        manualNextUpId = null;
    } else {
        manualNextUpId = id;
    }
    renderDashboard();
}

function moveBattery(index, direction) {
    if (direction === -1 && index > 0) {
        // Swap with previous
        [batteryData[index - 1], batteryData[index]] = [batteryData[index], batteryData[index - 1]];
    } else if (direction === 1 && index < batteryData.length - 1) {
        // Swap with next
        [batteryData[index + 1], batteryData[index]] = [batteryData[index], batteryData[index + 1]];
    }
    renderDashboard();
}

function goHome() {
    alert("Navigating back to main system dashboard...");
}

// Run on load
document.addEventListener('DOMContentLoaded', renderDashboard);