// Shared canvas drawing utilities used by ThemeBackground and ThemeWin.

/** Parametric heart shape. size ≈ visual diameter in px. */
export function heartPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) {
  const s = size / 17;
  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const t = (i / 50) * Math.PI * 2;
    const x = cx + 16 * Math.pow(Math.sin(t), 3) * s;
    const y =
      cy -
      (13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)) *
        s;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** 6-arm snowflake with branch ticks. Caller sets strokeStyle + lineWidth. */
export function strokeSnowflake(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rot: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.lineWidth = Math.max(0.8, size * 0.09);
  for (let a = 0; a < 6; a++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size);
    ctx.stroke();
    const b = size * 0.45;
    ctx.beginPath();
    ctx.moveTo(0, -b);
    ctx.lineTo(-size * 0.25, -b - size * 0.22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -b);
    ctx.lineTo(size * 0.25, -b - size * 0.22);
    ctx.stroke();
  }
  ctx.restore();
}

/** 4-pointed sparkle/star. Caller sets fillStyle. */
export function fillStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  inner: number
) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / 8) * Math.PI * 2 - Math.PI / 4;
    i === 0
      ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
      : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
}

/** Simple bat silhouette. Caller sets fillStyle. flapT drives wing angle. */
export function drawBat(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  flapT: number
) {
  const wy = Math.abs(Math.sin(flapT)) * s * 0.55;
  ctx.beginPath();
  ctx.ellipse(cx, cy, s * 0.1, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + dir * s * 0.1, cy);
    ctx.quadraticCurveTo(cx + dir * s * 0.5, cy - wy, cx + dir * s, cy + s * 0.1);
    ctx.quadraticCurveTo(cx + dir * s * 0.5, cy + s * 0.14, cx + dir * s * 0.1, cy + s * 0.07);
    ctx.fill();
  }
}

/**
 * 🍆 Eggplant. Caller sets ctx.fillStyle for the body colour.
 * Elongated teardrop body with a slight curve, green calyx with
 * star-shaped sepals, and a thick curved stem.
 */
