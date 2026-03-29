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

/** Setup a canvas to fill the viewport and keep it sized on resize.
 *  Returns a cleanup function. */
export function setupFullscreenCanvas(
  canvas: HTMLCanvasElement
): () => void {
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);
  return () => window.removeEventListener("resize", resize);
}
