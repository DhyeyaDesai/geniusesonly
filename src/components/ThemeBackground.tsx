import { useEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeContext";
import {
  heartPath,
  strokeSnowflake,
  fillStar,
  drawBat,
  setupFullscreenCanvas,
} from "../utils/canvas";

// ─── helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// ─── theme renderers ──────────────────────────────────────────────────────────

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) => void;

/** Rainbow: pulsing stars */
function drawRainbow(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.clearRect(0, 0, w, h);
  const count = 70;
  for (let i = 0; i < count; i++) {
    const seedX = ((i * 137.5) % 1) * w;
    const seedY = ((i * 97.3) % 1) * h;
    const hue = (i / count) * 360;
    const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + i * 0.4));
    const r = 1 + 2.5 * pulse;
    ctx.beginPath();
    ctx.arc(seedX, seedY, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},80%,70%,${pulse})`;
    ctx.fill();
  }
}

/** Love: drifting hearts */
function makeLoveParticles(w: number, h: number) {
  return Array.from({ length: 22 }, () => ({
    x: rand(0, w),
    y: rand(h * 0.2, h),
    size: rand(10, 30),
    speed: rand(0.3, 1.0),
    drift: rand(-0.3, 0.3),
    hue: rand(330, 360),
    phase: rand(0, Math.PI * 2),
  }));
}
type LoveP = ReturnType<typeof makeLoveParticles>[number];
let loveParticles: LoveP[] = [];

function drawLove(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (loveParticles.length === 0) loveParticles = makeLoveParticles(w, h);
  ctx.clearRect(0, 0, w, h);
  for (const p of loveParticles) {
    p.y -= p.speed;
    p.x += p.drift;
    if (p.y + p.size < 0) { p.y = h + p.size; p.x = rand(0, w); }
    const alpha = 0.5 + 0.5 * Math.sin(t + p.phase);
    ctx.fillStyle = `hsla(${p.hue},80%,65%,${alpha * 0.7})`;
    heartPath(ctx, p.x, p.y, p.size);
    ctx.fill();
  }
}

/** Scary: flying bats + flickering moon */
type BatP = { x: number; y: number; size: number; speed: number; flapOffset: number };
let batParticles: BatP[] = [];

function drawScary(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (batParticles.length === 0) {
    batParticles = Array.from({ length: 12 }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      size: rand(14, 32),
      speed: rand(0.6, 1.6),
      flapOffset: rand(0, Math.PI * 2),
    }));
  }
  ctx.clearRect(0, 0, w, h);
  // moon
  const mx = w * 0.8, my = h * 0.15, mr = 44;
  const flicker = 0.85 + 0.15 * Math.sin(t * 3.7);
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,200,60,${flicker * 0.18})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(mx, my, mr * 0.82, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,210,80,${flicker * 0.22})`;
  ctx.fill();

  ctx.fillStyle = "rgba(255,100,0,0.75)";
  for (const p of batParticles) {
    p.x -= p.speed;
    if (p.x + p.size < 0) { p.x = w + p.size; p.y = rand(h * 0.05, h * 0.7); }
    drawBat(ctx, p.x, p.y, p.size, t * 4 + p.flapOffset);
  }
}

/** Space: scrolling star field + distant nebula */
type StarP = { x: number; y: number; r: number; speed: number; hue: number };
let spaceStars: StarP[] = [];

