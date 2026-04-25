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

roleOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const selectedRole = e.target.getAttribute('data-role');
        roleDisplay.textContent = selectedRole;
        
        // Logic: Who gets to see the whiteboard?
        if (selectedRole === 'Pit Crew' || selectedRole === 'Drive Team') {
            whiteboardLink.style.display = 'block'; // Show it
            pitChecklistLink.style.display = 'block'; // Show it
        } else {
            whiteboardLink.style.display = 'none';  // Hide it
            pitChecklistLink.style.display = 'none';  // Hide it
        }
        // Logic: Who gets to see the battery status?
        if (selectedRole === 'Pit Crew') {
            batteryLink.style.display = 'block'; // Show it
        } else {
            batteryLink.style.display = 'none';  // Hide it
        }

        roleMenu.classList.remove('show');
        roleBtn.classList.remove('active');
    });
});