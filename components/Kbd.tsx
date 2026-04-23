import { tokens as T } from "@/lib/tokens";

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        border: `1px solid ${T.color.kbdBorder}`,
        background: "#fff",
        padding: "1px 6px",
        borderRadius: 4,
        fontFamily: T.font.mono,
        fontSize: 11,
        boxShadow: `0 1px 0 ${T.color.kbdBorder}`,
        color: T.color.ink2,
        lineHeight: "16px",
        verticalAlign: "baseline",
      }}
    >
      {children}
    </span>
  );
}
