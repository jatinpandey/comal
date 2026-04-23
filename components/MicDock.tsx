"use client";

import { tokens as T } from "@/lib/tokens";
import type { SessionState } from "@/lib/tokens";
import { HeroMic } from "./HeroMic";
import { Waveform } from "./Waveform";
import { Kbd } from "./Kbd";

const STATUS: Record<SessionState, { label: string; color: string }> = {
  idle: { label: "Tap to speak", color: "#8a8680" },
  listening: { label: "Listening…", color: "#ef4444" },
  processing: { label: "Polishing…", color: "#8a8680" },
  post: { label: "Tap to continue", color: "#8a8680" },
};

export function MicDock({
  state,
  onMic,
}: {
  state: SessionState;
  onMic: () => void;
}) {
  const status = STATUS[state];
  const isActive = state === "listening";

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "18px 20px 24px",
        background: T.color.panel,
        borderTop: `1px solid ${T.color.hair}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        zIndex: 15,
      }}
    >
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 200,
        }}
      >
        {isActive ? (
          <Waveform w={200} h={28} color={T.color.mic} active />
        ) : (
          <span
            style={{
              fontSize: 13,
              color: T.color.mute,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Hold <Kbd>Space</Kbd> to talk · or tap
          </span>
        )}
      </div>

      <HeroMic state={state} onClick={onMic} />

      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: status.color,
          minWidth: 110,
          textAlign: "center",
        }}
      >
        {status.label}
      </div>
    </div>
  );
}
