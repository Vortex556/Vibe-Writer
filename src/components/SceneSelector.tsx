import { SCENES } from "@/lib/scenes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SceneSelectorProps {
  currentSceneId: string;
  onSceneChange: (sceneId: string) => void;
}

const SceneSelector = ({ currentSceneId, onSceneChange }: SceneSelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="vibe-title mb-0">场景选择</div>
      <Select value={currentSceneId} onValueChange={onSceneChange}>
        <SelectTrigger className="w-full bg-[rgba(255,255,255,0.06)] border-[var(--vibe-divider)] text-[var(--vibe-ui-text)] text-[11px]">
          <SelectValue placeholder="选择场景" />
        </SelectTrigger>
        <SelectContent className="bg-[rgba(25,25,25,0.9)] border-[var(--vibe-divider)] text-[var(--vibe-ui-text)]">
          {SCENES.map((scene) => (
            <SelectItem key={scene.id} value={scene.id} className="text-[11px]">
              {scene.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SceneSelector;
