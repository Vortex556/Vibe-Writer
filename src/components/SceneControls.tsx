import SceneSelector from "@/components/SceneSelector";
import { SCENE_ASSET_HINT } from "@/lib/scenes";

interface SceneControlsProps {
  currentSceneId: string;
  onSceneChange: (sceneId: string) => void;
  onThemeChange: (theme: "day" | "night") => void;
  wpm: number;
  status: string;
  theme: "day" | "night";
}

const SceneControls = ({ currentSceneId, onSceneChange, onThemeChange, wpm, status, theme }: SceneControlsProps) => {
  return (
    <div className="fixed right-[30px] bottom-[30px] z-10 flex flex-col items-end gap-3">
      <div className="vibe-ui px-4 py-2 text-[11px] min-w-[220px] text-center">
        WPM: {wpm} | 状态: {status}
      </div>
      <div className="vibe-ui w-[220px] p-[18px]">
        <div className="vibe-title">环境控制</div>
        <div className="flex gap-1.5 w-full">
          <button
            className={`vibe-btn flex-1 ${theme === "day" ? "!border-[rgba(255,255,255,0.3)]" : ""}`}
            onClick={() => onThemeChange("day")}
          >
            ☀️ 白天
          </button>
          <button
            className={`vibe-btn flex-1 ${theme === "night" ? "!border-[rgba(255,255,255,0.3)]" : ""}`}
            onClick={() => onThemeChange("night")}
          >
            🌙 黑夜
          </button>
        </div>
        <div className="mt-2">
          <SceneSelector currentSceneId={currentSceneId} onSceneChange={onSceneChange} />
        </div>
        <div className="text-[9px] opacity-40 mt-2 leading-4">{SCENE_ASSET_HINT}</div>
      </div>
    </div>
  );
};

export default SceneControls;
