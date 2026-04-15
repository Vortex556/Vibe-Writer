import { useState, useRef } from "react";

const SupervisorPanel = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgSrc(URL.createObjectURL(file));
      setCollapsed(false);
    }
  };

  return (
    <div className="vibe-ui w-[195px] p-[18px]">
      <div className="flex justify-between items-center">
        <div className="vibe-title">灵感监工</div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[12px] opacity-50 hover:opacity-80 transition-opacity cursor-pointer"
          style={{ all: "unset", cursor: "pointer", fontSize: "12px", opacity: 0.5, transition: "0.3s" }}
        >
          {collapsed ? "＋" : "－"}
        </button>
      </div>

      <div
        className="overflow-hidden transition-all duration-400"
        style={{
          height: collapsed ? 0 : "auto",
          opacity: collapsed ? 0 : 1,
          maxHeight: collapsed ? 0 : 200,
        }}
      >
        <div
          className="w-full aspect-square rounded-[14px] relative flex items-center justify-center mt-2.5 overflow-hidden"
          style={{
            border: imgSrc ? "none" : "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="监工"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-[11px] opacity-30">上传我推</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default SupervisorPanel;