export function drawEggplant(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  // body — symmetric oval, wide in lower half, narrowing toward calyx at top
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.bezierCurveTo( s * 0.32, -s * 0.5,  s * 0.5, -s * 0.12,  s * 0.5,  s * 0.2);
  ctx.bezierCurveTo( s * 0.5,   s * 0.55,  s * 0.28,  s * 0.78,  0,  s * 0.78);
  ctx.bezierCurveTo(-s * 0.28,  s * 0.78, -s * 0.5,   s * 0.55, -s * 0.5,  s * 0.2);
  ctx.bezierCurveTo(-s * 0.5,  -s * 0.12, -s * 0.32, -s * 0.5,   0, -s * 0.5);
  ctx.closePath();
  ctx.fill();

  // highlight (upper-right, glassy)
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(s * 0.16, -s * 0.04, s * 0.08, s * 0.26, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // calyx — 5 leaf sepals evenly fanning outward, centered on body top
  const calyxY = -s * 0.5;
  ctx.fillStyle = "#2d7a16";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(0, calyxY);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-s * 0.06, -s * 0.1, -s * 0.04, -s * 0.24, 0, -s * 0.28);
    ctx.bezierCurveTo( s * 0.04, -s * 0.24,  s * 0.06, -s * 0.1,  0,  0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // calyx base cap (centered)
  ctx.fillStyle = "#2d7a16";
  ctx.beginPath();
  ctx.ellipse(0, calyxY, s * 0.14, s * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // curved stem rising from calyx
  ctx.strokeStyle = "#3a8f1e";
  ctx.lineWidth = Math.max(2, s * 0.1);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, calyxY - s * 0.04);
  ctx.bezierCurveTo(s * 0.16, calyxY - s * 0.25, s * 0.3, calyxY - s * 0.28, s * 0.2, calyxY - s * 0.42);
  ctx.stroke();

  ctx.restore();
}

/**
 * 🍑 Peach. Caller sets ctx.fillStyle.
 * Two-lobed shape with a vertical cleft, gradient blush,
 * a short brown stem, and a small green leaf.
 */
export function drawPeach(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  // two round lobes (plain circles so they read as genuinely spherical)
  ctx.beginPath();
  ctx.arc(-s * 0.22, s * 0.06, s * 0.44, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc( s * 0.22, s * 0.06, s * 0.44, 0, Math.PI * 2);
  ctx.fill();

  // blush gradient on lower half
  ctx.save();
  const blush = ctx.createRadialGradient(0, s * 0.3, 0, 0, s * 0.3, s * 0.5);
  blush.addColorStop(0, "rgba(220, 50, 30, 0.3)");
  blush.addColorStop(1, "rgba(220, 50, 30, 0)");
  ctx.fillStyle = blush;
  ctx.beginPath();
  ctx.arc(0, s * 0.2, s * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // highlight
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-s * 0.2, -s * 0.15, s * 0.1, s * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // vertical cleft — deep and prominent, top to bottom of the fruit
  ctx.strokeStyle = "rgba(140, 40, 10, 0.5)";
  ctx.lineWidth = Math.max(2, s * 0.08);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.38);
  ctx.bezierCurveTo(s * 0.05, -s * 0.1, s * 0.05, s * 0.22, 0, s * 0.48);
  ctx.stroke();

  // stem — brown, short
  ctx.strokeStyle = "#6b4226";
  ctx.lineWidth = Math.max(1.5, s * 0.08);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.45);
  ctx.bezierCurveTo(-s * 0.02, -s * 0.6, s * 0.05, -s * 0.72, s * 0.02, -s * 0.8);
  ctx.stroke();

  // leaf
  ctx.fillStyle = "#4a8a20";
  ctx.save();
  ctx.translate(s * 0.1, -s * 0.65);
  ctx.rotate(0.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(s * 0.08, -s * 0.08, s * 0.2, -s * 0.06, s * 0.22, 0);
  ctx.bezierCurveTo(s * 0.2, s * 0.06, s * 0.08, s * 0.08, 0, 0);
  ctx.closePath();
  ctx.fill();
  // leaf vein
  ctx.strokeStyle = "rgba(30, 80, 10, 0.4)";
  ctx.lineWidth = Math.max(0.5, s * 0.02);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(s * 0.18, 0);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 💦 Three water drops. Caller sets ctx.fillStyle.
 * Teardrop shapes with highlights, arranged in the classic
 * three-drop splash pattern (large right, medium upper-left, small left).
 */
export function drawDrops(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  function drop(dx: number, dy: number, ds: number, angle: number) {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(angle);

    // drop shape — pointed top, rounded bottom
    ctx.beginPath();
    ctx.moveTo(0, -ds);
    ctx.bezierCurveTo(ds * 0.08, -ds * 0.75, ds * 0.55, -ds * 0.2, ds * 0.5, ds * 0.2);
    ctx.bezierCurveTo(ds * 0.45, ds * 0.55, ds * 0.25, ds * 0.7, 0, ds * 0.7);
    ctx.bezierCurveTo(-ds * 0.25, ds * 0.7, -ds * 0.45, ds * 0.55, -ds * 0.5, ds * 0.2);
    ctx.bezierCurveTo(-ds * 0.55, -ds * 0.2, -ds * 0.08, -ds * 0.75, 0, -ds);
    ctx.closePath();
    ctx.fill();

    // inner highlight — gives the glassy water look
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-ds * 0.12, -ds * 0.15, ds * 0.08, ds * 0.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // small specular dot
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-ds * 0.1, -ds * 0.35, ds * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  drop(s * 0.2, s * 0.1, s * 0.42, 0.22);    // large, slight right tilt
  drop(-s * 0.18, -s * 0.24, s * 0.28, -0.18); // medium, upper-left
  drop(-s * 0.44, s * 0.04, s * 0.18, -0.1);   // small, left

  ctx.restore();
}

/**
 * Renders any emoji character centered at (cx, cy) at the given size.
 * Uses an offscreen-canvas cache so that drawImage is used for compositing —
 * this bypasses Safari's fillText+globalAlpha+transform emoji rendering bugs.
 *
 * To add a new "object" to a theme background or win celebration:
 *   drawEmoji(ctx, x, y, size, "🦄")  // that's it
 */
const _emojiCache = new Map<string, HTMLCanvasElement>();

export function drawEmoji(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  emoji: string
) {
  // Snap to nearest 2px so cache stays small across many random particle sizes
  const dim = Math.round(s * 2 / 2) * 2;
  const dpr = window.devicePixelRatio || 1;
  const px  = Math.round(dim * dpr);   // physical pixels for crisp HiDPI
  const key = `${emoji}_${px}`;

  if (!_emojiCache.has(key)) {
    const oc     = document.createElement("canvas");
    oc.width     = px;
    oc.height    = px;
    const oc_ctx = oc.getContext("2d")!;
    oc_ctx.font         = `${Math.round(px * 0.78)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    oc_ctx.textAlign    = "center";
    oc_ctx.textBaseline = "middle";
    oc_ctx.fillText(emoji, px / 2, px / 2);
    _emojiCache.set(key, oc);
  }

  // drawImage respects the caller's transform (rotation, translation) and
  // globalAlpha correctly on all browsers including Safari
  ctx.drawImage(_emojiCache.get(key)!, cx - dim / 2, cy - dim / 2, dim, dim);
}

/** Setup a canvas to fill the viewport at device pixel ratio for crisp rendering.
 *  Applies a DPR scale transform so all drawing coordinates stay in CSS pixels.
 *  Returns a cleanup function. */
export function setupFullscreenCanvas(
  canvas: HTMLCanvasElement
): () => void {
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const w   = window.innerWidth;
    const h   = window.innerHeight;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
  return () => window.removeEventListener("resize", resize);
}
