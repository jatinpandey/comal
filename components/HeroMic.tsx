"use client";

import { tokens as T } from "@/lib/tokens";
import type { SessionState } from "@/lib/tokens";
import { MicIcon } from "./icons";

export function HeroMic({
  state,
  onClick,
}: {
  state: SessionState;
  onClick?: () => void;
}) {
  const d = 88;
  const listening = state === "listening";
  const processing = state === "processing";
  const disabled = processing;
  const bg = processing
    ? T.color.soft
    : listening
      ? T.color.mic
      : T.color.ink;
  const glow = listening ? T.color.mic : T.color.ink;
  const iconColor = processing ? T.color.mute : "#fff";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={
        processing ? "Polishing" : listening ? "Stop recording" : "Start recording"
      }
      aria-disabled={disabled || undefined}
      style={{
        position: "relative",
        width: d + 40,
        height: d + 40,
        border: "none",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {listening && (
        <>
          <span
            aria-hidden
            style={{
              position: "absolute",
              width: d,
              height: d,
              borderRadius: "50%",
              background: `${glow}20`,
              animation: "comal-ring 1.6s ease-out infinite",
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              width: d,
              height: d,
              borderRadius: "50%",
              background: `${glow}12`,
              animation: "comal-ring2 1.6s ease-out .5s infinite",
            }}
          />
        </>
      )}
      {processing && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            width: d + 14,
            height: d + 14,
            borderRadius: "50%",
            border: `1.5px dashed ${T.color.mute}`,
            opacity: 0.5,
            animation: "comal-spin 4s linear infinite",
          }}
        />
      )}
      <span
        style={{
          width: d,
          height: d,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: processing
            ? "none"
            : listening
              ? T.shadow.micListen(glow)
              : T.shadow.micIdle,
          border: processing ? `1px solid ${T.color.hair}` : "none",
          transition: "background .25s, box-shadow .25s, transform .15s",
          position: "relative",
          zIndex: 1,
        }}
      >
        <MicIcon size={30} color={iconColor} />
      </span>
    </button>
  );
}
