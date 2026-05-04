// --- 1. Toggle Sidebar Logic ---
const toggleBtn = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// --- 2. Toggle Dropdown Logic ---
const roleBtn = document.getElementById('role-btn');
const roleMenu = document.getElementById('role-menu');

roleBtn.addEventListener('click', () => {
    roleMenu.classList.toggle('show');
    roleBtn.classList.toggle('active');
});

// --- 3. Handle Role Selection & Permissions ---
const roleOptions = document.querySelectorAll('.role-option');
const roleDisplay = document.getElementById('current-role-display');
const whiteboardLink = document.getElementById('whiteboard-link');
const batteryLink = document.getElementById('battery-link');
const pitChecklistLink = document.getElementById('pit_checklist-link');
const autonDrawLink = document.getElementById('auton_draw-link');
const strategyLink = document.getElementById('strategy-link');
const pitScoutLink = document.getElementById('pit_scout-link');

function applyRole(selectedRole) {
    if (!selectedRole) return;
    
    roleDisplay.textContent = selectedRole;
    
    // Logic: Who gets to see the whiteboard?
    if (selectedRole === 'Pit Crew' || selectedRole === 'Drive Team') {
        whiteboardLink.style.display = 'block'; // Show it
        pitChecklistLink.style.display = 'block'; // Show it
        autonDrawLink.style.display = 'block'; // Show it
        batteryLink.style.display = 'block'; // Show it
        strategyLink.style.display = 'block'; // Show it
    } else {
        whiteboardLink.style.display = 'none';  // Hide it
        pitChecklistLink.style.display = 'none';  // Hide it
        autonDrawLink.style.display = 'none';  // Hide it
        batteryLink.style.display = 'none';  // Hide it
        strategyLink.style.display = 'none';  // Hide it
    }
    if (selectedRole === 'Pit Scout' || selectedRole === 'Lead Scout') {
        pitScoutLink.style.display = 'block'; // Show it
    } else {
        pitScoutLink.style.display = 'none';  // Hide it
    }
}

// Load saved role on startup
const savedRole = localStorage.getItem('frc-role');
if (savedRole) {
    applyRole(savedRole);
}

roleOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const selectedRole = e.target.getAttribute('data-role');
        
        // Save the role to local storage and apply it
        localStorage.setItem('frc-role', selectedRole);
        applyRole(selectedRole);

        roleMenu.classList.remove('show');
        roleBtn.classList.remove('active');
    });
});