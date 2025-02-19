/** The aspect ratio of a profile's picture. */
const PFP_ASPECT_RATIO = 2/3;
/** The width of a profile. */
const PROFILE_WIDTH = 500;
/** The height of a profile. */
const PROFILE_HEIGHT = 150;
/** The formatter to display dates */
const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR");
/**
 * The rendering context.
 * @type {CanvasRenderingContext2D}
 */
let ctx = canvas.getContext("2d");

/**
 * The colors associated with each gender.
 * @type {Object<Gender, string>}
 */
const GENDER_COLORS = {
  [Gender.OTHER]: "gray",
  [Gender.MALE]: "blue",
  [Gender.FEMALE]: "hotpink",
  [Gender.OTHER]: "tan",
};

// TODO: Dynamically get each pfp
let pfp = new Image(PROFILE_HEIGHT * PFP_ASPECT_RATIO, PROFILE_HEIGHT);
pfp.onload = () => requestAnimationFrame(draw);
pfp.src = `https://gravatar.com/avatar/000000000000000000000000000000000000000000000000000000?d=mp&s=${PROFILE_HEIGHT}`;

let graph = generate("0", UNIONS); // TEMP

/**
 * Draws the tree on the canvas.
 */
function draw() {
  let CANVAS_WIDTH = document.body.clientWidth;
  let CANVAS_HEIGHT = document.body.clientHeight;
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

  // TODO: Don't draw if outside of screen
  // TODO: Draw connections lines
  Object.entries(graph).forEach(([id, entry]) => drawPerson(IDENTITIES[id], entry.position));
}

/**
 * Draws a single person.
 * @param {Identity} identity - Data about the person.
 * @param {Coordinates} position - Unscaled position for the profile.
 */
function drawPerson(identity, position) {
  // TODO: Get proper pfp
  // let pfp;

  if (!identity || !position) return;
  
  let lines = [
    `${identity.firstnames || "?"} ${identity.lastname?.toUpperCase() || "?"}`,
    "",
    identity.dob ? `* ${DATE_FORMATTER.format(Date.parse(identity.dob))}` : "",
    identity.dod ? `\u2020 ${DATE_FORMATTER.format(Date.parse(identity.dod))}` : "",
  ];
  
  // Backgrounds
  let cx = PROFILE_WIDTH * position.x;
  let cy = PROFILE_HEIGHT * position.y;
  let x0 = cx - PROFILE_WIDTH / 2;
  let y0 = cy - pfp.height / 2;
  ctx.fillStyle = GENDER_COLORS[identity.gender];
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
