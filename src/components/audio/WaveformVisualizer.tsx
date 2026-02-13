import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
}

const WaveformVisualizer = ({ isPlaying, barCount = 40 }: WaveformVisualizerProps) => {
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => Math.random() * 60 + 20)
  );

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: barCount }, () => Math.random() * 60 + 20)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, barCount]);

  return (
    <div className="flex items-center justify-center gap-[2px] h-12 bg-muted/50 rounded-lg px-3">
      {heights.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-all duration-100 ${
            isPlaying ? "bg-primary" : "bg-primary/30"
          }`}
          style={{
            height: `${isPlaying ? height : height * 0.5}%`,
            transitionDuration: isPlaying ? "100ms" : "300ms",
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
