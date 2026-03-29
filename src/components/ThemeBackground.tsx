import { useEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeContext";
import {
  heartPath,
  strokeSnowflake,
  drawBat,
  drawEmoji,
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

/**
 * Rainbow: four layered live effects
 *   1. Drifting colour orbs  — large glowing blobs swimming around
 *   2. Prismatic light beams — diagonal shafts slowly sweeping left/right
 *   3. Three breathing arcs  — left / centre / right, each pulsing at its own pace
 *   4. Twinkling sparkles    — 4-armed cross stars that blaze on and off
 */
type RainbowOrb = { x: number; y: number; vx: number; vy: number; r: number; hue: number; phase: number };
let rainbowOrbs: RainbowOrb[] = [];

const ARC_COLORS  = ["#ff2255","#ff8800","#ffee00","#00dd66","#0099ff","#9933ff"];
const ARC_DEFS    = [
  { cxF: 0.16, cyF: 1.15, scale: 0.52, phase: 0.0 },
  { cxF: 0.50, cyF: 1.35, scale: 1.05, phase: 2.1 }, // large centre arc — endpoints pushed well below screen
  { cxF: 0.84, cyF: 1.15, scale: 0.50, phase: 4.2 },
];

function drawRainbow(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (rainbowOrbs.length === 0) {
    rainbowOrbs = Array.from({ length: 13 }, (_, i) => ({
      x: rand(w * 0.05, w * 0.95),
      y: rand(h * 0.05, h * 0.95),
      vx: rand(-0.4, 0.4),
      vy: rand(-0.35, 0.35),
      r:  rand(90, 210),
      hue: (i / 13) * 360,
      phase: rand(0, Math.PI * 2),
    }));
  }

  ctx.clearRect(0, 0, w, h);

  // ── 1. Drifting glowing colour orbs ──────────────────────────────────────────
  for (const orb of rainbowOrbs) {
    orb.x += orb.vx * 0.5 + Math.sin(t * 0.22 + orb.phase) * 0.7;
    orb.y += orb.vy * 0.5 + Math.cos(t * 0.18 + orb.phase) * 0.55;
    if (orb.x < -orb.r) orb.x = w + orb.r;
    if (orb.x > w + orb.r) orb.x = -orb.r;
    if (orb.y < -orb.r) orb.y = h + orb.r;
    if (orb.y > h + orb.r) orb.y = -orb.r;

    const hue = (orb.hue + t * 18) % 360;
    const pr  = orb.r * (0.82 + 0.18 * Math.sin(t * 0.65 + orb.phase));
    const rg  = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pr);
    rg.addColorStop(0,   `hsla(${hue},95%,68%,0.24)`);
    rg.addColorStop(0.5, `hsla(${hue},90%,62%,0.10)`);
    rg.addColorStop(1,   `hsla(${hue},90%,62%,0)`);
    ctx.fillStyle = rg;
    ctx.fillRect(orb.x - pr, orb.y - pr, pr * 2, pr * 2);
  }

  // ── 2. Prismatic diagonal light beams ────────────────────────────────────────
  for (let i = 0; i < 6; i++) {
    const sweep = Math.sin(t * 0.13 + i * 1.08) * w * 0.13;
    const bx    = w * (0.08 + i * 0.17) + sweep;
    const hue   = (i / 6) * 360;
    const alpha = 0.09 + 0.05 * Math.sin(t * 0.55 + i * 0.9);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(bx - 36, 0);
    ctx.lineTo(bx + 36, 0);
    ctx.lineTo(bx + 110, h);
    ctx.lineTo(bx + 38,  h);
    ctx.closePath();
    ctx.fillStyle = `hsl(${hue},95%,65%)`;
    ctx.fill();
    ctx.restore();
  }

  // ── 3. Three breathing rainbow arcs ──────────────────────────────────────────
  const bw = Math.min(w, h) * 0.052;
  for (const def of ARC_DEFS) {
    const cx    = w * def.cxF;
    const cy    = h * def.cyF;
    const pulse = 0.93 + 0.07 * Math.sin(t * 0.55 + def.phase);
    const baseR = Math.min(w, h) * def.scale * pulse;
    for (let i = 0; i < ARC_COLORS.length; i++) {
      const r = baseR + i * bw;
      const a = 0.20 + 0.09 * Math.sin(t * 0.42 + def.phase + i * 0.38);
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 1.07, Math.PI * 1.93);
      ctx.strokeStyle = ARC_COLORS[i];
      ctx.lineWidth   = bw * 0.9;
      ctx.globalAlpha = a;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // ── 4. Twinkling 4-arm cross sparkles ────────────────────────────────────────
  for (let i = 0; i < 80; i++) {
    const sx  = ((i * 137.508) % 1) * w;
    const sy  = ((i * 98.561)  % 1) * h;
    const hue = ((i / 80) * 360 + t * 22) % 360;
    const p   = 0.1 + 0.9 * Math.pow(Math.abs(Math.sin(t * 1.2 + i * 0.57)), 2.5);
    const r   = 1.8 + 5.8 * p;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(t * 0.7 + i * 0.35);
    ctx.fillStyle = `hsla(${hue},95%,80%,${p * 0.92})`;

    // vertical arm
    ctx.beginPath();
    ctx.rect(-r * 0.18, -r * 1.7, r * 0.36, r * 3.4);
    ctx.fill();
    // diagonal arm (45°)
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.rect(-r * 0.14, -r * 1.2, r * 0.28, r * 2.4);
    ctx.fill();

    // bright white core
    ctx.rotate(-Math.PI / 4);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p * 0.75})`;
    ctx.fill();

    ctx.restore();
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

/**
 * Flowers: vibrant garden sky — clouds, ☀️ sun, butterflies, and a dense
 * shower of colourful flowers floating both up and down.
 */
const ALL_FLOWER_EMOJIS = ["🌸","🌺","🌼","🌻","🌷","🌹","💐","🪷","🪻","🫧","🌸","🌺","🌼","🌷","🌸","🪷"];
const CLOUD_EMOJIS      = ["☁️","🌤️","⛅","🌥️"];
const FRIEND_EMOJIS     = ["🦋","🐝","🦋","✨","🌈","🦋","🐛","🌟"];

type FlowerP = {
  x: number; y: number; size: number; speed: number;
  phase: number; rot: number; rotSpeed: number; drift: number;
  kind: "cloud" | "rise" | "fall" | "friend";
  emoji: string;
};
let flowerParticles: FlowerP[] = [];

function drawFlowers(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (flowerParticles.length === 0) {
    // Clouds: top 30% only — always visible and unobstructed
    const clouds: FlowerP[] = Array.from({ length: 7 }, (_, i) => ({
      x: rand(0, w), y: rand(h * 0.02, h * 0.28),
      size: rand(50, 85), speed: rand(0.08, 0.20),
      phase: i * 0.9, rot: 0, rotSpeed: 0, drift: 0,
      kind: "cloud", emoji: CLOUD_EMOJIS[i % CLOUD_EMOJIS.length],
    }));
    // Rising flowers: spawn in lower 70%, rise upward but reset before reaching top 30%
    const rising: FlowerP[] = Array.from({ length: 40 }, (_, i) => ({
      x: rand(0, w), y: rand(h * 0.30, h),
      size: rand(14, 30), speed: rand(0.28, 0.85),
      phase: rand(0, Math.PI * 2), rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.018, 0.018), drift: rand(0.3, 0.9),
      kind: "rise", emoji: ALL_FLOWER_EMOJIS[i % ALL_FLOWER_EMOJIS.length],
    }));
    // Falling flowers: enter from top of lower-70% zone, fall to bottom
    const falling: FlowerP[] = Array.from({ length: 40 }, (_, i) => ({
      x: rand(0, w), y: rand(h * 0.30, h),
      size: rand(12, 28), speed: rand(0.3, 0.95),
      phase: rand(0, Math.PI * 2), rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.014, 0.014), drift: rand(0.2, 0.7),
      kind: "fall", emoji: ALL_FLOWER_EMOJIS[(i + 5) % ALL_FLOWER_EMOJIS.length],
    }));
    // Friends (butterflies/bees): lower 70%, drift in figure-eights
    const friends: FlowerP[] = Array.from({ length: 20 }, (_, i) => ({
      x: rand(0, w), y: rand(h * 0.30, h * 0.95),
      size: rand(18, 30), speed: rand(0.15, 0.5),
      phase: rand(0, Math.PI * 2), rot: 0, rotSpeed: 0,
      drift: rand(0.6, 1.8),
      kind: "friend", emoji: FRIEND_EMOJIS[i % FRIEND_EMOJIS.length],
    }));
    flowerParticles = [...clouds, ...rising, ...falling, ...friends];
  }

  ctx.clearRect(0, 0, w, h);

  // bright sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0,    "rgba(100,185,255,0.35)");
  sky.addColorStop(0.5,  "rgba(160,220,255,0.18)");
  sky.addColorStop(0.85, "rgba(200,240,200,0.10)");
  sky.addColorStop(1,    "rgba(255,230,200,0.06)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // ☀️ pulsing glow + sun emoji upper-right
  const sx = w * 0.86, sy = h * 0.10;
  const gR  = 65 + 10 * Math.sin(t * 0.65);
  const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, gR);
  glow.addColorStop(0,   "rgba(255,250,160,0.38)");
  glow.addColorStop(0.45,"rgba(255,230,90,0.15)");
  glow.addColorStop(1,   "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(sx - gR, sy - gR, gR * 2, gR * 2);
  drawEmoji(ctx, sx, sy, 55, "☀️");

  for (const p of flowerParticles) {
    if (p.kind === "cloud") {
      p.x -= p.speed;
      if (p.x + p.size < 0) { p.x = w + p.size; p.y = rand(h * 0.02, h * 0.32); }
      const bob = Math.sin(t * 0.38 + p.phase) * 5;
      ctx.save();
      ctx.globalAlpha = 0.72 + 0.18 * Math.sin(t * 0.5 + p.phase);
      drawEmoji(ctx, p.x, p.y + bob, p.size, p.emoji);
      ctx.globalAlpha = 1;
      ctx.restore();

    } else if (p.kind === "rise") {
      p.y -= p.speed;
      p.x += Math.sin(t * 0.5 + p.phase) * p.drift;
      p.rot += p.rotSpeed;
      // reset at the cloud boundary (30%) so flowers never crowd the sky
      if (p.y + p.size < h * 0.30) { p.y = h + p.size; p.x = rand(0, w); }
      const alpha = 0.52 + 0.36 * Math.abs(Math.sin(t * 0.65 + p.phase));
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      drawEmoji(ctx, 0, 0, p.size, p.emoji);
      ctx.globalAlpha = 1;
      ctx.restore();

    } else if (p.kind === "fall") {
      p.y += p.speed;
      p.x += Math.sin(t * 0.42 + p.phase) * p.drift;
      p.rot += p.rotSpeed;
      // wrap back to the 30% boundary so they only occupy lower 70%
      if (p.y - p.size > h) { p.y = h * 0.30 - p.size; p.x = rand(0, w); }
      const alpha = 0.52 + 0.35 * Math.abs(Math.sin(t * 0.72 + p.phase));
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      drawEmoji(ctx, 0, 0, p.size, p.emoji);
      ctx.globalAlpha = 1;
      ctx.restore();

    } else {
      // friends (butterflies/bees) — figure-eight drift
      p.x += Math.cos(t * 0.55 + p.phase) * p.drift;
      p.y += Math.sin(t * 1.1  + p.phase) * p.drift * 0.5;
      if (p.x < -p.size) p.x = w + p.size;
      if (p.x > w + p.size) p.x = -p.size;
      // clamp to lower 70% so friends never drift into the cloud zone
      if (p.y < h * 0.30) p.y = h * 0.30;
      if (p.y > h) p.y = h * 0.30;
      ctx.save();
      ctx.globalAlpha = 0.60 + 0.28 * Math.sin(t * 0.9 + p.phase);
      drawEmoji(ctx, p.x, p.y, p.size, p.emoji);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
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

/**
 * Spicy (NSFW): four layered effects for a late-night club atmosphere
 *   1. Drifting deep-purple / hot-pink / crimson bokeh orbs
 *   2. Slow diagonal club-light beams in spicy hues
 *   3. Rising heat shimmer from the floor
 *   4. Dense emoji shower (🍆🍑💦👄🍭🍌🍒💋🌹🔥)
 */
const SPICY_EMOJIS = ["🍆","🍑","💦","👄","🍭","🍌","🍒","💋","🌹","🔥","🍆","🍑","💦","💋", "🐱", "👅"];

type SpicyOrb = { x: number; y: number; vx: number; vy: number; r: number; hue: number; phase: number };
let spicyOrbs: SpicyOrb[] = [];

type SpicyP = { x: number; y: number; size: number; speed: number; phase: number; kind: number; rot: number };
let spicyParticles: SpicyP[] = [];

// hue palette: deep purple, hot pink, crimson, violet, rose
const SPICY_ORB_HUES = [280, 320, 340, 260, 300, 0, 330, 270];

function drawSpicy(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  if (spicyOrbs.length === 0) {
    spicyOrbs = Array.from({ length: 11 }, (_, i) => ({
      x: rand(0, w), y: rand(0, h),
      vx: rand(-0.35, 0.35), vy: rand(-0.28, 0.28),
      r:   rand(80, 200),
      hue: SPICY_ORB_HUES[i % SPICY_ORB_HUES.length],
      phase: rand(0, Math.PI * 2),
    }));
  }
  if (spicyParticles.length === 0) {
    spicyParticles = Array.from({ length: 100 }, () => ({
      x: rand(0, w), y: rand(0, h),
      size: rand(14, 34),
      speed: rand(0.22, 0.70),
      phase: rand(0, Math.PI * 2),
      kind: Math.floor(rand(0, SPICY_EMOJIS.length)),
      rot: rand(-0.25, 0.25),
    }));
  }

  ctx.clearRect(0, 0, w, h);

  // ── 1. Glowing bokeh orbs — the main atmosphere setter ───────────────────────
  for (const orb of spicyOrbs) {
    orb.x += orb.vx * 0.45 + Math.sin(t * 0.18 + orb.phase) * 0.55;
    orb.y += orb.vy * 0.45 + Math.cos(t * 0.14 + orb.phase) * 0.42;
    if (orb.x < -orb.r) orb.x = w + orb.r;
    if (orb.x > w + orb.r) orb.x = -orb.r;
    if (orb.y < -orb.r) orb.y = h + orb.r;
    if (orb.y > h + orb.r) orb.y = -orb.r;

    const hue = (orb.hue + t * 6) % 360;
    const pr  = orb.r * (0.84 + 0.16 * Math.sin(t * 0.58 + orb.phase));
    const rg  = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pr);
    rg.addColorStop(0,   `hsla(${hue},95%,52%,0.22)`);
    rg.addColorStop(0.45,`hsla(${hue},88%,42%,0.09)`);
    rg.addColorStop(1,   `hsla(${hue},88%,42%,0)`);
    ctx.fillStyle = rg;
    ctx.fillRect(orb.x - pr, orb.y - pr, pr * 2, pr * 2);
  }

  // ── 2. Flowing neon sine-wave ribbons ────────────────────────────────────────
  // Each ribbon is a sinusoidal path drawn with three layered strokes:
  //   wide+dim outer glow → medium mid-glow → thin bright core
  // giving a "neon tube" look that bends and flows across the screen.
  const RIBBON_HUES = [295, 330, 0, 270, 315];
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 5; i++) {
    const hue   = (RIBBON_HUES[i] + t * 9) % 360;
    // ribbon centre Y drifts slowly up and down
    const yC    = h * (0.12 + i * 0.19) + Math.sin(t * 0.20 + i * 1.25) * h * 0.07;
    const amp   = 24 + 14 * Math.sin(t * 0.32 + i * 0.65);
    const freq  = (1.4 + i * 0.38) * Math.PI * 2 / w;
    const phase = t * (0.55 + i * 0.13);

    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = yC + amp * Math.sin(x * freq + phase);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    // outer glow
    ctx.strokeStyle = `hsla(${hue},90%,58%,0.07)`;
    ctx.lineWidth   = 22;
    ctx.stroke();
    // mid glow
    ctx.strokeStyle = `hsla(${hue},95%,68%,0.14)`;
    ctx.lineWidth   = 8;
    ctx.stroke();
    // bright core
    ctx.strokeStyle = `hsla(${hue},100%,82%,0.28)`;
    ctx.lineWidth   = 2;
    ctx.stroke();
  }
  ctx.restore();

  // ── 3. Heat shimmer columns rising from the floor ────────────────────────────
  for (let i = 0; i < 6; i++) {
    const hx = (w / 6) * i + Math.sin(t * 0.55 + i) * 20;
    const lg = ctx.createLinearGradient(hx, h, hx, h * 0.45);
    lg.addColorStop(0, "rgba(180,10,80,0.11)");
    lg.addColorStop(0.5,"rgba(120,0,180,0.05)");
    lg.addColorStop(1, "transparent");
    ctx.fillStyle = lg;
    ctx.fillRect(hx - 40, h * 0.45, 80, h * 0.55);
  }

  // ── 4. Emoji shower ───────────────────────────────────────────────────────────
  for (const p of spicyParticles) {
    p.y -= p.speed;
    p.x += Math.sin(t * 0.4 + p.phase) * 0.45;
    if (p.y + p.size < 0) { p.y = h + p.size; p.x = rand(0, w); }
    const alpha = 0.52 + 0.34 * Math.abs(Math.sin(t * 0.88 + p.phase));
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;
    drawEmoji(ctx, 0, 0, p.size, SPICY_EMOJIS[p.kind]);
    ctx.globalAlpha = 1;
    ctx.restore();
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
  flowers: drawFlowers,

  fire:    drawFire,
  ice:     drawIce,
  spicy:   drawSpicy,
};

export function ThemeBackground() {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    // Reset per-theme particle state when theme changes
    rainbowOrbs     = [];
    loveParticles   = [];
    batParticles    = [];
    spaceStars      = [];
    bubbles         = [];
    neonSparks      = [];
    flowerParticles = [];

    embers          = [];
    snowflakes      = [];
    spicyOrbs       = [];
    spicyParticles  = [];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cleanup = setupFullscreenCanvas(canvas);
    const drawFn  = DRAW_MAP[theme.id] ?? drawRainbow;
    const start   = performance.now();

    function loop() {
      const t   = (performance.now() - start) / 1000;
      const dpr = window.devicePixelRatio || 1;
      drawFn(ctx!, canvas!.width / dpr, canvas!.height / dpr, t);
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
