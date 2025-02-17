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
  ctx.translate(
    -CANVAS_WIDTH / 2 + cameraOffset.x,
    -CANVAS_HEIGHT / 2 + cameraOffset.y
  );
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawPerson(0); // TEMP
}

const PFP_ASPECT_RATIO = 2/3; // Profile picture
const PROFILE_WIDTH = 500;
const PROFILE_HEIGHT = 150;

// TODO: Dynamically get each pfp
let pfp = new Image(PROFILE_HEIGHT * PFP_ASPECT_RATIO, PROFILE_HEIGHT);
pfp.onload = () => requestAnimationFrame(draw);
pfp.src = `https://gravatar.com/avatar/000000000000000000000000000000000000000000000000000000?d=mp&s=${PROFILE_HEIGHT}`;

const dateFormatter = new Intl.DateTimeFormat("fr-FR");

function drawPerson(id) {
  // TODO: Get proper values
  let cx = 0;
  let cy = 0;
  let firstname = "Firstname";
  let lastname = "LASTNAME";
  let sex = Sex.OTHER;
  let dob = new Date(0);
  let dod = null;
  // let pfp;
  
  let lines = [
    `${firstname} ${lastname.toUpperCase()}`,
    "",
    dob ? `* ${dateFormatter.format(dob)}` : "",
    dod ? `\u2020 ${dateFormatter.format(dod)}` : "",
  ];
  
  // Backgrounds
  let x0 = cx - PROFILE_WIDTH / 2;
  let y0 = cy - pfp.height / 2;
  ctx.fillStyle = SEX_COLORS[sex];
  ctx.fillRect(x0, y0, pfp.width, pfp.height);
  ctx.fillStyle = "white";
  ctx.fillRect(x0 + pfp.width, y0, PROFILE_WIDTH - pfp.width, pfp.height);
  
  // Draw the pfp covering the frame and cropping the overflow
  if (pfp.naturalWidth / pfp.naturalHeight > PFP_ASPECT_RATIO) {
    let padding = pfp.naturalWidth - pfp.width * pfp.naturalHeight / pfp.height;
    ctx.drawImage(pfp, padding / 2, 0, pfp.naturalWidth - padding, pfp.naturalHeight, x0, y0, pfp.width, pfp.height);
  } else {
    let padding = pfp.naturalHeight - pfp.height * pfp.naturalWidth / pfp.width;
    ctx.drawImage(pfp, 0, padding / 2, pfp.naturalWidth, pfp.naturalHeight - padding, x0, y0, pfp.width, pfp.height);
  }

  // Borders
  ctx.fillStyle = "black";
  ctx.strokeRect(x0, y0, pfp.width, pfp.height);
  ctx.strokeRect(x0 + pfp.width, y0, PROFILE_WIDTH - pfp.width, pfp.height);

  // Text
  let maxWidth = (PROFILE_WIDTH - pfp.width) * 0.9;
  let lineHeight = (PROFILE_HEIGHT / lines.length) * 0.9;
  let x1 = cx + pfp.width / 2;
  let y1 = cy - (lines.length - 1) * lineHeight / 2;
  ctx.font = `${lineHeight*0.75}px Arial`;
  ctx.textAlign = "center";
  for (let [i, line] of lines.entries()) {
    ctx.fillText(line, x1, y1 + i * lineHeight, maxWidth);
  }
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

  requestAnimationFrame(draw);
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

  cameraZoom = (lastZoom * currentDistance) / initialPinchDistance;
  cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
  cameraZoom = Math.max(cameraZoom, MIN_ZOOM);

  requestAnimationFrame(draw);
}

function adjustZoom(event) {
  if (isDragging) return;
  cameraZoom -= event.deltaY * SCROLL_SENSITIVITY;
  cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
  cameraZoom = Math.max(cameraZoom, MIN_ZOOM);

  requestAnimationFrame(draw);
}

canvas.addEventListener("mousedown", onPointerDown);
canvas.addEventListener("mousemove", onPointerMove);
canvas.addEventListener("mouseup", onPointerUp);
canvas.addEventListener("touchstart", (event) =>
  handleTouch(event, onPointerDown)
);
canvas.addEventListener("touchmove", (event) =>
  handleTouch(event, onPointerMove)
);
canvas.addEventListener("touchend", (event) => handleTouch(event, onPointerUp));
canvas.addEventListener("wheel", adjustZoom);

draw();
