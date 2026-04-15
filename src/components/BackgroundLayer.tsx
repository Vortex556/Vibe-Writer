interface BackgroundLayerProps {
  scene: string;
  focused: boolean;
}

const BackgroundLayer = ({ scene, focused }: BackgroundLayerProps) => {
  return (
    <div className="fixed inset-0 z-[1]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[2000ms] ease-in-out"
        style={{
          backgroundImage: `url('${scene}')`,
          filter: "var(--vibe-bg-filter)",
          opacity: focused ? 1 : 0.75,
        }}
      />
    </div>
  );
};

export default BackgroundLayer;
