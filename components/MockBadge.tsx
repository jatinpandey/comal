"use client";

import { useEffect, useState } from "react";
import { tokens as T } from "@/lib/tokens";

export function MockBadge() {
  const [mock, setMock] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setMock(Boolean(d.mock));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mock) return null;

  return (
    <span
      title="SARVAM_API_KEY is not set. Transcription is returning canned text. Add the key to .env.local and restart the dev server to use real Sarvam STT."
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px 2px 7px",
        background: T.color.soft,
        border: `1px solid ${T.color.hair}`,
        borderRadius: 20,
        fontSize: 10.5,
        fontWeight: 500,
        color: T.color.mute,
        fontFamily: T.font.sans,
        letterSpacing: 0.2,
        userSelect: "none",
        cursor: "help",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          background: "#c89b3c",
          display: "inline-block",
        }}
      />
      Mock mode
    </span>
  );
}
