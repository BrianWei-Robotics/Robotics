import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, collection, doc, onSnapshot, deleteDoc, setDoc, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Your provided GalacTech Staging Config
const firebaseConfig = {
  apiKey: "AIzaSyC-v5L9sTxLQ6C2cJH71B-bm2oM4zWW9Z8",
  authDomain: "team4926-staging.firebaseapp.com",
  projectId: "team4926-staging",
  storageBucket: "team4926-staging.firebasestorage.app",
  messagingSenderId: "438592050863",
  appId: "1:438592050863:web:74c1c6e656862d3028665a",
  measurementId: "G-6RFM5Y81PF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allTeamData = [];
let allLogs = [];

// DOM Elements
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const statsBanner = document.getElementById('statsBanner');
const modal = document.getElementById('detailsModal');
const modalData = document.getElementById('modalData');
const logsModal = document.getElementById('logsModal');
const logsContainer = document.getElementById('logsContainer');

// ==========================================
// 1. REAL-TIME DATA FETCHING
// ==========================================
onSnapshot(collection(db, "pit_scouting"), (snapshot) => {
    allTeamData = [];
    snapshot.forEach((doc) => allTeamData.push(doc.data()));
    allTeamData.sort((a, b) => parseInt(a.teamNumber) - parseInt(b.teamNumber));
    updateDashboard();
});

// We need the document ID for the logs so we can delete them
onSnapshot(collection(db, "action_history"), (snapshot) => {
    allLogs = [];
    snapshot.forEach((doc) => {
        allLogs.push({ id: doc.id, ...doc.data() });
    });
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 
    renderLogs();
});

// ==========================================
// 2. LOGGING HELPER FUNCTIONS
// ==========================================
async function logAction(actionType, targetTeam, details) {
    try {
        await addDoc(collection(db, "action_history"), {
            timestamp: new Date().toISOString(),
            action: actionType,
            team: targetTeam,
            details: details,
            user: "Lead Scout" 
        });
    } catch (e) {
        console.error("Failed to write to action log: ", e);
    }
}

// Delete a single log entry
window.deleteLog = async function(logId) {
    try {
        await deleteDoc(doc(db, "action_history", logId));
    } catch (e) {
        console.error("Failed to delete log: ", e);
    }
}

// Delete ALL logs
document.getElementById('clearAllLogsBtn').addEventListener('click', async function() {
    if (confirm("WARNING: This will permanently wipe the entire audit trail. Are you sure?")) {
        try {
            const querySnapshot = await getDocs(collection(db, "action_history"));
            querySnapshot.forEach(async (document) => {
                await deleteDoc(doc(db, "action_history", document.id));
            });
            alert("Action history wiped.");
        } catch (e) {
            console.error("Failed to clear logs: ", e);
        }
    }
});

// ==========================================
// 3. TABLE RENDER & SEARCH
// ==========================================
function updateDashboard() {
    const searchTerm = searchInput.value.toLowerCase();
    statsBanner.innerText = `Total Teams Logged: ${allTeamData.length}`;
    tableBody.innerHTML = '';

    allTeamData.forEach((team) => {
        const matchNumber = team.teamNumber && team.teamNumber.toString().includes(searchTerm);
        const matchName = team.teamName && team.teamName.toLowerCase().includes(searchTerm);
        
        if (matchNumber || matchName || searchTerm === '') {
            const tr = document.createElement('tr');
            const autoStr = team.hasAuto ? '<span class="bool-yes">YES</span>' : '<span class="bool-no">NO</span>';
            const climbStr = team.canClimb ? '<span class="bool-yes">YES</span>' : '<span class="bool-no">NO</span>';

            tr.innerHTML = `
                <td><strong>${team.teamNumber || 'N/A'}</strong></td>
                <td>${team.teamName || '-'}</td>
                <td>${team.drivetrain || '-'}</td>
                <td>${autoStr}</td>
                <td>${climbStr}</td>
                <td>${team.scoutName || '-'}</td>
                <td class="action-btns">
                    <button class="btn-view" onclick="openViewModal('${team.teamNumber}')">View</button>
                    <button class="btn-edit" onclick="openEditModal('${team.teamNumber}')">Edit</button>
                    <button class="btn-delete" onclick="deleteTeam('${team.teamNumber}')">Del</button>
                </td>
            `;
            tableBody.appendChild(tr);
        }
    });
}
searchInput.addEventListener('input', updateDashboard);

// ==========================================
// 4. DELETE & EDIT TEAM LOGIC
// ==========================================
window.deleteTeam = async function(teamNumber) {
    if (confirm(`CRITICAL WARNING: Are you sure you want to permanently delete data for Team ${teamNumber}?`)) {
        try {
            await deleteDoc(doc(db, "pit_scouting", teamNumber.toString()));
            logAction("DELETE", teamNumber, `Data record purged from database.`);
        } catch (error) {
            alert("Error deleting team.");
            console.error(error);
        }
    }
}

window.openEditModal = function(teamNumber) {
    const team = allTeamData.find(t => t.teamNumber == teamNumber);
    if(!team) return;

    modalData.innerHTML = `
        <div class="modal-header">
            <h2>Edit Team ${team.teamNumber}: ${team.teamName}</h2>
        </div>
        <form id="editForm">
            <div class="data-grid">
                <div class="data-item"><span class="data-label">Drivetrain</span>
                    <input type="text" id="editDrive" class="edit-input" value="${team.drivetrain || ''}">
                </div>
                <div class="data-item"><span class="data-label">Weight (lbs)</span>
                    <input type="number" id="editWeight" class="edit-input" value="${team.weight || ''}">
                </div>
                <div class="data-item"><span class="data-label">Dimensions</span>
                    <input type="text" id="editDim" class="edit-input" value="${team.dimensions || ''}">
                </div>
                <div class="data-item"><span class="data-label">Auto Notes</span>
                    <input type="text" id="editAuto" class="edit-input" value="${team.autoNotes || ''}">
                </div>
                <div class="data-item full-width"><span class="data-label">Notes / Weaknesses</span>
                    <textarea id="editNotes" class="edit-input" style="height:80px;">${team.notes || ''}</textarea>
                </div>
            </div>
            <button type="submit" class="btn-save-edit">Save Overwrite</button>
        </form>
    `;
    
    document.getElementById('editForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const updatedData = {
            drivetrain: document.getElementById('editDrive').value,
            weight: document.getElementById('editWeight').value,
            dimensions: document.getElementById('editDim').value,
            autoNotes: document.getElementById('editAuto').value,
            notes: document.getElementById('editNotes').value,
        };

        try {
            await setDoc(doc(db, "pit_scouting", teamNumber.toString()), updatedData, { merge: true });
            logAction("EDIT", teamNumber, `Updated specifications or notes.`);
            modal.style.display = "none";
        } catch (error) {
            console.error("Error updating: ", error);
            alert("Failed to overwrite data.");
        }
    });

    modal.style.display = "flex";
}

