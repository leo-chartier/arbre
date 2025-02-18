// Adapted from https://codepen.io/chengarda/pen/wRxoyB

/**
 * A coordinate on the canvas.
 * @typedef {Object} Coordinates
 * @property {number} x - The X component
 * @property {number} y - The Y component
 */

/** The canvas. */
let canvas = document.getElementById("canvas");
/**
 * The position of the camera on the canvas.
 * @type {Coordinates}
 */
let cameraOffset = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
/** The zoom level of the camera. */
let cameraZoom = 1;
/** Whether the user is dragging the canvas. */
let isDragging = false;
/**
 * The initial coordinates where the user started dragging.
 * @type {Coordinates}
 */
let dragStart = { x: 0, y: 0 };
/**
 * The distance between fingers at the start of pinching.
 * @type {number?}
 */
let initialPinchDistance = null;
/** The initial zoom level. */
let lastZoom = cameraZoom;

/**
 * Get the location of an event.
 * @param {TouchEvent} event - The triggering event.
 * @returns {Coordinates} The coordinates where the even happened.
 */
function getEventLocation(event) {
  if (event.touches && event.touches.length == 1) {
    // Touch
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  } else if (event.clientX && event.clientY) {
    // Mouse
    return { x: event.clientX, y: event.clientY };
  }
}

/**
 * Set the initial drag location.
 * @param {TouchEvent|MouseEvent} event - The triggering event.
 */
function onPointerDown(event) {
  isDragging = true;
  dragStart.x = getEventLocation(event).x / cameraZoom - cameraOffset.x;
  dragStart.y = getEventLocation(event).y / cameraZoom - cameraOffset.y;
}

/**
 * Set the camera offset when moving.
 * @param {TouchEvent|MouseEvent} event - The triggering event.
 */
function onPointerMove(event) {
  if (!isDragging) return;
  cameraOffset.x = getEventLocation(event).x / cameraZoom - dragStart.x;
  cameraOffset.y = getEventLocation(event).y / cameraZoom - dragStart.y;

  requestAnimationFrame(draw);
}

/**
 * Stop dragging.
 * @param {TouchEvent|MouseEvent} event - The triggering event.
 */
function onPointerUp(event) {
  isDragging = false;
  // Touch
  initialPinchDistance = null;
  lastZoom = cameraZoom;
}

/**
 * Handle touches on the screen.
 * @param {TouchEvent} event - The triggering event.
 * @param {*} singleTouchHandler - The handler for single touch.
 */
function handleTouch(event, singleTouchHandler) {
  if (event.touches.length == 1) {
    singleTouchHandler(event);
  } else if (event.type == "touchmove" && event.touches.length == 2) {
    isDragging = false;
    handlePinch(event);
  }
}

/**
 * Handle pinching with two fingers.
 * @param {TouchEvent} event - The triggering event (second finger).
 */
function handlePinch(event) {
  event.preventDefault();

  let touch1 = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  let touch2 = { x: event.touches[1].clientX, y: event.touches[1].clientY };

  // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
  let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

  if (initialPinchDistance == null) {
    initialPinchDistance = currentDistance;
  }

  cameraZoom = (lastZoom * currentDistance) / initialPinchDistance;
  cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
  cameraZoom = Math.max(cameraZoom, MIN_ZOOM);

  requestAnimationFrame(draw);
}

/**
 * Zoom in or out.
 * @param {WheelEvent} event - The scrolling event.
 */
function adjustZoom(event) {
  if (isDragging) return;
  cameraZoom -= event.deltaY * SCROLL_SENSITIVITY;
  cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
  cameraZoom = Math.max(cameraZoom, MIN_ZOOM);

  requestAnimationFrame(draw);
}

// Add listeners
canvas.addEventListener("mousedown", onPointerDown);
canvas.addEventListener("mousemove", onPointerMove);
canvas.addEventListener("mouseup", onPointerUp);
canvas.addEventListener("touchstart", (event) => handleTouch(event, onPointerDown));
canvas.addEventListener("touchmove", (event) => handleTouch(event, onPointerMove));
canvas.addEventListener("touchend", (event) => handleTouch(event, onPointerUp));
canvas.addEventListener("wheel", adjustZoom);
