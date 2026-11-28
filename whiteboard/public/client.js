const canvas = document.getElementById('board');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const myID = makeId();

function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

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
        if (drawing) return;
        undoMine();
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
    if (currentStroke && currentStroke.points.length <= 1) {
        strokes = strokes.filter((s) => s !== currentStroke);
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

function undoMine() {
    const stroke = strokes.findLastIndex((s) => s.owner === myID);
    if (stroke === -1) return;
    const removedStroke = strokes.splice(stroke, 1)[0];
    redraw();
    sendMessage({ type: 'undo', id: removedStroke.id });
}

//mouse events
canvas.addEventListener('mousedown', (e) => {
    const x= e.offsetX;
    const y = e.offsetY;
    if (currentTool === 'heartStamp') {
        const heart = { type: 'heartStamp', id: makeId(), owner: myID, x, y };
        strokes.push(heart);
        heartStampTool(x, y);
        sendMessage(heart);
        return;
    } else if (currentTool === 'draw') {
        lastX = x;
        lastY = y;
        drawing = true;
        currentStroke = { type: 'draw', id: makeId(), owner: myID, points: [{ x, y }] };
        strokes.push(currentStroke);
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    drawLine(lastX, lastY, e.offsetX, e.offsetY);
    sendMessage({ type: 'draw', id: currentStroke.id, owner: myID, x0: lastX, y0: lastY, x1: e.offsetX, y1: e.offsetY });

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
            let stroke = strokes.find((s) => s.id === msg.id);
            if (!stroke) {
                stroke = { type: 'draw', id: msg.id, owner: msg.owner, points: [{ x: msg.x0, y: msg.y0 }] };
                strokes.push(stroke);
            }
            stroke.points.push({ x: msg.x1, y: msg.y1 });
            drawLine(msg.x0, msg.y0, msg.x1, msg.y1);
            break;
        case 'heartStamp':
            strokes.push({type: 'heartStamp', id: msg.id, owner: msg.owner, x: msg.x, y: msg.y});
            heartStampTool(msg.x, msg.y);
            break;
        case 'undo':
            strokes = strokes.filter((s) => s.id !== msg.id);
            redraw();
            break;
    }
});

