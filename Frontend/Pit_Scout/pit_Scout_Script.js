// --- Simulated Database ---
let mockDatabase = [
    { match: 12, team: 4926, auto: 15, teleop: 45, notes: "Fast cycles, solid climb." },
    { match: 14, team: 1024, auto: 5, teleop: 20, notes: "Played heavy defense." },
    { match: 18, team: 4926, auto: 18, teleop: 50, notes: "Flawless autonomous run." }
];

// --- 1. UI Elements & Toggle Logic ---
const toggleBtn = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

const roleBtn = document.getElementById('role-btn');
const roleMenu = document.getElementById('role-menu');

roleBtn.addEventListener('click', () => {
    roleMenu.classList.toggle('show');
    roleBtn.classList.toggle('active');
});

// --- 2. Navigation / Page Switching Logic ---
const navHome = document.getElementById('nav-home');
const navData = document.getElementById('nav-data');
const viewHome = document.getElementById('view-home');
const viewData = document.getElementById('view-data');

function switchView(viewToShow) {
    // Hide all views
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
    // Show the requested view
    viewToShow.classList.add('active');
}

navHome.addEventListener('click', (e) => {
    e.preventDefault();
    switchView(viewHome);
});

navData.addEventListener('click', (e) => {
    e.preventDefault();
    switchView(viewData);
    renderTable(); // Re-draw data every time we open the page
});


// --- 3. Role Permissions Logic ---
const roleOptions = document.querySelectorAll('.role-option');
const roleDisplay = document.getElementById('current-role-display');
const whiteboardLink = document.getElementById('whiteboard-link');
const dataLink = document.getElementById('data-link');

roleOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault(); 
        const selectedRole = e.target.getAttribute('data-role');
        roleDisplay.textContent = selectedRole;
        
        // Whiteboard Permissions
        if (selectedRole === 'Pit Crew' || selectedRole === 'Drive Team') {
            whiteboardLink.style.display = 'block'; 
        } else {
            whiteboardLink.style.display = 'none';  
        }

        // Data Entries Permissions
        if (selectedRole === 'Lead Scout' || selectedRole === 'Scout' || selectedRole === 'Drive Team') {
            dataLink.style.display = 'block';
        } else {
            dataLink.style.display = 'none';
            switchView(viewHome); // Kick them back to home if they lose access
        }
        
        roleMenu.classList.remove('show');
        roleBtn.classList.remove('active');
    });
});

// --- 4. Data Rendering & Deleting Logic ---
const dataBody = document.getElementById('data-body');
const btnClearData = document.getElementById('btn-clear-data');

function renderTable() {
    dataBody.innerHTML = ''; // Clear the current HTML table

    // If database is empty, show a message
    if (mockDatabase.length === 0) {
        dataBody.innerHTML = '<tr><td colspan="5" class="empty-state">No scouting data found in the system.</td></tr>';
        return;
    }

    // Loop through the database and build HTML rows
    mockDatabase.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.match}</td>
            <td class="highlight">${entry.team}</td>
            <td>${entry.auto}</td>
            <td>${entry.teleop}</td>
            <td>${entry.notes}</td>
        `;
        dataBody.appendChild(row);
    });
}

// Clear Data Button Event
btnClearData.addEventListener('click', () => {
    // Standard browser confirmation popup
    const isSure = confirm("Are you sure you want to delete all data? This cannot be undone.");
    
    if (isSure) {
        mockDatabase = []; // Empty the simulated database
        renderTable();     // Update the screen immediately
    }
});