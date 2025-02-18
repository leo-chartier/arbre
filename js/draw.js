/** The aspect ratio of a profile's picture. */
const PFP_ASPECT_RATIO = 2/3;
/** The width of a profile. */
const PROFILE_WIDTH = 500;
/** The height of a profile. */
const PROFILE_HEIGHT = 150;
/** The formatter to display dates */
const dateFormatter = new Intl.DateTimeFormat("fr-FR");

// TODO: Dynamically get each pfp
let pfp = new Image(PROFILE_HEIGHT * PFP_ASPECT_RATIO, PROFILE_HEIGHT);
pfp.onload = () => requestAnimationFrame(draw);
pfp.src = `https://gravatar.com/avatar/000000000000000000000000000000000000000000000000000000?d=mp&s=${PROFILE_HEIGHT}`;

/**
 * Draws the tree on the canvas.
 */
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

/**
 * Draws a single person.
 * @param {number} id - ID of the person to draw
 */
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

window.addEventListener("load", draw);
