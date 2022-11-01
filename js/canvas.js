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

    ctx.fillStyle = "red";
    ctx.fillRect(-50, -50, 100, 100);

    requestAnimationFrame(draw);
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