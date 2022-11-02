// Adapted from https://codepen.io/chengarda/pen/wRxoyB

let cameraOffset = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
let cameraZoom = 1;

function draw() {
    CANVAS_WIDTH = document.body.clientWidth;
    CANVAS_HEIGHT = document.body.clientHeight;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(cameraZoom, cameraZoom);
    ctx.translate(-CANVAS_WIDTH / 2 + cameraOffset.x, -CANVAS_HEIGHT / 2 + cameraOffset.y);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    tree.forEach((row, depth) => {
        row.forEach(tuple => {
            drawShape(Shapes.Rectangle, tuple[1], depth*(NODE_HEIGHT+NODE_VERTICAL_SPACING), NODE_WIDTH, NODE_HEIGHT);
            drawText(Shapes.Rectangle, tuple[1], depth*(NODE_HEIGHT+NODE_VERTICAL_SPACING), NODE_WIDTH, NODE_HEIGHT, tuple[0], "", "", "");
        });
    });

    requestAnimationFrame(draw);
}

function drawShape(shape, cx, cy, width, height) {
    let w2 = width / 2;
    let h2 = height / 2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    switch (shape) {

        case Shapes.Rectangle:
            ctx.strokeRect(cx - w2, cy - h2, width, height);
            break;

        case Shapes.Circle:
            ctx.beginPath();
            ctx.ellipse(cx, cy, w2, h2, 0, 0, 2 * Math.PI);
            ctx.stroke();
            break;

        case Shapes.Diamond:
            ctx.beginPath();
            ctx.moveTo(cx, cy - h2);
            ctx.lineTo(cx + w2, cy);
            ctx.lineTo(cx, cy + h2);
            ctx.lineTo(cx - w2, cy);
            ctx.closePath();
            ctx.stroke();
            break;

        default:
            // TBD
            break;
    }
}

function drawText(shape, cx, cy, cellWidth, cellHeight, firstname, lastname, dob, dod) {
    let maxWidth;
    let lineHeight;

    switch (shape) {
        case Shapes.Rectangle:
            maxWidth = cellWidth * 0.9;
            lineHeight = cellHeight / 4 * 0.9;
            break;
        case Shapes.Circle:
            // https://www.desmos.com/calculator/iqbkpxro2q
            // t = Math.atan(a/b*Math.tan(T))+pi*(Math.floor((T+pi/2)/Math.PI)%2)
            // Here, T = Math.PI / 4
            let t = Math.atan(cellWidth / cellHeight);
            maxWidth = cellWidth * Math.cos(t);
            lineHeight = cellHeight / 4 * Math.sin(t);
            break;
        case Shapes.Diamond:
            maxWidth = cellWidth / 2 * 0.9;
            lineHeight = cellHeight / 8 * 0.9;
            break;
    }

    ctx.textAlign = "center";
    lastname = lastname.toUpperCase();
    ctx.fillText(firstname, cx, cy - 1.5 * lineHeight, maxWidth);
    ctx.fillText(lastname, cx, cy - 0.5 * lineHeight, maxWidth);
    ctx.fillText(dob + " - " + dod, cx, cy + 1.5 * lineHeight, maxWidth);
}

function getEventLocation(event) {
    if (event.touches && event.touches.length == 1) {
        // Touch
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else if (event.clientX && event.clientY) {
        // Mouse
        return { x: event.clientX, y: event.clientY };
    }
}

let isDragging = false;
let dragStart = { x: 0, y: 0 };

function onPointerDown(event) {
    isDragging = true;
    dragStart.x = getEventLocation(event).x / cameraZoom - cameraOffset.x;
    dragStart.y = getEventLocation(event).y / cameraZoom - cameraOffset.y;
}

function onPointerMove(event) {
    if (!isDragging) return;
    cameraOffset.x = getEventLocation(event).x / cameraZoom - dragStart.x;
    cameraOffset.y = getEventLocation(event).y / cameraZoom - dragStart.y;
}

function onPointerUp(event) {
    isDragging = false;
    // Touch
    initialPinchDistance = null;
    lastZoom = cameraZoom;
}

function handleTouch(event, singleTouchHandler) {
    if (event.touches.length == 1) {
        singleTouchHandler(event);
    } else if (event.type == "touchmove" && event.touches.length == 2) {
        isDragging = false;
        handlePinch(event);
    }
}

let initialPinchDistance = null;
let lastZoom = cameraZoom;

function handlePinch(event) {
    event.preventDefault();

    let touch1 = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    let touch2 = { x: event.touches[1].clientX, y: event.touches[1].clientY };

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

    if (initialPinchDistance == null) {
        initialPinchDistance = currentDistance;
    }

    cameraZoom = lastZoom * currentDistance / initialPinchDistance;
    cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
    cameraZoom = Math.max(cameraZoom, MIN_ZOOM);
}

function adjustZoom(event) {
    if (isDragging) return;
    cameraZoom += event.deltaY * SCROLL_SENSITIVITY;
    cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
    cameraZoom = Math.max(cameraZoom, MIN_ZOOM);
}

canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('mouseup', onPointerUp);
canvas.addEventListener('touchstart', (event) => handleTouch(event, onPointerDown));
canvas.addEventListener('touchmove', (event) => handleTouch(event, onPointerMove));
canvas.addEventListener('touchend', (event) => handleTouch(event, onPointerUp));
canvas.addEventListener('wheel', adjustZoom);

draw();