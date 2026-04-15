import { useEffect, useRef } from "react";

interface SymbolRainProps {
  density?: number;
}

interface Drop {
  x: number;
  y: number;
  speed: number;
  drift: number;
  size: number;
  char: string;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,;:!?()[]{}<>+-=*/\\|_~'\"`";

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

const SymbolRain = ({ density = 1 }: SymbolRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawn = (fromTop = false): Drop => ({
      x: Math.random() * canvas.width,
      y: fromTop ? -20 - Math.random() * 120 : Math.random() * canvas.height,
      speed: 0.4 + Math.random() * 1.1 * density,
      drift: (Math.random() - 0.5) * 0.35,
      size: 11 + Math.random() * 8,
      char: randomChar(),
    });

    const resetDrop = (d: Drop) => {
      d.x = Math.random() * canvas.width;
      d.y = -20 - Math.random() * 100;
      d.speed = 0.4 + Math.random() * 1.1 * density;
      d.drift = (Math.random() - 0.5) * 0.35;
      d.size = 11 + Math.random() * 8;
      d.char = randomChar();
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const targetCount = Math.floor(Math.max(120, window.innerWidth * 0.2) * density);
    dropsRef.current = Array.from({ length: targetCount }, () => spawn(false));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;
      const repelRadius = 90;

      for (const d of dropsRef.current) {
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nearCursor = dist < repelRadius;

        if (nearCursor) {
          const strength = (repelRadius - dist) / repelRadius;
          const dirX = dx === 0 ? (Math.random() > 0.5 ? 1 : -1) : dx / Math.abs(dx);
          d.x += dirX * strength * 4.6;
          d.y += d.speed * (1.3 + strength * 1.2);
        } else {
          d.y += d.speed;
          d.x += d.drift;
        }

        if (Math.random() < 0.012) d.char = randomChar();

        if (d.y > canvas.height + 20 || d.x < -20 || d.x > canvas.width + 20) {
          resetDrop(d);
        }

        const alpha = nearCursor ? 0.72 : 0.42;
        ctx.font = `${d.size}px "Inter", "Noto Serif SC", sans-serif`;
        ctx.fillStyle = `rgba(230, 238, 255, ${alpha})`;
        ctx.fillText(d.char, d.x, d.y);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      dropsRef.current = [];
    };
  }, [density]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none" />;
};

export default SymbolRain;
