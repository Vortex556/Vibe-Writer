import { useState, useRef, useCallback } from "react";

interface Track {
  name: string;
  src: string;
  category: string;
}

const defaultTracks: Track[] = [
  { name: "滩浪细语", src: "/audio/滩浪细语.mp3", category: "genre" },
  { name: "霓虹雨幕", src: "/audio/霓虹雨幕.mp3", category: "genre" },
  { name: "窗外（钢琴）", src: "/audio/窗外（钢琴）.mp3", category: "genre" },
  { name: "地下酒吧", src: "/audio/地下酒吧.mp3", category: "genre" },
  { name: "江南（钢琴）", src: "/audio/江南（钢琴）.mp3", category: "genre" },
  { name: "旧光", src: "/audio/旧光.mp3", category: "genre" },
  { name: "蔷薇（钢琴）", src: "/audio/蔷薇（钢琴）.mp3", category: "genre" },
  { name: "23-ASE HK 86", src: "/audio/23-ASE HK 86.mp3", category: "game" },
  { name: "Daughter", src: "/audio/Daughter.mp3", category: "game" },
  { name: "Golden Hour", src: "/audio/Golden Hour.mp3", category: "game" },
  { name: "Island", src: "/audio/Island.mp3", category: "game" },
  { name: "Max & Chloe", src: "/audio/Max & Chloe.mp3", category: "game" },
  { name: "The Last of Us", src: "/audio/The Last of Us.mp3", category: "game" },
  { name: "在我变成你之前", src: "/audio/在我变成你之前.mp3", category: "game" },
  { name: "终末路", src: "/audio/终末路.mp3", category: "game" },
];

interface MusicPanelProps {
  volume: number;
  onVolumeChange: (v: number) => void;
}

const MusicPanel = ({ volume, onVolumeChange }: MusicPanelProps) => {
  const [activeTrack, setActiveTrack] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [customTracks, setCustomTracks] = useState<Track[]>([]);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(track.src);
    audio.loop = true;
    audio.volume = volume;
    audio.play();
    audioRef.current = audio;
    setActiveTrack(track.name);
    setIsPlaying(true);
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Update volume on audio element
  if (audioRef.current) {
    audioRef.current.volume = volume;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setCustomTracks((prev) => [...prev, { name: file.name.replace(/\.[^/.]+$/, ""), src: url, category: "custom" }]);
    });
  };

  const toggleCat = (cat: string) => setCollapsedCats((p) => ({ ...p, [cat]: !p[cat] }));

  const genreTracks = defaultTracks.filter((t) => t.category === "genre");
  const gameTracks = defaultTracks.filter((t) => t.category === "game");

  const renderTrack = (track: Track) => (
    <li
      key={track.name + track.src}
      className={`py-1.5 px-3 text-[11px] rounded-md cursor-pointer transition-all ${
        activeTrack === track.name ? "opacity-100 bg-[rgba(255,255,255,0.08)]" : "opacity-50 hover:opacity-75"
      }`}
      onClick={() => playTrack(track)}
    >
      {track.name}
    </li>
  );

  return (
    <div className="vibe-ui w-[195px] p-[18px]">
      <div className="flex justify-between items-center">
        <div className="vibe-title">灵感曲库</div>
        <label className="text-[12px] opacity-50 cursor-pointer hover:opacity-80 transition-opacity">
          ＋
          <input type="file" multiple accept="audio/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="max-h-[220px] overflow-y-auto mt-2.5 pr-1 vibe-scroll">
        <div>
          <div className="text-[10px] p-2 bg-[rgba(255,255,255,0.03)] rounded-lg cursor-pointer flex justify-between mb-1" onClick={() => toggleCat("genre")}>
            曲风 / Genre <span>{collapsedCats.genre ? "▸" : "▾"}</span>
          </div>
          {!collapsedCats.genre && <ul className="list-none p-0 m-0">{genreTracks.map(renderTrack)}</ul>}
        </div>
        <div>
          <div className="text-[10px] p-2 bg-[rgba(255,255,255,0.03)] rounded-lg cursor-pointer flex justify-between mb-1" onClick={() => toggleCat("game")}>
            游戏 / Game <span>{collapsedCats.game ? "▸" : "▾"}</span>
          </div>
          {!collapsedCats.game && (
            gameTracks.length > 0 ? (
              <ul className="list-none p-0 m-0">{gameTracks.map(renderTrack)}</ul>
            ) : (
              <div className="text-[10px] opacity-35 px-3 py-2">暂无游戏分类曲目</div>
            )
          )}
        </div>
        <div>
          <div className="text-[10px] p-2 bg-[rgba(255,255,255,0.03)] rounded-lg cursor-pointer flex justify-between mb-1" onClick={() => toggleCat("custom")}>
            自定义 / Custom <span>{collapsedCats.custom ? "▸" : "▾"}</span>
          </div>
          {!collapsedCats.custom && (
            customTracks.length > 0 ? (
              <ul className="list-none p-0 m-0">{customTracks.map(renderTrack)}</ul>
            ) : (
              <div className="text-[10px] opacity-35 px-3 py-2">自定义歌单为空，点击右上角“＋”上传本地音乐</div>
            )
          )}
        </div>
      </div>

      <hr className="vibe-divider" />
      <div className="flex justify-between items-center text-[10px] my-2">
        <label>音乐状态</label>
        <button className="vibe-btn max-w-[60px]" onClick={togglePlay}>
          {isPlaying ? "暂停" : "播放"}
        </button>
      </div>
      <div className="flex justify-between items-center text-[10px] my-2">
        <label>音量</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="vibe-range w-[80px]"
        />
      </div>
    </div>
  );
};

export default MusicPanel;
