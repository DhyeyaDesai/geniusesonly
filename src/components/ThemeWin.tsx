import { useEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeContext";
import { heartPath, strokeSnowflake, fillStar, drawBat, drawEggplant, drawPeach, drawDrops, setupFullscreenCanvas } from "../utils/canvas";

type Props = { active: boolean };

function rand(min: number, max: number) { return min + Math.random() * (max - min); }

// ─── Particle pools (one per celebration type) ────────────────────────────────

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; hue: number;
  extra?: number; // multipurpose: rotation, wobble phase, etc.
};

function burst(
  w: number, h: number,
  hues: number[],
  count = 6,
  speedMul = 1,
): Particle[] {
  const out: Particle[] = [];
  const ox = rand(w * 0.2, w * 0.8);
  const oy = rand(h * 0.15, h * 0.5);
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(2, 7) * speedMul;
    out.push({
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0, maxLife: rand(60, 100),
      size: rand(6, 18),
      hue: hues[Math.floor(Math.random() * hues.length)],
      extra: rand(0, Math.PI * 2),
    });
  }
  return out;
}

// ─── Draw functions ───────────────────────────────────────────────────────────

type WinDrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  particles: Particle[],
  spawnFn: () => void,
) => void;

function updateParticles(particles: Particle[], gravity = 0.15) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += gravity;
    p.vx *= 0.98;
    p.life++;
    if (p.life >= p.maxLife) particles.splice(i, 1);
  }
}

/** Rainbow: classic multicolour confetti */
function drawRainbowWin(ctx: CanvasRenderingContext2D, _w: number, _h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, _w, _h);
  if (Math.random() < 0.15) spawn();
  updateParticles(particles);
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.extra! + p.life * 0.1);
    ctx.fillStyle = `hsla(${p.hue},90%,60%,${alpha})`;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
}

/** Love: heart burst */
function drawLoveWin(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, w, h);
  if (Math.random() < 0.12) spawn();
  updateParticles(particles, 0.08);
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.fillStyle = `hsla(${p.hue},80%,60%,${alpha})`;
    heartPath(ctx, p.x, p.y, p.size * 1.5);
    ctx.fill();
  }
}

/** Scary: bats scatter */
function drawScaryWin(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, w, h);
  if (Math.random() < 0.1) spawn();
  updateParticles(particles, -0.05);
  ctx.fillStyle = "rgba(255,100,0,0.85)";
  for (const p of particles) {
    if (p.y < -p.size) continue;
    drawBat(ctx, p.x, p.y, p.size, p.life * 0.2);
  }
}

/** Space: star burst + ring wave */
function drawSpaceWin(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, w, h);
  if (Math.random() < 0.12) spawn();
  updateParticles(particles, 0.05);
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.fillStyle = `hsla(${p.hue},90%,70%,${alpha})`;
    fillStar(ctx, p.x, p.y, p.size, p.size * 0.4);
  }
}

/** Ocean: bubble confetti */
function drawOceanWin(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, w, h);
  if (Math.random() < 0.15) spawn();
  updateParticles(particles, -0.06);
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${p.hue},80%,65%,${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x - p.size * 0.15, p.y - p.size * 0.15, p.size * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,240,255,${alpha * 0.6})`;
    ctx.fill();
  }
}

/** Neon: glitch sparks */
function drawNeonWin(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, w, h);
  if (Math.random() < 0.2) spawn();
  updateParticles(particles, 0.02);
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `hsla(${p.hue},100%,60%,${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue},100%,65%,${alpha})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/** Nature: flower petals */
function drawNatureWin(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, w, h);
  if (Math.random() < 0.12) spawn();
  updateParticles(particles, 0.06);
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.extra! + p.life * 0.05);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.4, p.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue},75%,65%,${alpha})`;
    ctx.fill();
    ctx.restore();
  }
}


/** Fire: ember fountain */
function drawFireWin(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, w, h);
  if (Math.random() < 0.25) spawn();
  updateParticles(particles, -0.12);
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size * (1 - p.life / p.maxLife)), 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue},100%,65%,${alpha})`;
    ctx.fill();
  }
}

/** Ice: snowflake shower */
function drawIceWin(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, w, h);
  if (Math.random() < 0.12) spawn();
  updateParticles(particles, 0.05);
  ctx.strokeStyle = "rgba(180,230,255,0.75)";
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    strokeSnowflake(ctx, p.x, p.y, p.size, p.extra! + p.life * 0.02);
  }
  ctx.globalAlpha = 1;
}

/** Spicy: shower of 🍆 🍑 💦 */
function drawSpicyWin(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], spawn: () => void) {
  ctx.clearRect(0, 0, w, h);
  if (Math.random() < 0.18) spawn();
  updateParticles(particles, 0.12);
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.extra! + p.life * 0.05);
    const kind = Math.floor(p.hue / 120) % 3;
    if (kind === 0) {
      ctx.fillStyle = `rgba(100,30,160,${alpha})`;
      drawEggplant(ctx, 0, 0, p.size);
    } else if (kind === 1) {
      ctx.fillStyle = `rgba(255,130,70,${alpha})`;
      drawPeach(ctx, 0, 0, p.size);
    } else {
      ctx.fillStyle = `rgba(120,190,255,${alpha * 0.9})`;
      drawDrops(ctx, 0, 0, p.size);
    }
    ctx.restore();
  }
}

// ─── hue sets per theme ───────────────────────────────────────────────────────

const WIN_HUES: Record<string, number[]> = {
  rainbow: [0, 30, 60, 120, 180, 240, 270, 300],
  love:    [340, 350, 360, 10, 20],
  scary:   [20, 30, 270, 280],
  space:   [200, 220, 260, 280],
  ocean:   [185, 195, 200, 210],
  neon:    [150, 290, 300],
  flowers: [300, 320, 340, 80, 100, 200],
  fire:    [0, 15, 30, 40],
  ice:     [195, 205, 215],
  spicy:   [0, 60, 120, 180, 240, 300],
};

const WIN_DRAW: Record<string, WinDrawFn> = {
  rainbow: drawRainbowWin,
  love:    drawLoveWin,
  scary:   drawScaryWin,
  space:   drawSpaceWin,
  ocean:   drawOceanWin,
  neon:    drawNeonWin,
  flowers: drawNatureWin,
  fire:    drawFireWin,
  ice:     drawIceWin,
  spicy:   drawSpicyWin,
};

// ─── component ────────────────────────────────────────────────────────────────

export function ThemeWin({ active }: Props) {
  const theme     = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      particles.current = [];
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    particles.current = [];
    const cleanupResize = setupFullscreenCanvas(canvas);
    const hues   = WIN_HUES[theme.id] ?? WIN_HUES.rainbow;
    const drawFn = WIN_DRAW[theme.id] ?? drawRainbowWin;

    const cssW = () => canvas.width / (window.devicePixelRatio || 1);
    const cssH = () => canvas.height / (window.devicePixelRatio || 1);

    const spawn = () => {
      const newParticles = burst(cssW(), cssH(), hues, 8, 1);
      particles.current.push(...newParticles);
    };

    // immediate first burst
    for (let i = 0; i < 4; i++) spawn();

    function loop() {
      drawFn(ctx!, cssW(), cssH(), particles.current, spawn);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      cleanupResize();
    };
  }, [active, theme.id]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        opacity: active ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    />
  );
}
