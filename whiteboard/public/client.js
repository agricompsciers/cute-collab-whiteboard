const canvas = document.getElementById('board');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

let drawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'draw';

window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") {
        currentTool = 'heartStamp'
    } else if (e.key.toLowerCase() === "d") {
        currentTool = 'draw';
    }
});

//drawing and editing
function drawLine(x0, y0, x1, y1) {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
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

//mouse events
canvas.addEventListener('mousedown', (e) => {
    const x= e.offsetX;
    const y = e.offsetY;
    if (currentTool === 'heartStamp') {
        heartStampTool(x, y);
        sendMessage({ type: 'heartStamp', x: e.offsetX, y: e.offsetY });
        return;
    } else if (currentTool === 'draw') {
        lastX = x;
        lastY = y;
        drawing = true;
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    drawLine(lastX, lastY, e.offsetX, e.offsetY);
    sendMessage({ type: 'draw', x0: lastX, y0: lastY, x1: e.offsetX, y1: e.offsetY });

    lastX = e.offsetX;
    lastY = e.offsetY;
});
canvas.addEventListener('mouseup', (e) => {
    drawing = false;
});
canvas.addEventListener('mouseleave', () => {
    drawing = false
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

