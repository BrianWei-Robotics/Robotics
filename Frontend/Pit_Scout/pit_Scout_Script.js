// Array to hold our scouting data
let database = [];

// Load existing data from localStorage on startup
window.onload = function() {
    const savedData = localStorage.getItem('galactechScoutData');
    if (savedData) {
        database = JSON.parse(savedData);
        updateStats();
    }
};

// Handle form submission
document.getElementById('scoutForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload

    // Create an object with the current form data
    const teamData = {
        timestamp: new Date().toLocaleString(),
        teamNumber: document.getElementById('teamNumber').value,
        teamName: document.getElementById('teamName').value,
        scoutName: document.getElementById('scoutName').value,
        drivetrain: document.getElementById('drivetrain').value,
        weight: document.getElementById('weight').value,
        dimensions: document.getElementById('dimensions').value,
        hasAuto: document.getElementById('hasAuto').checked,
        autoNotes: document.getElementById('autoNotes').value,
        canClimb: document.getElementById('canClimb').checked,
        scoringPref: document.getElementById('scoringPref').value,
        notes: document.getElementById('notes').value.replace(/(\r\n|\n|\r)/gm, " ") // Remove line breaks for CSV
    };

    // Check if team already exists, update if true, otherwise push new
    const existingIndex = database.findIndex(t => t.teamNumber === teamData.teamNumber);
    if (existingIndex >= 0) {
        if(confirm(`Team ${teamData.teamNumber} already exists in the database. Overwrite?`)) {
            database[existingIndex] = teamData;
        } else {
            return; // Stop if user cancels overwrite
        }
    } else {
        database.push(teamData);
    }

    // Save to localStorage under a GalacTech specific key
    localStorage.setItem('galactechScoutData', JSON.stringify(database));
    
    // Update UI and reset form
    updateStats();
    document.getElementById('scoutForm').reset();
    alert(`Data for Team ${teamData.teamNumber} saved successfully!`);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Update the counter banner
function updateStats() {
    document.getElementById('statsBanner').innerText = `Teams Scouted: ${database.length}`;
}

// Export data to CSV and bind to export button
document.getElementById('exportBtn').addEventListener('click', function() {
    if (database.length === 0) {
        alert("No telemetry data available to export.");
        return;
    }

    // Get headers from the first object
    const headers = Object.keys(database[0]);
    
    // Map the data to CSV format
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add headers row

    for (const row of database) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"'); // escape quotes
            return `"${escaped}"`; // wrap in quotes to handle commas in text
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    
    // Create a downloadable link
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `GalacTech_PitScoutData_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});