// POST /api/transcribe
// Accepts a multipart form with an "audio" file (a full recording, not a
// chunk). Forwards to Sarvam Speech-to-Text. If SARVAM_API_KEY is not set,
// returns mock text so the UI is testable without a key.

import { cookies } from "next/headers";
import { DEVICE_COOKIE } from "@/lib/auth";
import { logTranscript } from "@/lib/logStore";

export const runtime = "nodejs";

const MOCK_RESPONSE =
  "This is mock transcription text. Set SARVAM_API_KEY in .env.local and restart the dev server to transcribe real audio.";

export async function POST(req: Request) {
  const form = await req.formData();
  const audio = form.get("audio");

  if (!(audio instanceof Blob)) {
    return Response.json({ error: "audio file required" }, { status: 400 });
  }

  const jar = await cookies();
  const did = jar.get(DEVICE_COOKIE)?.value ?? "unknown";

  const key = process.env.SARVAM_API_KEY;

  if (!key) {
    await new Promise((r) => setTimeout(r, 250));
    return Response.json({
      partial: MOCK_RESPONSE,
      final: true,
      mock: true,
    });
  }

  try {
    // Sarvam rejects MIME types with codec parameters (e.g.
    // "audio/webm;codecs=opus"). Re-wrap the blob with a bare Content-Type.
    const bareType = (audio.type || "audio/webm").split(";")[0].trim();
    const ext = bareType === "audio/mp4" ? "m4a" : bareType.split("/")[1] || "webm";
    const cleaned = new Blob([await audio.arrayBuffer()], { type: bareType });

    const upstream = new FormData();
    upstream.append("file", cleaned, `recording.${ext}`);
    upstream.append("model", "saaras:v3");
    // "transcribe" keeps the original language, "translate" forces English,
    // "verbatim" skips normalization.
    upstream.append("mode", process.env.SARVAM_MODE ?? "transcribe");

    const res = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: { "api-subscription-key": key },
      body: upstream,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return Response.json(
        { error: `sarvam ${res.status}`, detail: text },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      transcript?: string;
      request_id?: string;
    };
    const text = data.transcript ?? "";
    if (text) {
      await logTranscript({ did, ts: Date.now(), text });
    }
    return Response.json({ partial: text, final: true });
  } catch (err) {
    return Response.json(
      { error: "upstream_failed", detail: String(err) },
      { status: 502 }
    );
  }
}