function drawSpace(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (spaceStars.length === 0) {
    spaceStars = Array.from({ length: 120 }, () => ({
      x: rand(0, w), y: rand(0, h),
      r: rand(0.5, 2.5),
      speed: rand(0.05, 0.3),
      hue: rand(180, 260),
    }));
  }
  ctx.clearRect(0, 0, w, h);
  // nebula blobs
  for (let i = 0; i < 3; i++) {
    const nx = w * (0.2 + i * 0.3);
    const ny = h * (0.3 + Math.sin(t * 0.1 + i) * 0.1);
    const rg = ctx.createRadialGradient(nx, ny, 0, nx, ny, w * 0.2);
    rg.addColorStop(0, `hsla(${220 + i * 40},80%,40%,0.04)`);
    rg.addColorStop(1, "transparent");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }
  for (const s of spaceStars) {
    s.y += s.speed;
    if (s.y > h) { s.y = 0; s.x = rand(0, w); }
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + s.x);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${s.hue},70%,80%,${pulse})`;
    ctx.fill();
  }
}

/** Ocean: floating bubbles */
type BubbleP = { x: number; y: number; r: number; speed: number; wobble: number; phase: number };
let bubbles: BubbleP[] = [];

function drawOcean(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (bubbles.length === 0) {
    bubbles = Array.from({ length: 40 }, () => ({
      x: rand(0, w), y: rand(0, h),
      r: rand(4, 18),
      speed: rand(0.3, 0.9),
      wobble: rand(0.3, 0.9),
      phase: rand(0, Math.PI * 2),
    }));
  }
  ctx.clearRect(0, 0, w, h);
  // caustic shimmer at top
  for (let li = 0; li < 6; li++) {
    const lx = (w / 6) * li + Math.sin(t * 0.5 + li) * 20;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx + 30, h * 0.4);
    ctx.strokeStyle = `rgba(0,200,220,0.05)`;
    ctx.lineWidth = 12;
    ctx.stroke();
  }
  for (const b of bubbles) {
    b.y -= b.speed;
    b.x += Math.sin(t * b.wobble + b.phase) * 0.5;
    if (b.y + b.r < 0) { b.y = h + b.r; b.x = rand(0, w); }
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(100,220,255,0.35)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,240,255,0.5)";
    ctx.fill();
  }
}

/** Neon: scanlines + floating glitch sparks */
type NeonSpark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; hue: number };
let neonSparks: NeonSpark[] = [];

function spawnNeonSpark(w: number, h: number): NeonSpark {
  return {
    x: rand(0, w), y: rand(0, h),
    vx: rand(-1, 1), vy: rand(-1, 1),
    life: 0, maxLife: rand(40, 100),
    hue: Math.random() < 0.5 ? 150 : 290,
  };
}

function drawNeon(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number) {
  ctx.clearRect(0, 0, w, h);
  // scanlines
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, y, w, 2);
  }
  // grid
  ctx.strokeStyle = "rgba(180,0,255,0.06)";
  ctx.lineWidth = 1;
  const gSize = 60;
  for (let gx = 0; gx < w; gx += gSize) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += gSize) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
  }
  // sparks
  if (Math.random() < 0.3) neonSparks.push(spawnNeonSpark(w, h));
  neonSparks = neonSparks.filter(s => s.life < s.maxLife);
  for (const s of neonSparks) {
    s.x += s.vx; s.y += s.vy; s.life++;
    const alpha = 1 - s.life / s.maxLife;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${s.hue},100%,65%,${alpha})`;
    ctx.fill();
  }
}

/** Nature: fireflies + drifting leaves */
type Firefly = { x: number; y: number; r: number; phase: number; vx: number; vy: number };
let fireflies: Firefly[] = [];
type Leaf = { x: number; y: number; size: number; angle: number; speed: number; spin: number };
let leaves: Leaf[] = [];

