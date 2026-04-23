"use client";

import { useState } from "react";
import { tokens as T } from "@/lib/tokens";
import type { TranscriptItem } from "@/lib/session";

function formatTime(ms: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(ms);
}

function CopyIcon({ size = 13, color = T.color.mute }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TranscribingDots() {
  return (
    <span
      aria-label="Transcribing"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        color: T.color.mute,
        fontSize: 15,
        fontStyle: "italic",
      }}
    >
      Transcribing
      <span style={{ display: "inline-flex", gap: 3, marginLeft: 4 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: 3,
              background: T.color.mute,
              animation: `comal-pulse 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.18}s`,
              display: "inline-block",
            }}
          />
        ))}
      </span>
    </span>
  );
}

export function TranscriptCard({ item }: { item: TranscriptItem }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard blocked — silent
    }
  };

  const isReady = item.status === "ready";
  const isError = item.status === "error";

  return (
    <article
      style={{
        border: `1px solid ${T.color.hair}`,
        background: T.color.panel,
        borderRadius: 10,
        padding: "16px 20px 18px",
        marginBottom: 14,
        position: "relative",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
          minHeight: 18,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: T.color.mute,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {formatTime(item.createdAt)}
        </span>
        {isReady && (
          <button
            onClick={copy}
            aria-label="Copy transcript"
            style={{
              border: "none",
              background: "transparent",
              color: copied ? T.color.ok : T.color.mute,
              fontSize: 11.5,
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 6px",
              borderRadius: 5,
              fontFamily: "inherit",
              transition: "color .15s",
            }}
          >
            <CopyIcon color={copied ? T.color.ok : T.color.mute} />
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </header>

      <div
        style={{
          fontFamily: T.font.sans,
          fontSize: 16,
          lineHeight: 1.75,
          color: T.color.ink2,
        }}
      >
        {item.status === "transcribing" && <TranscribingDots />}
        {isReady && item.text}
        {isError && (
          <span style={{ color: T.color.mic, fontSize: 14 }}>
            {item.errorMessage ?? "Something went wrong."}
          </span>
        )}
      </div>
    </article>
  );
}
