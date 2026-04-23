import { tokens as T } from "@/lib/tokens";

export const metadata = {
  title: "Sign in — Comal",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/", error } = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: T.color.bg,
        padding: 24,
      }}
    >
      <form
        action="/api/login"
        method="POST"
        style={{
          width: "100%",
          maxWidth: 360,
          background: T.color.panel,
          border: `1px solid ${T.color.hair}`,
          borderRadius: 12,
          padding: "28px 28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
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
            }}
          >
            ◆
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: -0.2,
              color: T.color.ink,
            }}
          >
            Comal
          </span>
        </div>

        <p
          style={{
            fontSize: 13.5,
            color: T.color.mute,
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          This instance is password-protected.
        </p>

        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          autoComplete="current-password"
          style={{
            border: `1px solid ${T.color.hair}`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            color: T.color.ink,
            background: T.color.bg,
          }}
        />

        {error && (
          <div
            style={{
              fontSize: 12.5,
              color: T.color.mic,
            }}
          >
            Incorrect password.
          </div>
        )}

        <button
          type="submit"
          style={{
            border: "none",
            background: T.color.ink,
            color: "#fff",
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
