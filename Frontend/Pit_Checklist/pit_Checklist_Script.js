// ==========================================
// CUSTOMIZE YOUR FRC CHECKLIST HERE
// ==========================================
const checklistData = [
  {
    category: "Pre-Match (Pit)",
    items: [
      "Fresh battery installed and strapped down securely",
      "Bumpers attached properly and correct color (Red/Blue)",
      "Pneumatics pressurized to 120 PSI",
      "All main structural bolts and mechanisms checked",
      "Driver Station laptop charged and connected",
      "Robot code deployed and confirmed",
      "Radio connections secure"
    ]
  },
  {
    category: "On the Field (Queue)",
    items: [
      "Turn on robot, wait for radio light to go solid",
      "Connect Driver Station to field management system",
      "Select the correct autonomous routine",
      "Check driver station for errors or warnings",
      "Verify camera streams are working"
    ]
  },
  {
    category: "Post-Match",
    items: [
      "Turn off robot main breaker",
      "Remove robot from field safely",
      "Swap out battery immediately upon returning to pit",
      "Inspect robot for mechanical damage or loose parts",
      "Discuss match performance with drive team"
    ]
  }
];

// Get references to HTML elements
const container = document.getElementById('checklist-container');
const clearBtn = document.getElementById('clearAllBtn');
const homeBtn = document.getElementById('homeBtn');

// Load saved data from localStorage (browser memory)
let savedChecks = JSON.parse(localStorage.getItem('frc-checklist')) || {};

// Function to save current state to browser memory
function saveProgress() {
  localStorage.setItem('frc-checklist', JSON.stringify(savedChecks));
  updateCategoryProgress();
}

// Function to update the "X / Y" progress fraction in headers
function updateCategoryProgress() {
  checklistData.forEach((section, catIndex) => {
    let checkedCount = 0;
    section.items.forEach((item, itemIndex) => {
      if (savedChecks[`${catIndex}-${itemIndex}`]) checkedCount++;
    });
    const progressEl = document.getElementById(`progress-${catIndex}`);
    if (progressEl) {
      progressEl.textContent = `${checkedCount} / ${section.items.length}`;
    }
  });
}

// Function to generate the HTML for the checklist based on data
function renderChecklist() {
  container.innerHTML = '';
  
  checklistData.forEach((section, catIndex) => {
    // Create section container
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';

    // Create Title
    const title = document.createElement('h2');
    title.innerHTML = `${section.category} <span class="progress" id="progress-${catIndex}"></span>`;
    categoryDiv.appendChild(title);

    // Create individual checklist items
    section.items.forEach((item, itemIndex) => {
      const itemDiv = document.createElement('div');
      const isChecked = savedChecks[`${catIndex}-${itemIndex}`] || false;
      itemDiv.className = `checklist-item ${isChecked ? 'checked' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'custom-checkbox';
      checkbox.id = `check-${catIndex}-${itemIndex}`;
      checkbox.checked = isChecked;

      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.className = 'item-text';
      label.textContent = item;

      // Handle clicking/toggling a checkbox
      checkbox.addEventListener('change', (e) => {
        savedChecks[`${catIndex}-${itemIndex}`] = e.target.checked;
        if (e.target.checked) {
          itemDiv.classList.add('checked');
        } else {
          itemDiv.classList.remove('checked');
        }
        saveProgress();
      });

      itemDiv.appendChild(checkbox);
      itemDiv.appendChild(label);
      categoryDiv.appendChild(itemDiv);
    });

    container.appendChild(categoryDiv);
  });

  updateCategoryProgress();
}

// Event Listener for the Home Button
homeBtn.addEventListener('click', () => {
  // If you have a specific home page, put the URL here. 
  // Examples: 'index.html', '/', 'https://yourteamwebsite.com'
  window.location.href = '/Frontend/Index.html'; 
});

// Event Listener for the Clear All Button
clearBtn.addEventListener('click', () => {
  if(confirm("Are you sure you want to clear all checkboxes?")) {
    savedChecks = {};
    saveProgress();
    renderChecklist();
  }
});

// Initial render when the page loads
renderChecklist();