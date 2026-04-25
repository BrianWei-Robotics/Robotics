const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

// Application State
let isDrawing = false;
let currentTool = 'brush'; // can be 'brush' or 'eraser'
let currentColor = '#000000';
let currentSize = 5;

// Initialize canvas sizing
function initCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Set default drawing styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// Run initial sizing setup
setTimeout(initCanvas, 0); 

// Mouse & Touch Event Handlers
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath(); // Reset the path so the next line doesn't connect
}

function draw(e) {
    if (!isDrawing) return;

    // Calculate accurate mouse/touch coordinates relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Apply current state settings
    ctx.lineWidth = currentSize;
    
    if (currentTool === 'eraser') {
        // We use destination-out to actually erase pixels, leaving the canvas transparent
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)"; 
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = currentColor;
    }

    // Draw the path
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Attach Event Listeners to Canvas
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing); // Stop if mouse leaves canvas

// Mobile Touch Support
canvas.addEventListener('touchstart', (e) => { 
    e.preventDefault(); // Prevent scrolling while drawing
    startDrawing(e); 
}, { passive: false });
canvas.addEventListener('touchmove', (e) => { 
    e.preventDefault(); 
    draw(e); 
}, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

// UI Event Listeners (Toolbar)
document.getElementById('btn-brush').addEventListener('click', () => {
    currentTool = 'brush';
    document.getElementById('btn-brush').classList.add('active');
    document.getElementById('btn-eraser').classList.remove('active');
});

document.getElementById('btn-eraser').addEventListener('click', () => {
    currentTool = 'eraser';
    document.getElementById('btn-eraser').classList.add('active');
    document.getElementById('btn-brush').classList.remove('active');
});

document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        currentColor = e.target.dataset.color;
        
        // Update visual active state
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
        
        // Automatically switch back to brush if a color is clicked while erasing
        if (currentTool === 'eraser') {
            document.getElementById('btn-brush').click();
        }
    });
});

document.getElementById('brush-size').addEventListener('input', (e) => {
    currentSize = e.target.value;
    document.getElementById('size-label').textContent = currentSize;
});

document.getElementById('btn-clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});