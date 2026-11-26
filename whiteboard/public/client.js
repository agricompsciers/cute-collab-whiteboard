const canvas = document.getElementById('board');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

let drawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'draw';
let currentStroke = null;
let strokes = [];

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && key === "z") {
        e.preventDefault();
        strokes.pop();
        redraw();
        return
    }

    if (e.ctrlKey || e.metaKey) return;
    if (key === 'd') currentTool = 'draw';
    if (key === 'h') currentTool = 'heartStamp';
});

//drawing and editing
function drawLine(x0, y0, x1, y1) {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
}

function heartStampTool(x, y) {
    ctx.font = '64px serif';
    ctx.fillText("🩷", x, y);
}

function endStroke() {
    if (!drawing) return;
    drawing = false;
    if (currentStroke && currentStroke.points.length > 1) {
        strokes.push(currentStroke);
    }
    currentStroke = null;
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
        if (stroke.type === 'draw') {
            for (let i = 1; i < stroke.points.length; i++) {
                const p0 = stroke.points[i - 1];
                const p1 = stroke.points[i];
                drawLine(p0.x, p0.y, p1.x, p1.y);
            }
        } else if (stroke.type === 'heartStamp') {
            heartStampTool(stroke.x, stroke.y);
        }
    }
}

//mouse events
canvas.addEventListener('mousedown', (e) => {
    const x= e.offsetX;
    const y = e.offsetY;
    if (currentTool === 'heartStamp') {
        heartStampTool(x, y);
        sendMessage({ type: 'heartStamp', x: e.offsetX, y: e.offsetY });
        strokes.push({ type: 'heartStamp', x, y });
        return;
    } else if (currentTool === 'draw') {
        lastX = x;
        lastY = y;
        drawing = true;
        currentStroke = { type: 'draw', points: [{ x, y }] };
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    drawLine(lastX, lastY, e.offsetX, e.offsetY);
    sendMessage({ type: 'draw', x0: lastX, y0: lastY, x1: e.offsetX, y1: e.offsetY });

    lastX = e.offsetX;
    lastY = e.offsetY;
    const point = { x: lastX, y: lastY };
    currentStroke.points.push(point);
});
canvas.addEventListener('mouseup', (e) => {
    endStroke();
});
canvas.addEventListener('mouseleave', () => {
    endStroke();
});

//web sockets
const socket = new WebSocket('ws://localhost:3000');

function sendMessage(msg) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(msg));
    }
}

socket.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
        case 'draw':
            drawLine(msg.x0, msg.y0, msg.x1, msg.y1);
            break;
        case 'heartStamp':
            heartStampTool(msg.x, msg.y);
            break;
    }
});

