import { CORNER_RADIUS, GENDER_COLORS, HORIZONTAL_SPACING, PROFILE_HEIGHT, PROFILE_WIDTH, VERTICAL_SPACING } from "./constants.js";
import { Gender } from "./types.js";

const cachedImages = new Map();

/**
 * Draws the tree on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas's 2D context
 * @param {Graph} graph - The graph to draw
 */
export function draw(ctx, graph) {
  for (const edge of graph.edges) {
    const coord1 = graph.nodes.find((n) => n.person.identity.id == edge.a)?.coords;
    const coord2 = graph.nodes.find((n) => n.person.identity.id == edge.b)?.coords;
    if (coord1 && coord2)
      drawLines(ctx, coord1.x * PROFILE_WIDTH, coord1.y * PROFILE_HEIGHT, coord2.x * PROFILE_WIDTH, coord2.y * PROFILE_HEIGHT, VERTICAL_SPACING * PROFILE_HEIGHT / 4);
  }

  for (const node of graph.nodes) {
    drawProfileCard(ctx, node.person.identity, node.coords.x * PROFILE_WIDTH, node.coords.y * PROFILE_HEIGHT, PROFILE_WIDTH, PROFILE_HEIGHT);
  }
}

export function getBoundingBoxes(graph) {
  const xs = graph.nodes.map((node) => node.coords.x);
  const ys = graph.nodes.map((node) => node.coords.y);
  return [
    (Math.min(...xs) - 0.5 - HORIZONTAL_SPACING) * PROFILE_WIDTH,
    (Math.min(...ys) - 0.5 - VERTICAL_SPACING) * PROFILE_HEIGHT,
    (Math.max(...xs) + 0.5 + HORIZONTAL_SPACING) * PROFILE_WIDTH,
    (Math.max(...ys) + 0.5 + VERTICAL_SPACING) * PROFILE_HEIGHT,
  ];
}

export function getNodeAt(coord, graph) {
  const r2 = CORNER_RADIUS * CORNER_RADIUS;

  for (const node of graph.nodes) {
    // De-normalize the coords
    const cx = node.coords.x * PROFILE_WIDTH;
    const cy = node.coords.y * PROFILE_HEIGHT;
    
    // Fit in the bottom-right quadrant since it's symmetrical
    const x = Math.abs(coord.x - cx);
    const y = Math.abs(coord.y - cy);
    const rx = x - (PROFILE_WIDTH / 2 - CORNER_RADIUS);
    const ry = y - (PROFILE_HEIGHT / 2 - CORNER_RADIUS);

    if (x <= PROFILE_WIDTH / 2 && y <= PROFILE_HEIGHT / 2 && (rx <= 0 || ry <= 0 || (rx * rx + ry * ry) <= r2))
      return node;
  }

  return null;
}

/***************************
 * Generated using ChatGPT *
 *   and adapted by hand   *
 ***************************/

// https://chatgpt.com/share/68be0f0c-2a70-800d-b556-6fdd1692dcbe

/**
 * Draw a family profile card on a canvas.
 */
