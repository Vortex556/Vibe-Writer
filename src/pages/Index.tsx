import { useState, useRef, useCallback, useEffect } from "react";
import BackgroundLayer from "@/components/BackgroundLayer";
import VibeMask from "@/components/VibeMask";
import MusicPanel from "@/components/MusicPanel";
import EditorPanel from "@/components/EditorPanel";
import SceneControls from "@/components/SceneControls";
import AISidebar from "@/components/AISidebar";
import SupervisorPanel from "@/components/SupervisorPanel";
import SceneEffects from "@/components/SceneEffects";
import { DEFAULT_SCENE_ID, SCENES } from "@/lib/scenes";

interface IndexProps {
  currentUser: string;
  currentSceneId: string;
  onSceneChange: (sceneId: string) => void;
  onLogout: () => void;
}

const Index = ({ currentUser, currentSceneId, onSceneChange, onLogout }: IndexProps) => {
  const userStoragePrefix = `vibe-user:${currentUser}`;
  const [focused, setFocused] = useState(false);
  const [theme, setTheme] = useState<"day" | "night">(
    () => (localStorage.getItem(`${userStoragePrefix}:theme`) as "day" | "night" | null) || "night"
  );
  const [musicVolume, setMusicVolume] = useState(
    () => Number(localStorage.getItem(`${userStoragePrefix}:music-volume`) || "0.3")
  );
  const [effectIntensity, setEffectIntensity] = useState(
    () => Number(localStorage.getItem(`${userStoragePrefix}:effect-intensity`) || "0.4")
  );
  const [ambienceEnabled, setAmbienceEnabled] = useState(
    () => localStorage.getItem(`${userStoragePrefix}:ambience-enabled`) !== "false"
  );
  const [typewriterEnabled, setTypewriterEnabled] = useState(
    () => localStorage.getItem(`${userStoragePrefix}:typewriter-enabled`) !== "false"
  );
  const [wpm, setWpm] = useState(0);
  const [status, setStatus] = useState("待机");
  const ambienceAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentScene = SCENES.find((item) => item.id === currentSceneId) ?? SCENES.find((item) => item.id === DEFAULT_SCENE_ID)!;

  // Theme CSS vars
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "day") {
      root.style.setProperty("--vibe-bg-filter", "brightness(1.1) saturate(1.1)");
      root.style.setProperty("--vibe-mask-bg", "rgba(255, 255, 255, 0.15)");
      root.style.setProperty("--vibe-mask-blur", "25px");
      root.style.setProperty("--vibe-ui-bg", "rgba(255, 255, 255, 0.6)");
      root.style.setProperty("--vibe-ui-text", "#333");
      root.style.setProperty("--vibe-paper-bg", "rgba(255, 255, 255, 0.9)");
      root.style.setProperty("--vibe-paper-text", "#111");
    } else {
      root.style.setProperty("--vibe-bg-filter", "brightness(0.55) contrast(1.1)");
      root.style.setProperty("--vibe-mask-bg", "rgba(0, 0, 0, 0.45)");
      root.style.setProperty("--vibe-mask-blur", "15px");
      root.style.setProperty("--vibe-ui-bg", "rgba(22, 22, 22, 0.4)");
      root.style.setProperty("--vibe-ui-text", "rgba(255, 255, 255, 0.65)");
      root.style.setProperty("--vibe-paper-bg", "rgba(255, 255, 255, 0.04)");
      root.style.setProperty("--vibe-paper-text", "rgba(255, 255, 255, 0.95)");
    }
  }, [theme]);

  // Scene ambience sound
  useEffect(() => {
    if (!ambienceAudioRef.current) {
      const audio = new Audio(currentScene.ambience);
      audio.loop = true;
      audio.volume = 0;
      ambienceAudioRef.current = audio;
    }
    const audio = ambienceAudioRef.current;
    if (audio.src !== new URL(currentScene.ambience, window.location.href).href) {
      audio.pause();
      audio.src = currentScene.ambience;
    }
    audio.volume = ambienceEnabled ? 0.08 + effectIntensity * 0.62 : 0;
    if (ambienceEnabled && audio.volume > 0.02) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentScene, effectIntensity, ambienceEnabled]);

  useEffect(() => {
    localStorage.setItem(`${userStoragePrefix}:theme`, theme);
    localStorage.setItem(`${userStoragePrefix}:music-volume`, String(musicVolume));
    localStorage.setItem(`${userStoragePrefix}:effect-intensity`, String(effectIntensity));
    localStorage.setItem(`${userStoragePrefix}:ambience-enabled`, String(ambienceEnabled));
    localStorage.setItem(`${userStoragePrefix}:typewriter-enabled`, String(typewriterEnabled));
  }, [theme, musicVolume, effectIntensity, ambienceEnabled, typewriterEnabled, userStoragePrefix]);

  const lastInputRef = useRef(Date.now());
  const charCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const handleInput = useCallback(() => {
    lastInputRef.current = Date.now();
    charCountRef.current++;
  }, []);

  const handleKeyDown = useCallback(() => {
    if (!typewriterEnabled) return;
    // Simple click sound via Web Audio
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800 + Math.random() * 400;
      gain.gain.value = 0.03;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }, [typewriterEnabled]);

  useEffect(() => {
    const interval = setInterval(() => {
      const idleMs = Date.now() - lastInputRef.current;
      const minutesPassed = (Date.now() - startTimeRef.current) / 60000;

      if (idleMs < 15000) {
        setFocused(true);
        const currentWpm = minutesPassed > 0.02 ? Math.round(charCountRef.current / minutesPassed) : 0;
        setWpm(currentWpm);
        setStatus("专注创作");
      } else {
        setFocused(false);
        setWpm(0);
        setStatus("沉思中");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen overflow-hidden relative">
      <BackgroundLayer scene={currentScene.background} focused={focused} />
      <VibeMask />
      <SceneEffects effect={currentScene.effect} intensity={effectIntensity} />

      <div className="fixed left-[30px] bottom-[30px] z-10 flex flex-col gap-[15px]">
        <div className="vibe-ui w-[195px] p-3 flex items-center justify-between">
          <div className="text-[10px] opacity-70">账号：{currentUser}</div>
          <button className="vibe-btn text-[10px] px-2 py-1" onClick={onLogout}>
            退出
          </button>
        </div>
        <SupervisorPanel />
        <MusicPanel volume={musicVolume} onVolumeChange={setMusicVolume} />
        <div className="vibe-ui w-[195px] p-[18px]">
          <div className="vibe-title">混音调节</div>
          <div className="flex justify-between items-center text-[10px] my-2">
            <label className="whitespace-nowrap">场景强度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={effectIntensity}
              onChange={(e) => setEffectIntensity(parseFloat(e.target.value))}
              className="vibe-range w-[100px]"
            />
          </div>
          <div className="text-[9px] opacity-30 text-center mt-1">
            {effectIntensity < 0.2 ? "轻柔氛围" : effectIntensity < 0.5 ? "沉浸增强" : effectIntensity < 0.8 ? "氛围饱满" : "极强临场感"}
          </div>
          <hr className="vibe-divider" />
          <div className="flex justify-between items-center text-[10px] my-2">
            <label>白噪音</label>
            <button
              className={`vibe-btn max-w-[60px] text-[10px] ${ambienceEnabled ? "!border-[rgba(255,255,255,0.3)]" : ""}`}
              onClick={() => setAmbienceEnabled(!ambienceEnabled)}
            >
              {ambienceEnabled ? "播放中" : "暂停"}
            </button>
          </div>
          <div className="flex justify-between items-center text-[10px] my-2">
            <label>打字机音效</label>
            <button
              className={`vibe-btn max-w-[50px] text-[10px] ${typewriterEnabled ? "!border-[rgba(255,255,255,0.3)]" : ""}`}
              onClick={() => setTypewriterEnabled(!typewriterEnabled)}
            >
              {typewriterEnabled ? "开" : "关"}
            </button>
          </div>
        </div>
      </div>

      <EditorPanel onInput={handleInput} onKeyDown={handleKeyDown} storageKeyPrefix={userStoragePrefix} />
      <SceneControls
        currentSceneId={currentScene.id}
        onSceneChange={onSceneChange}
        onThemeChange={setTheme}
        wpm={wpm}
        status={status}
        theme={theme}
      />
      <AISidebar />
    </div>
  );
};

export default Index;
