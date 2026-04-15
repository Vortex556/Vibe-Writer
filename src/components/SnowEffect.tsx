import { useEffect, useRef } from "react";

interface SnowEffectProps {
  intensity?: number;
}

interface Snowflake {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
}

const SnowEffect = ({ intensity = 0.6 }: SnowEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const flakesRef = useRef<Snowflake[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (y?: number) => {
      const maxR = 1 + intensity * 3;
      flakesRef.current.push({
        x: Math.random() * canvas.width,
        y: y ?? -10,
        r: 1 + Math.random() * maxR,
        speed: 0.5 + Math.random() * (1.1 + intensity),
        drift: -0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    };

    const seedCount = Math.floor(120 * intensity);
    for (let i = 0; i < seedCount; i++) spawn(Math.random() * canvas.height);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.5 * intensity) spawn();

      for (let i = flakesRef.current.length - 1; i >= 0; i--) {
        const f = flakesRef.current[i];
        f.phase += 0.02;
        f.y += f.speed;
        f.x += f.drift + Math.sin(f.phase) * 0.3;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();

        if (f.y > canvas.height + 20 || f.x < -20 || f.x > canvas.width + 20) {
          flakesRef.current.splice(i, 1);
        }
      }

      while (flakesRef.current.length > 260) flakesRef.current.shift();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      flakesRef.current = [];
    };
  }, [intensity]);

  return <canvas ref={canvasRef} className="rain-canvas" />;
};

export default SnowEffect;
