import RainEffect from "@/components/RainEffect";
import SnowEffect from "@/components/SnowEffect";
import type { SceneEffectType } from "@/lib/scenes";

interface SceneEffectsProps {
  effect: SceneEffectType;
  intensity: number;
}

const SceneEffects = ({ effect, intensity }: SceneEffectsProps) => {
  const starCount = Math.max(18, Math.round(20 + intensity * 70));
  const fishCount = Math.max(4, Math.round(4 + intensity * 8));

  return (
    <>
      {effect === "rain" && <RainEffect intensity={intensity} />}
      {effect === "snow" && <SnowEffect intensity={Math.max(0.1, intensity)} />}
      {effect === "space" && (
        <div className="scene-effect-stars" style={{ opacity: 0.25 + intensity * 0.75 }}>
          {Array.from({ length: starCount }).map((_, i) => (
            <span key={`star-${i}`} className="star" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 8) * 0.4}s` }} />
          ))}
        </div>
      )}
      {effect === "seaside" && <div className="scene-effect-seaside" style={{ opacity: 0.3 + intensity * 0.7 }} />}
      {effect === "deepSea" && (
        <div className="scene-effect-deepsea" style={{ opacity: 0.25 + intensity * 0.75 }}>
          {Array.from({ length: fishCount }).map((_, i) => (
            <span key={`fish-${i}`} className="fish-shadow" style={{ top: `${15 + i * 10}%`, animationDelay: `${i * 1.2}s` }} />
          ))}
        </div>
      )}
    </>
  );
};

export default SceneEffects;