function drawNature(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (fireflies.length === 0) {
    fireflies = Array.from({ length: 30 }, () => ({
      x: rand(0, w), y: rand(h * 0.3, h),
      r: rand(2, 4),
      phase: rand(0, Math.PI * 2),
      vx: rand(-0.4, 0.4), vy: rand(-0.3, 0.3),
    }));
    leaves = Array.from({ length: 15 }, () => ({
      x: rand(0, w), y: rand(0, h),
      size: rand(10, 22), angle: rand(0, Math.PI * 2),
      speed: rand(0.4, 1.0), spin: rand(-0.02, 0.02),
    }));
  }
  ctx.clearRect(0, 0, w, h);
  for (const f of fireflies) {
    f.x += f.vx + Math.sin(t * 0.5 + f.phase) * 0.3;
    f.y += f.vy + Math.cos(t * 0.4 + f.phase) * 0.2;
    if (f.x < 0) f.x = w; if (f.x > w) f.x = 0;
    if (f.y < h * 0.2) f.y = h; if (f.y > h) f.y = h * 0.2;
    const glow = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + f.phase));
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r * glow, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,255,100,${glow * 0.8})`;
    ctx.fill();
  }
  ctx.fillStyle = "rgba(80,180,40,0.45)";
  for (const l of leaves) {
    l.y += l.speed;
    l.x += Math.sin(t * 0.4 + l.angle) * 0.5;
    l.angle += l.spin;
    if (l.y > h + l.size) { l.y = -l.size; l.x = rand(0, w); }
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, l.size * 0.35, l.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** Royalty: drifting sparkle stars + golden motes */
type RoyalStar = { x: number; y: number; outer: number; phase: number; vy: number };
let royalStars: RoyalStar[] = [];

function drawRoyalty(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (royalStars.length === 0) {
    royalStars = Array.from({ length: 25 }, () => ({
      x: rand(0, w), y: rand(0, h),
      outer: rand(6, 16),
      phase: rand(0, Math.PI * 2),
      vy: rand(-0.4, -0.1),
    }));
  }
  ctx.clearRect(0, 0, w, h);
  for (const s of royalStars) {
    s.y += s.vy;
    if (s.y + s.outer < 0) { s.y = h + s.outer; s.x = rand(0, w); }
    const glow = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.2 + s.phase));
    const hue = Math.sin(s.phase) > 0 ? 45 : 270;
    ctx.fillStyle = `hsla(${hue},100%,65%,${glow * 0.85})`;
    fillStar(ctx, s.x, s.y, s.outer * glow, s.outer * 0.35 * glow);
  }
}

/** Fire: rising embers */
type Ember = { x: number; y: number; r: number; speed: number; hue: number; phase: number };
let embers: Ember[] = [];

function drawFire(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (embers.length === 0) {
    embers = Array.from({ length: 60 }, () => ({
      x: rand(0, w), y: rand(0, h),
      r: rand(1.5, 4),
      speed: rand(0.6, 2.0),
      hue: rand(0, 40),
      phase: rand(0, Math.PI * 2),
    }));
  }
  ctx.clearRect(0, 0, w, h);
  for (const e of embers) {
    e.y -= e.speed;
    e.x += Math.sin(t * 1.5 + e.phase) * 0.7;
    if (e.y + e.r < 0) { e.y = h + e.r; e.x = rand(0, w); }
    const life = 1 - (h - e.y) / h;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${e.hue},100%,65%,${life * 0.8})`;
    ctx.fill();
  }
}

/** Ice: falling snowflakes */
type Snowflake = { x: number; y: number; size: number; speed: number; rot: number; spin: number };
let snowflakes: Snowflake[] = [];

function drawIce(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (snowflakes.length === 0) {
    snowflakes = Array.from({ length: 35 }, () => ({
      x: rand(0, w), y: rand(0, h),
      size: rand(8, 22),
      speed: rand(0.3, 0.8),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.01, 0.01),
    }));
  }
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(180,230,255,0.55)";
  for (const s of snowflakes) {
    s.y += s.speed;
    s.x += Math.sin(t * 0.3 + s.rot) * 0.4;
    s.rot += s.spin;
    if (s.y - s.size > h) { s.y = -s.size; s.x = rand(0, w); }
    strokeSnowflake(ctx, s.x, s.y, s.size, s.rot);
  }
}

// ─── component ────────────────────────────────────────────────────────────────

const DRAW_MAP: Record<string, DrawFn> = {
  rainbow: drawRainbow,
  love:    drawLove,
  scary:   drawScary,
  space:   drawSpace,
  ocean:   drawOcean,
  neon:    drawNeon,
  nature:  drawNature,
  royalty: drawRoyalty,
  fire:    drawFire,
  ice:     drawIce,
};

export function ThemeBackground() {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    // Reset per-theme particle state when theme changes
    loveParticles  = [];
    batParticles   = [];
    spaceStars     = [];
    bubbles        = [];
    neonSparks     = [];
    fireflies      = [];
    leaves         = [];
    royalStars     = [];
    embers         = [];
    snowflakes     = [];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cleanup = setupFullscreenCanvas(canvas);
    const drawFn  = DRAW_MAP[theme.id] ?? drawRainbow;
    const start   = performance.now();

    function loop() {
      const t = (performance.now() - start) / 1000;
      drawFn(ctx!, canvas!.width, canvas!.height, t);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      cleanup();
    };
  }, [theme.id]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
