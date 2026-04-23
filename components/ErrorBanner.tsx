"use client";

import { tokens as T } from "@/lib/tokens";

export function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 220,
        zIndex: 18,
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: "#fff",
        border: `1px solid ${T.color.mic}`,
        borderLeft: `3px solid ${T.color.mic}`,
        borderRadius: 8,
        boxShadow: T.shadow.md,
        fontSize: 13,
        color: T.color.ink2,
        maxWidth: 520,
      }}
    >
      <span style={{ lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          border: "none",
          background: "transparent",
          color: T.color.mute,
          cursor: "pointer",
          fontSize: 13,
          padding: "2px 6px",
          borderRadius: 4,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
