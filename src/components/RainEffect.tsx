import { useEffect, useRef } from "react";

interface RainEffectProps {
  intensity: number;
}

interface GlassDrop {
  x: number;
  y: number;
  r: number;
  slideSpeed: number;
  sliding: boolean;
  stuckTime: number;
  stuckMax: number;
  trail: { x: number; y: number; r: number; age: number }[];
  wobblePhase: number;
  mass: number;
}

const RainEffect = ({ intensity }: RainEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<GlassDrop[]>([]);
  const animRef = useRef<number>(0);
  const intensityRef = useRef(intensity);

  useEffect(() => { intensityRef.current = intensity; }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const createDrop = (x?: number, y?: number): GlassDrop => {
      const r = 2 + Math.random() * 5;
      return {
        x: x ?? Math.random() * canvas.width,
        y: y ?? Math.random() * canvas.height * 0.1,
        r, slideSpeed: 0, sliding: false,
        stuckTime: 0, stuckMax: 80 + Math.random() * 400,
        trail: [], wobblePhase: Math.random() * Math.PI * 2, mass: r,
      };
    };

    // Seed
    for (let i = 0; i < 50; i++) {
      const d = createDrop(); d.y = Math.random() * canvas.height;
      d.stuckTime = Math.random() * d.stuckMax;
      d.r = 1 + Math.random() * 3.5;
      d.stuckMax = 9999; // tiny static drops
      dropsRef.current.push(d);
    }

    const drawDrop = (d: GlassDrop) => {
      const { x, y, r } = d;

      // Wet trail (very thin streaks)
      if (d.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(d.trail[0].x, d.trail[0].y);
        for (let i = 1; i < d.trail.length; i++) {
          ctx.lineTo(d.trail[i].x, d.trail[i].y);
        }
        ctx.strokeStyle = `rgba(180, 210, 235, 0.06)`;
        ctx.lineWidth = Math.max(1, r * 0.35);
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Drop shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x + 0.5, y + 0.8, r * 0.85, r * 0.95, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, 0.12)`;
      ctx.fill();
      ctx.restore();

      // Main body — glass-like refraction
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y, r * 0.95, r * 1.05, 0, 0, Math.PI * 2);
      // Very subtle fill simulating light bending through water
      const bg = ctx.createRadialGradient(x - r * 0.15, y - r * 0.15, 0, x, y, r);
      bg.addColorStop(0, `rgba(255, 255, 255, 0.03)`);
      bg.addColorStop(0.4, `rgba(200, 220, 240, 0.05)`);
      bg.addColorStop(0.8, `rgba(170, 200, 230, 0.1)`);
      bg.addColorStop(1, `rgba(150, 185, 220, 0.14)`);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.restore();

      // Specular highlight — crescent on top-left
      ctx.save();
      ctx.beginPath();
      const hlR = r * 0.3;
      ctx.ellipse(x - r * 0.28, y - r * 0.32, hlR * 1.3, hlR * 0.7, -0.5, 0, Math.PI * 2);
      const hlG = ctx.createRadialGradient(x - r * 0.28, y - r * 0.32, 0, x - r * 0.28, y - r * 0.32, hlR);
      hlG.addColorStop(0, `rgba(255, 255, 255, 0.85)`);
      hlG.addColorStop(0.4, `rgba(255, 255, 255, 0.3)`);
      hlG.addColorStop(1, `rgba(255, 255, 255, 0)`);
      ctx.fillStyle = hlG;
      ctx.fill();
      ctx.restore();

      // Tiny secondary highlight
      if (r > 3) {
        ctx.beginPath();
        ctx.arc(x + r * 0.18, y + r * 0.25, r * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.35)`;
        ctx.fill();
      }

      // Bottom edge darkening (lens effect)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y, r * 0.95, r * 1.05, 0, 0, Math.PI * 2);
      const lens = ctx.createLinearGradient(x, y - r, x, y + r * 1.1);
      lens.addColorStop(0, `rgba(255, 255, 255, 0)`);
      lens.addColorStop(0.6, `rgba(0, 0, 0, 0)`);
      lens.addColorStop(1, `rgba(0, 0, 0, 0.06)`);
      ctx.fillStyle = lens;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const int = intensityRef.current;
      const drops = dropsRef.current;

      // Spawn new drops
      if (Math.random() < 0.02 + int * 0.2) {
        const d = createDrop();
        d.r = 2 + Math.random() * (3 + int * 6);
        d.mass = d.r;
        drops.push(d);
      }

      // Big sliding drops
      if (Math.random() < int * 0.03) {
        const d = createDrop();
        d.r = 5 + Math.random() * 8 * int;
        d.mass = d.r * 1.5;
        d.sliding = true;
        d.slideSpeed = 0.5 + Math.random() * 1.5;
        drops.push(d);
      }

      // Keep some tiny static drops
      const staticCount = drops.filter(d => !d.sliding && d.stuckMax > 5000).length;
      if (staticCount < 25 + int * 40 && Math.random() < 0.05) {
        const d = createDrop(Math.random() * canvas.width, Math.random() * canvas.height);
        d.r = 1 + Math.random() * 2.5;
        d.stuckMax = 99999;
        drops.push(d);
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];

        if (!d.sliding) {
          d.stuckTime++;
          if (d.stuckTime > d.stuckMax || d.mass > 10 + (1 - int) * 6) {
            d.sliding = true;
            d.slideSpeed = 0.2 + d.mass * 0.04;
          }
        }

        if (d.sliding) {
          d.slideSpeed += 0.015 + d.mass * 0.002;
          d.slideSpeed = Math.min(d.slideSpeed, 2.5 + d.mass * 0.2);
          d.wobblePhase += 0.04;
          d.x += Math.sin(d.wobblePhase) * 0.15;
          d.y += d.slideSpeed;

          // Trail
          d.trail.push({ x: d.x, y: d.y, r: d.r, age: 0 });
          if (d.trail.length > 80) d.trail.shift();

          // Random pause (surface tension)
          if (Math.random() < 0.006) {
            d.slideSpeed *= 0.15;
          }

          // Shrink slightly as it slides (leaves water behind)
          d.r *= 0.9997;
        }

        // Age trail
        for (const t of d.trail) t.age++;
        d.trail = d.trail.filter(t => t.age < 250);

        // Merge
        for (let j = i - 1; j >= 0; j--) {
          const o = drops[j];
          const dx = d.x - o.x, dy = d.y - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < d.r + o.r) {
            if (d.r >= o.r) {
              d.r = Math.min(Math.sqrt(d.r * d.r + o.r * o.r), 18);
              d.mass += o.mass;
              if (!d.sliding && o.sliding) { d.sliding = true; d.slideSpeed = o.slideSpeed; }
              drops.splice(j, 1); i--;
            } else {
              o.r = Math.min(Math.sqrt(d.r * d.r + o.r * o.r), 18);
              o.mass += d.mass;
              if (!o.sliding && d.sliding) { o.sliding = true; o.slideSpeed = d.slideSpeed; }
              drops.splice(i, 1); break;
            }
          }
        }

        if (drops[i] && drops[i].y > canvas.height + 20) drops.splice(i, 1);
      }

      // Cap total drops
      while (drops.length > 250) drops.shift();

      // Draw static drops first, then sliding
      for (const d of drops) if (!d.sliding) drawDrop(d);
      for (const d of drops) if (d.sliding) drawDrop(d);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); dropsRef.current = []; };
  }, []);

  return <canvas ref={canvasRef} className="rain-canvas" />;
};

export default RainEffect;