function drawProfileCard(ctx, identity, cx, cy, width, height) {
  // Styles
  const x = cx - width / 2;
  const y = cy - height / 2;
  const padding = 8;
  const avatarSize = Math.min(width, height) - 2 * padding;
  const avatarX = x + padding;
  const avatarY = y + padding;
  const contentX = avatarX + avatarSize + padding;
  let contentY = avatarY;
  const contentWidth = width - (avatarSize + padding * 3);

  // Card background
  ctx.save();
  // shadow
  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  drawRoundRect(ctx, x, y, width, height, CORNER_RADIUS);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Thin border
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#DDD';
  drawRoundRect(ctx, x, y, width, height, CORNER_RADIUS);
  ctx.stroke();

  // Avatar (image or placeholder)
  const fullName = (identity.firstnames || '').trim() + ' ' + (identity.lastname || '').trim();
  const initials = fullName
    .split(/\s+/)
    .map(s => s[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  drawAvatar(ctx, avatarX, avatarY, avatarSize, identity.picture, initials);

  // Gender marker: small shape top-right of avatar
  if (identity.gender) {
    const gSize = Math.round(avatarSize * 0.18);
    const gx = avatarX + avatarSize - gSize;
    const gy = avatarY - Math.round(gSize * 0.35);
    drawGenderMarker(ctx, gx, gy, gSize, identity.gender);
  }

  // Text content
  ctx.fillStyle = '#222';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Name
  const nameFontSize = Math.round(height * 0.15);
  ctx.font = `bold ${nameFontSize}px sans-serif`;
  const names = (fullName || '???').split(/\s+/);
  while (names.length > 0) {
    let line = names.shift() || '';
    while (names.length > 0 && ctx.measureText(line + ' ' + names[0]).width <= contentWidth)
      line += ' ' + names.shift();
    ctx.fillText(line, contentX, contentY);
    contentY += Math.round(nameFontSize * 1.1);
  }

  // Dates line
  if (identity.dob || identity.dod) {
    const dateFontSize = nameFontSize * 0.78;
    ctx.font = `${Math.round(dateFontSize)}px sans-serif`;
    const dobText = formatDate(identity.dob);
    const dodText = formatDate(identity.dod);
    const datesLine = `${dobText} - ${dodText}`;
    ctx.fillStyle = '#444';
    ctx.fillText(fitText(ctx, datesLine, contentWidth, ctx.font), contentX, contentY);
    contentY += Math.round(dateFontSize * 1.1);
  }

  // Places
  const placeFontSize = Math.round(nameFontSize * 0.7);
  ctx.font = `${placeFontSize}px sans-serif`;
  ctx.fillStyle = '#555';
  if (identity.pob) {
    const pob = (identity.gender == Gender.FEMALE ? 'Née' : 'Né') + ': ' + identity.pob;
    ctx.fillText(fitText(ctx, pob, contentWidth, ctx.font), contentX, contentY);
    contentY += Math.round(placeFontSize * 1.1);
  }
  if (identity.pod) {
    const pod = (identity.gender == Gender.FEMALE ? 'Décédée' : 'Décédé') + ': ' + identity.pod;
    ctx.fillText(fitText(ctx, pod, contentWidth, ctx.font), contentX, contentY);
    contentY += Math.round(placeFontSize * 1.1);
  }

  ctx.restore();
}

function drawRoundRect(ctx, x, y, w, h, r) {
  const x2 = x + w;
  const y2 = y + h;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x2, y,  x2, y2, r);
  ctx.arcTo(x2, y2, x,  y2, r);
  ctx.arcTo(x,  y2, x,  y,  r);
  ctx.arcTo(x,  y,  x2, y,  r);
  ctx.closePath();
}

function fitText(ctx, text, maxW, baseFont) {
  ctx.font = baseFont;
  if (ctx.measureText(text).width <= maxW) return text;
  // truncate with ellipsis
  while (text.length > 0 && ctx.measureText(text + '…').width > maxW) {
    text = text.slice(0, -1);
  }
  return text + '…';
}

function drawAvatar(ctx, avatarX, avatarY, avatarSize, url, initials) {
  const img = cachedImages.get(url);
  if (url && img) {
    ctx.save();
    drawRoundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 8);
    ctx.clip();
    // fill background lightly while image draws
    ctx.fillStyle = '#F6F6F6';
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    // draw centered cover
    let iw = img.width, ih = img.height;
    const scale = Math.max(avatarSize/iw, avatarSize/ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = avatarX - (dw - avatarSize) / 2;
    const dy = avatarY - (dh - avatarSize) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  } else {
    drawPlaceholderAvatar(ctx, avatarX, avatarY, avatarSize, initials);
  }
}

function drawPlaceholderAvatar(ctx, cx, cy, size, initials) {
  ctx.save();
  drawRoundRect(ctx, cx, cy, size, size, 8);
  ctx.clip();
  ctx.fillStyle = '#EEE';
  ctx.fillRect(cx, cy, size, size);
  ctx.fillStyle = '#AAA';
  ctx.font = `${Math.round(size * 0.32)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, cx + size / 2, cy + size / 2);
  ctx.restore();
}

function drawGenderMarker(ctx, x, y, size, gender) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.fillStyle = GENDER_COLORS[gender];
  /*
  switch (gender) {
    case Gender.MALE:
      // square
      ctx.rect(0, 0, size, size);
      ctx.fill();
      break;
    case Gender.FEMALE:
      // circle
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI*2);
      ctx.fill();
      break;
    case Gender.OTHER:
      // triangle for 'other'
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fill();
      break;
  }
  */
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a broken line between two points
 * @param {CanvasRenderingContext2D} ctx - The canvas's 2D context
 * @param {number} x1 - The x coordinate of the first point
 * @param {number} y1 - The y coordinate of the first point
 * @param {number} x2 - The x coordinate of the second point
 * @param {number} y2 - The y coordinate of the second point
 * @param {number} radius - The curve of the lines
 */
function drawLines(ctx, x1, y1, x2, y2, radius) {
  if (x1 > x2)
    [x1, y1, x2, y2] = [x2, y2, x1, y1];

  const r = Math.min(Math.abs(x2 - x1), radius);
  const m = (y1 + y2) / 2;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.arcTo(x1, m, x1 + r, m,  r);
  ctx.arcTo(x2, m, x2,     y2, r);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function formatDate(d) {
  if (!d) return '';
  // Attempt parse; if fails return original
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString();
}

export async function preloadPictures(urls) {
  return Promise.all(urls.map(
    url => new Promise((resolve, reject) => {
      const img = new Image();
      cachedImages.set(url, img);
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = "anonymous"; // Prevent CORS problem when downloading the canvas
      img.src = url;
    })
  ));
}
