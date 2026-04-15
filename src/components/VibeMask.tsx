const VibeMask = () => (
  <div
    className="fixed inset-0 z-[2] pointer-events-none transition-all duration-[1200ms]"
    style={{
      background: "var(--vibe-mask-bg)",
      backdropFilter: `blur(var(--vibe-mask-blur))`,
      WebkitBackdropFilter: `blur(var(--vibe-mask-blur))`,
    }}
  />
);

export default VibeMask;
