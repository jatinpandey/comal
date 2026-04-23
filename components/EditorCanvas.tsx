"use client";

import { tokens as T } from "@/lib/tokens";
import { Kbd } from "./Kbd";
import { TranscriptCard } from "./TranscriptCard";
import type { TranscriptItem } from "@/lib/session";

export function EditorCanvas({ items }: { items: TranscriptItem[] }) {
  const hasContent = items.length > 0;

  return (
    <main
      style={{
        flex: 1,
        overflowY: "auto",
        background: T.color.bg,
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "40px 48px 200px",
        }}
      >
        {!hasContent ? (
          <>
            <h1
              style={{
                fontFamily: T.font.serif,
                fontWeight: 400,
                fontSize: 42,
                letterSpacing: -0.8,
                color: T.color.mute,
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Transcript
            </h1>
            <p
              style={{
                fontFamily: T.font.sans,
                fontSize: 15,
                color: T.color.mute,
                marginTop: 18,
                lineHeight: 1.6,
              }}
            >
              Start writing, or hold <Kbd>Space</Kbd> and speak. Comal will
              format as you talk.
            </p>
          </>
        ) : (
          <div>
            {items.map((item) => (
              <TranscriptCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
