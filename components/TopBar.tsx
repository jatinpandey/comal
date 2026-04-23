import { tokens as T } from "@/lib/tokens";
import type { SessionState } from "@/lib/tokens";
import { MockBadge } from "./MockBadge";
import { StateIndicator } from "./StateIndicator";

export function TopBar({ sessionState }: { sessionState: SessionState }) {
  return (
    <header
      style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: `1px solid ${T.color.hair}`,
        background: T.color.panel,
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ◆
        </div>
        <span
          style={{
            fontSize: 14.5,
            fontWeight: 600,
            letterSpacing: -0.2,
            color: T.color.ink,
          }}
        >
          Comal
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StateIndicator state={sessionState} />
        <MockBadge />
      </div>
    </header>
  );
}
