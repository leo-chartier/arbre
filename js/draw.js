import { Identity } from "./identity.js";
import { Gender } from "./types.js";

/** The aspect ratio of a profile's picture. */
const PFP_ASPECT_RATIO = 2/3;
/** The width of a profile. */
const PROFILE_WIDTH = 200;
/** The height of a profile. */
const PROFILE_HEIGHT = 60;
/** The formatter to display dates */
const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR");

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
// pfp.onload = () => requestAnimationFrame(draw);
pfp.src = `https://gravatar.com/avatar/000000000000000000000000000000000000000000000000000000?d=mp&s=${PROFILE_HEIGHT}`;

/**
 * Draws the tree on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas's 2D context
 * @param {Graph} graph - The graph to draw
 */
export function draw(ctx, graph) {
  ctx.beginPath();
  for (const edge of graph.edges) {
    const coord1 = graph.nodes.find((n) => n.person.identity.id == edge.a)?.coords;
    const coord2 = graph.nodes.find((n) => n.person.identity.id == edge.b)?.coords;
    if (coord1 && coord2)
      drawLines(ctx, coord1.x, coord1.y, coord2.x, coord2.y);
  }
  ctx.stroke();

  for (const node of graph.nodes) {
    drawPerson(ctx, node.person.identity, node.coords);
  }
}

/**
 * Draws a broken line between two points
 * @param {CanvasRenderingContext2D} ctx - The canvas's 2D context
 * @param {*} x1 - The x coordinate of the first point
 * @param {*} y1 - The y coordinate of the first point
 * @param {*} x2 - The x coordinate of the second point
 * @param {*} y2 - The y coordinate of the second point
 */
function drawLines(ctx, x1, y1, x2, y2) {
  const middle = (y1 + y2) / 2;
  ctx.fillStyle = "black";
  ctx.moveTo(x1 * PROFILE_WIDTH, y1 * PROFILE_HEIGHT);
  ctx.lineTo(x1 * PROFILE_WIDTH, middle * PROFILE_HEIGHT);
  ctx.lineTo(x2 * PROFILE_WIDTH, middle * PROFILE_HEIGHT);
  ctx.lineTo(x2 * PROFILE_WIDTH, y2 * PROFILE_HEIGHT);
}

/**
 * Draw a single person.
 * @param {CanvasRenderingContext2D} ctx - The canvas's 2D context
 * @param {Identity} identity - Data about the person.
 * @param {Coordinates} position - Unscaled position for the profile.
 */
function drawPerson(ctx, identity, position) {
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
