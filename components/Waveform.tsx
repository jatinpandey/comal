import { tokens as T } from "@/lib/tokens";

export function Waveform({
  w = 200,
  h = 28,
  color = T.color.mic,
  active = true,
}: {
  w?: number;
  h?: number;
  color?: string;
  active?: boolean;
}) {
  const bars = 24;
  const barWidth = w / bars;
  return (
    <svg width={w} height={h} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const seed = Math.sin(i * 1.1 + 1) * Math.cos(i * 0.4);
        const amp = active ? 0.32 + Math.abs(seed) * 0.68 : 0.25;
        const bh = amp * h * 0.85;
        return (
          <rect
            key={i}
            x={i * barWidth + 2}
            y={(h - bh) / 2}
            width={barWidth - 3}
            height={bh}
            fill={color}
            rx={1.5}
            style={
              active
                ? {
                    animation: `comal-pulse ${0.6 + (i % 4) * 0.15}s ease-in-out infinite`,
                    animationDelay: `${i * 0.04}s`,
                    transformOrigin: "center",
                  }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}