// ==========================================
// 5. VIEW MODAL & LOG RENDERER
// ==========================================
window.openViewModal = function(teamNumber) {
    const team = allTeamData.find(t => t.teamNumber == teamNumber);
    if(!team) return;
    
    const dateObj = new Date(team.timestamp);
    const timeString = isNaN(dateObj) ? "Unknown Time" : dateObj.toLocaleString();

    modalData.innerHTML = `
        <div class="modal-header">
            <h2>Team ${team.teamNumber}: ${team.teamName || 'Unknown Name'}</h2>
            <p style="color: var(--text-muted); font-size: 0.8rem;">Logged by ${team.scoutName} | ${timeString}</p>
        </div>
        <div class="data-grid">
            <div class="data-item">
                <span class="data-label">Drivetrain</span>
                <span class="data-value">${team.drivetrain || '-'}</span>
            </div>
            <div class="data-item">
                <span class="data-label">Weight & Dimensions</span>
                <span class="data-value">${team.weight || '-'} lbs | ${team.dimensions || '-'}</span>
            </div>
            <div class="data-item">
                <span class="data-label">Has Auto?</span>
                <span class="data-value">${team.hasAuto ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div class="data-item">
                <span class="data-label">Auto Path Notes</span>
                <span class="data-value">${team.autoNotes || 'None'}</span>
            </div>
            <div class="data-item">
                <span class="data-label">Can Climb?</span>
                <span class="data-value">${team.canClimb ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div class="data-item">
                <span class="data-label">Scoring Preference</span>
                <span class="data-value">${team.scoringPref || '-'}</span>
            </div>
            <div class="data-item full-width">
                <span class="data-label">General Impressions / Notes</span>
                <span class="data-value" style="font-style: italic;">${team.notes || 'No notes provided.'}</span>
            </div>
        </div>
    `;
    modal.style.display = "flex";
}

function renderLogs() {
    if (allLogs.length === 0) {
        logsContainer.innerHTML = "<p style='color:#888;'>No actions logged yet.</p>";
        return;
    }

    logsContainer.innerHTML = allLogs.map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        const colorClass = `action-${log.action}`;
        return `
            <div class="log-entry">
                <span class="btn-del-log" onclick="deleteLog('${log.id}')" title="Delete this entry">&times;</span>
                <span class="log-time">[${time}]</span> 
                <span class="log-action ${colorClass}">${log.action}</span> 
                <span style="color:#fff;">Team ${log.team}</span> 
                <br>> <span style="color:#aaa;">${log.details}</span>
            </div>
        `;
    }).join('');
}

// ==========================================
// 6. EVENT LISTENERS
// ==========================================
document.getElementById('closeModal').onclick = () => modal.style.display = "none";
document.getElementById('closeLogsModal').onclick = () => logsModal.style.display = "none";
document.getElementById('viewLogsBtn').onclick = () => logsModal.style.display = "flex";

window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
    if (event.target == logsModal) logsModal.style.display = "none";
}

// CSV Export
document.getElementById('exportBtn').addEventListener('click', function() {
    if (allTeamData.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = ["teamNumber", "teamName", "scoutName", "timestamp", "drivetrain", "weight", "dimensions", "hasAuto", "autoNotes", "canClimb", "scoringPref", "notes"];
    
    const csvRows = [];
    csvRows.push(headers.join(',')); 

    for (const row of allTeamData) {
        const values = headers.map(header => {
            const val = row[header] === undefined ? "" : row[header];
            const escaped = ('' + val).replace(/"/g, '\\"');
            return `"${escaped}"`; 
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `GalacTech_Master_Telemetry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});