import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, doc, setDoc, collection, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// TODO: Replace with your Firebase Config
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

// UI Elements
const statusBanner = document.getElementById('networkStatus');
const statsBanner = document.getElementById('statsBanner');
let cloudCount = 0;
let localCount = 0;

// ==========================================
// 1. LOCAL DATABASE SETUP (IndexedDB)
// ==========================================
let localDB;
const dbName = "GalacTechScouting";
const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    // Create a local table (objectStore) using teamNumber as the primary key
    if (!db.objectStoreNames.contains("teams")) {
        db.createObjectStore("teams", { keyPath: "teamNumber" });
    }
};

request.onsuccess = function(event) {
    localDB = event.target.result;
    updateUI();
    attemptSync(); // Try to sync immediately on load
};

request.onerror = function(event) {
    console.error("IndexedDB Error:", event.target.error);
};

// ==========================================
// 2. FORM SUBMISSION (Save Locally First)
// ==========================================
document.getElementById('scoutForm').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const teamNum = document.getElementById('teamNumber').value;
    
    // Package the data, adding a 'syncStatus' flag
    const teamData = {
        teamNumber: teamNum,
        timestamp: new Date().toISOString(),
        teamName: document.getElementById('teamName').value,
        scoutName: document.getElementById('scoutName').value,
        drivetrain: document.getElementById('drivetrain').value,
        weight: document.getElementById('weight').value,
        dimensions: document.getElementById('dimensions').value,
        hasAuto: document.getElementById('hasAuto').checked,
        autoNotes: document.getElementById('autoNotes').value,
        canClimb: document.getElementById('canClimb').checked,
        scoringPref: document.getElementById('scoringPref').value,
        notes: document.getElementById('notes').value.replace(/(\r\n|\n|\r)/gm, " "),
        syncStatus: "pending" // Indicates it needs to go to the cloud
    };

    // Save to Local Database
    const transaction = localDB.transaction(["teams"], "readwrite");
    const store = transaction.objectStore("teams");
    store.put(teamData);

    transaction.oncomplete = function() {
        document.getElementById('scoutForm').reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // As soon as local save finishes, try to push to cloud
        attemptSync(); 
    };
});

// ==========================================
// 3. SYNCHRONIZATION LOGIC
// ==========================================
async function attemptSync() {
    updateUI(); // Check connection status

    if (!navigator.onLine) return; // Stop if offline

    // If online, grab all data from local DB
    const transaction = localDB.transaction(["teams"], "readonly");
    const store = transaction.objectStore("teams");
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = async function() {
        const allLocalData = getAllRequest.result;
        
        // Filter out teams that haven't been synced yet
        const pendingData = allLocalData.filter(team => team.syncStatus === "pending");
        
        if (pendingData.length > 0) {
            statusBanner.className = "status-banner syncing";
            statusBanner.innerText = "🔄 Transmitting to Cloud...";
        }

        // Loop through pending data and send to Firebase
        for (const team of pendingData) {
            try {
                // Copy the object and remove the syncStatus flag before sending to cloud
                const cloudData = { ...team };
                delete cloudData.syncStatus;

                // Push to Firebase
                await setDoc(doc(db, "pit_scouting", team.teamNumber), cloudData);

                // If successful, mark as synced in Local DB
                team.syncStatus = "synced";
                const updateTx = localDB.transaction(["teams"], "readwrite");
                updateTx.objectStore("teams").put(team);

            } catch (error) {
                console.error(`Failed to sync Team ${team.teamNumber}:`, error);
            }
        }
        
        updateUI(); // Refresh counts and colors
    };
}

// ==========================================
// 4. EVENT LISTENERS & UI UPDATES
// ==========================================

// Listen for connection changes natively in the browser
window.addEventListener('online', attemptSync);
window.addEventListener('offline', updateUI);

// Listen to Firebase for real-time cloud counts
onSnapshot(collection(db, "pit_scouting"), (snapshot) => {
    cloudCount = snapshot.size;
    updateUI();
});

function updateUI() {
    if (!localDB) return;

    // Count local items
    const tx = localDB.transaction(["teams"], "readonly");
    const request = tx.objectStore("teams").getAll();
    
    request.onsuccess = function() {
        const allData = request.result;
        localCount = allData.length;
        const pendingCount = allData.filter(t => t.syncStatus === "pending").length;

        statsBanner.innerText = `Cloud DB: ${cloudCount} | Local DB: ${localCount} | Unsynced: ${pendingCount}`;

        // Update Network Banner
        if (navigator.onLine) {
            if (pendingCount === 0) {
                statusBanner.className = "status-banner online";
                statusBanner.innerText = "🟢 Online | All Data Synced";
            } else {
                statusBanner.className = "status-banner syncing";
                statusBanner.innerText = `🔄 Online | Syncing ${pendingCount} teams...`;
            }
        } else {
            statusBanner.className = "status-banner offline";
            statusBanner.innerText = `🔴 Offline | ${pendingCount} teams stored locally`;
        }
    };
}