import { Redis } from "@upstash/redis";

// Vercel's Upstash Redis integration injects KV_REST_API_URL and
// KV_REST_API_TOKEN. If either is missing we no-op — local dev and any
// environment without the integration keeps working.

let cached: Redis | null | undefined;

function getRedis(): Redis | null {
  if (cached !== undefined) return cached;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  cached = url && token ? new Redis({ url, token }) : null;
  return cached;
}

export interface LoggedTranscript {
  did: string;
  ts: number;
  text: string;
}

export async function logTranscript(entry: LoggedTranscript): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const day = new Date(entry.ts).toISOString().slice(0, 10);
  try {
    await redis.rpush(`transcripts:${day}`, JSON.stringify(entry));
  } catch (err) {
    console.warn("[comal] transcript log failed:", err);
  }
}

export async function readTranscriptsForDay(
  day: string
): Promise<LoggedTranscript[] | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.lrange(`transcripts:${day}`, 0, -1);
  return raw.map((item) => {
    // @upstash/redis may return strings or pre-parsed objects depending on
    // what was stored. Normalize either way.
    if (typeof item === "string") {
      try {
        return JSON.parse(item) as LoggedTranscript;
      } catch {
        return { did: "?", ts: 0, text: item };
      }
    }
    return item as LoggedTranscript;
  });
}
