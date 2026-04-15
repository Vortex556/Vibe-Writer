export type SceneEffectType =
  | "none"
  | "forest"
  | "space"
  | "seaside"
  | "deepSea"
  | "snow"
  | "rain";

export interface SceneConfig {
  id: string;
  name: string;
  background: string;
  ambience: string;
  effect: SceneEffectType;
  description: string;
}

export const SCENES: SceneConfig[] = [
  {
    id: "cafe",
    name: "咖啡馆 Cafe",
    background: "/images/cafe.png",
    ambience: "/audio/翻书声.mp3",
    effect: "none",
    description: "经典写作咖啡馆氛围",
  },
  {
    id: "forest",
    name: "森林 Forest",
    background: "/images/forest.jpg",
    ambience: "/audio/森林物语.mp3",
    effect: "none",
    description: "仅背景与森林白噪音",
  },
  {
    id: "space",
    name: "太空 Space",
    background: "/images/space.jpg",
    ambience: "/audio/漫步太空.mp3",
    effect: "space",
    description: "缓慢移动的星星",
  },
  {
    id: "seaside",
    name: "海边 Seaside",
    background: "/images/seaside.jpg",
    ambience: "/audio/阳光海滩.mp3",
    effect: "seaside",
    description: "海浪冲刷玻璃的朦胧层",
  },
  {
    id: "deep-sea",
    name: "深海 Deep Sea",
    background: "/images/deep_sea.jpg",
    ambience: "/audio/深海低语.mp3",
    effect: "deepSea",
    description: "游动鱼群影子",
  },
  {
    id: "snowy-mountain",
    name: "雪山 Snowy Mountain",
    background: "/images/snow.jpg",
    ambience: "/audio/雪国列车.mp3",
    effect: "snow",
    description: "飘落雪花",
  },
  {
    id: "rainy",
    name: "雨天 Rainy",
    background: "/images/window.jpg",
    ambience: "/audio/窗外小雨.mp3",
    effect: "rain",
    description: "雨滴流动",
  },
];

export const DEFAULT_SCENE_ID = "cafe";

export const SCENE_ASSET_HINT =
  "请将场景素材添加到 public/images 与 public/audio 目录（如 forest.jpg、space.jpg、waves.mp3 等）。";
