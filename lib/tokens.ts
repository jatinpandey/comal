export const tokens = {
  color: {
    bg: "#fafaf9",
    panel: "#ffffff",
    ink: "#1f1d1a",
    ink2: "#2a2825",
    mute: "#8a8680",
    hair: "#eceae5",
    soft: "#f4f3f0",
    accent: "#6c5ce7",
    accentSoft: "#eeebff",
    mic: "#ef4444",
    ok: "#22c55e",
    kbdBorder: "#e2e0db",
  },
  font: {
    serif: '"Fraunces", Georgia, serif',
    sans: '"Inter", -apple-system, sans-serif',
    mono: "ui-monospace, SFMono-Regular, monospace",
  },
  radius: { sm: 4, md: 6, lg: 8, pill: 40 },
  shadow: {
    sm: "0 1px 3px rgba(0,0,0,.05)",
    md: "0 2px 8px rgba(0,0,0,.04)",
    micIdle: "0 6px 18px rgba(0,0,0,.18), 0 1px 3px rgba(0,0,0,.1)",
    micListen: (c: string) => `0 10px 30px ${c}55, 0 2px 6px rgba(0,0,0,.18)`,
    micProcessing: (c: string) => `0 8px 24px ${c}40, 0 2px 6px rgba(0,0,0,.15)`,
  },
} as const;

export type SessionState = "idle" | "listening" | "processing" | "post";
