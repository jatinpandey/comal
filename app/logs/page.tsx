import Link from "next/link";
import { readTranscriptsForDay } from "@/lib/logStore";
import { tokens as T } from "@/lib/tokens";

export const metadata = { title: "Logs — Comal" };
export const dynamic = "force-dynamic";

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const day = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? date! : todayUTC();

  const entries = await readTranscriptsForDay(day);

  const grouped = new Map<string, typeof entries>();
  if (entries) {
    for (const e of entries) {
      const list = grouped.get(e.did) ?? [];
      list.push(e);
      grouped.set(e.did, list);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: T.color.bg,
        padding: "40px 48px 80px",
        fontFamily: T.font.sans,
        color: T.color.ink,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                fontSize: 12,
                color: T.color.mute,
                textDecoration: "none",
              }}
            >
              ← Back to Comal
            </Link>
            <h1
              style={{
                fontFamily: T.font.serif,
                fontSize: 32,
                fontWeight: 400,
                letterSpacing: -0.5,
                margin: "6px 0 0",
              }}
            >
              Logs · {day}
            </h1>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/logs?date=${shiftDay(day, -1)}`} style={navLink}>
              ← prev
            </Link>
            <form method="GET" action="/logs">
              <input
                type="date"
                name="date"
                defaultValue={day}
                style={dateInput}
              />
            </form>
            <Link href={`/logs?date=${shiftDay(day, 1)}`} style={navLink}>
              next →
            </Link>
          </nav>
        </header>

        {entries === null ? (
          <EmptyState
            title="Logs not configured"
            body="Provision an Upstash Redis store in Vercel and redeploy — KV_REST_API_URL and KV_REST_API_TOKEN need to be set."
          />
        ) : entries.length === 0 ? (
          <EmptyState
            title="Nothing recorded on this day"
            body="Either no one used the app, or it’s a future date."
          />
        ) : (
          <>
            <p style={{ color: T.color.mute, fontSize: 13, margin: "0 0 20px" }}>
              {entries.length} transcript{entries.length === 1 ? "" : "s"} from{" "}
              {grouped.size} device{grouped.size === 1 ? "" : "s"}
            </p>
            {[...grouped.entries()].map(([did, items]) => (
              <section
                key={did}
                style={{
                  border: `1px solid ${T.color.hair}`,
                  background: T.color.panel,
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: T.font.mono,
                      fontSize: 11.5,
                      color: T.color.mute,
                    }}
                    title={did}
                  >
                    device · {did.slice(0, 8)}
                  </span>
                  <span style={{ fontSize: 11.5, color: T.color.mute }}>
                    {items!.length} item{items!.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ol
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {items!.map((e, i) => (
                    <li
                      key={`${e.ts}-${i}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "90px 1fr",
                        gap: 12,
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: T.color.ink2,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: T.font.mono,
                          fontSize: 11.5,
                          color: T.color.mute,
                          paddingTop: 2,
                        }}
                      >
                        {formatTime(e.ts)}
                      </span>
                      <div>
                        <div style={{ whiteSpace: "pre-wrap" }}>{e.text}</div>
                        {e.raw && e.raw !== e.text && (
                          <details
                            style={{
                              marginTop: 4,
                              fontSize: 12,
                              color: T.color.mute,
                            }}
                          >
                            <summary style={{ cursor: "pointer" }}>
                              raw
                              {e.model ? ` · ${e.model}` : ""}
                            </summary>
                            <div
                              style={{
                                marginTop: 4,
                                whiteSpace: "pre-wrap",
                                fontStyle: "italic",
                              }}
                            >
                              {e.raw}
                            </div>
                          </details>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </>
        )}
      </div>
    </main>
  );
}

const navLink: React.CSSProperties = {
  fontSize: 12,
  color: T.color.mute,
  textDecoration: "none",
  padding: "6px 10px",
  border: `1px solid ${T.color.hair}`,
  borderRadius: 6,
  background: T.color.panel,
};

const dateInput: React.CSSProperties = {
  fontSize: 13,
  fontFamily: "inherit",
  padding: "5px 8px",
  border: `1px solid ${T.color.hair}`,
  borderRadius: 6,
  background: T.color.panel,
  color: T.color.ink,
};

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        border: `1px dashed ${T.color.hair}`,
        borderRadius: 10,
        padding: "30px 24px",
        textAlign: "center",
        color: T.color.mute,
      }}
    >
      <div style={{ fontSize: 15, color: T.color.ink2, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 13 }}>{body}</div>
    </div>
  );
}
