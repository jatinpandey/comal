"use client";

import { tokens as T } from "@/lib/tokens";
import type { SessionState } from "@/lib/tokens";

export function StateIndicator({ state }: { state: SessionState }) {
  if (state !== "listening" && state !== "processing") return null;

  const listening = state === "listening";
  const color = listening ? T.color.mic : T.color.accent;
  const label = listening ? "Listening" : "Polishing";

  return (
    <span
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px 2px 7px",
        background: "#fff",
        border: `1px solid ${T.color.hair}`,
        borderRadius: 20,
        fontSize: 10.5,
        fontWeight: 500,
        color,
        fontFamily: T.font.sans,
        letterSpacing: 0.2,
        userSelect: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          background: color,
          animation: "comal-pulse 1.2s ease-in-out infinite",
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}
