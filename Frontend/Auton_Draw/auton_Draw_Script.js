// Get DOM elements
const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');
const toolBtns = document.querySelectorAll('.tool-btn');
const colorBtns = document.querySelectorAll('.color-btn');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const homeBtn = document.getElementById('homeBtn');

// App State
let currentTool = 'draw'; // 'draw' or 'waypoint'
let currentColor = '#ed1c24'; // default red
let isDrawing = false;
let actions = []; // Stores history for undo
let currentPath = null;

// Scale fixes for high-DPI screens and resizing
function resizeCanvas() {
  const container = canvas.parentElement;
  // Maintain a 2:1 ratio (standard FRC field rough aspect ratio)
  canvas.width = container.clientWidth;
  canvas.height = container.clientWidth / 2;
  redraw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call

// --- Event Listeners for UI ---

homeBtn.addEventListener('click', () => {
  window.location.href = '/Frontend/index.html'; 
});

toolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toolBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
  });
});

colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentColor = btn.dataset.color;
  });
});

undoBtn.addEventListener('click', () => {
  actions.pop(); // Remove the last action
  redraw();
});

clearBtn.addEventListener('click', () => {
  if (confirm("Clear the entire field?")) {
    actions = [];
    redraw();
  }
});

// --- Canvas Drawing Logic ---

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  // Calculate scaling in case CSS resizes the canvas
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  // Support both mouse and touch events
  let clientX = evt.clientX;
  let clientY = evt.clientY;
  if (evt.touches && evt.touches.length > 0) {
    clientX = evt.touches[0].clientX;
    clientY = evt.touches[0].clientY;
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function startAction(e) {
  e.preventDefault();
  const pos = getMousePos(e);

  if (currentTool === 'draw') {
    isDrawing = true;
    currentPath = {
      type: 'path',
      color: currentColor,
      points: [pos]
    };
    actions.push(currentPath);
  } else if (currentTool === 'waypoint') {
    actions.push({
      type: 'waypoint',
      color: currentColor,
      x: pos.x,
      y: pos.y
    });
    redraw();
  }
}

function moveAction(e) {
  e.preventDefault();
  if (!isDrawing || currentTool !== 'draw') return;
  
  const pos = getMousePos(e);
  currentPath.points.push(pos);
  redraw(); // Re-render everything to show the new line segment
}

function endAction(e) {
  e.preventDefault();
  isDrawing = false;
  currentPath = null;
}

// Attach Mouse Events
canvas.addEventListener('mousedown', startAction);
canvas.addEventListener('mousemove', moveAction);
canvas.addEventListener('mouseup', endAction);
canvas.addEventListener('mouseout', endAction);

// Attach Touch Events (for tablets/phones)
canvas.addEventListener('touchstart', startAction, {passive: false});
canvas.addEventListener('touchmove', moveAction, {passive: false});
canvas.addEventListener('touchend', endAction);

// --- Render Engine ---

function redraw() {
  // Clear canvas entirely (background is handled by CSS)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Re-draw all saved actions
  actions.forEach(action => {
    ctx.strokeStyle = action.color;
    ctx.fillStyle = action.color;

    if (action.type === 'path') {
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      for (let i = 0; i < action.points.length; i++) {
        const pt = action.points[i];
        if (i === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.stroke();
    } 
    else if (action.type === 'waypoint') {
      ctx.beginPath();
      ctx.arc(action.x, action.y, 8, 0, Math.PI * 2);
      ctx.fill();
      // Draw a little border around waypoints to make them pop
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  });
}