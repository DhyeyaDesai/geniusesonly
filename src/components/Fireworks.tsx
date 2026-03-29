import { useRef, useEffect } from "react";

type Point = { x: number; y: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  hue: number;
  size: number;
  trail: Point[];
};

function createBurst(x: number, y: number, particles: Particle[]) {
  const hue = Math.random() * 360;
  const count = 70 + Math.floor(Math.random() * 30);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
    const speed = 1.5 + Math.random() * 5.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.006 + Math.random() * 0.01,
      hue: hue + Math.random() * 60 - 30,
      size: 2 + Math.random() * 2.5,
      trail: [],
    });
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 7) p.trail.shift();

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.vx *= 0.986;
    p.vy *= 0.986;
    p.life -= p.decay;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    for (let j = 0; j < p.trail.length; j++) {
      const alpha = (j / p.trail.length) * p.life * 0.3;
      ctx.beginPath();
      ctx.arc(p.trail[j].x, p.trail[j].y, p.size * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},100%,60%,${alpha})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue},100%,68%,${p.life})`;
    ctx.fill();
  }
}

export function Fireworks({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    let launchCount = 0;
    let animId: number;

    // Note: pending setTimeout callbacks from the launch chain are not cancelled on
    // unmount — they push into the local `particles` array which is GC'd. Benign for
    // the current usage (active only flips true once per game session).
    const launch = () => {
      createBurst(
        canvas.width * (0.1 + Math.random() * 0.8),
        canvas.height * (0.1 + Math.random() * 0.5),
        particles
      );
      launchCount++;
      if (launchCount < 22) setTimeout(launch, 180 + Math.random() * 320);
    };
    setTimeout(launch, 50);

    const draw = () => {
      ctx.fillStyle = "rgba(13,13,26,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawParticles(ctx, particles);
      if (particles.length > 0 || launchCount < 22) {
        animId = requestAnimationFrame(draw);
      }
    };
    draw();

    return () => cancelAnimationFrame(animId);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 6,
      }}
    />
  );
}
