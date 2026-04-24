import { POLISH_SPEC } from "./polishSpec";
import type { PolishResult } from "./polish";

// Sarvam's chat completion endpoint is OpenAI-compatible. Same
// `api-subscription-key` header as the speech-to-text endpoints.
// Reference: https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/chat-completion/overview

const ENDPOINT = "https://api.sarvam.ai/v1/chat/completions";

interface ChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
}

export async function polishWithSarvam(
  rawText: string
): Promise<PolishResult> {
  const key = process.env.SARVAM_API_KEY;
  if (!key) {
    console.log("[comal] polish skipped: SARVAM_API_KEY not set");
    return { text: rawText, model: null };
  }

  const model = process.env.SARVAM_LLM_MODEL ?? "sarvam-m";
  const start = Date.now();

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "api-subscription-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        temperature: 0.2,
        messages: [
          { role: "system", content: POLISH_SPEC },
          { role: "user", content: rawText },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(
        `[comal] polish failed (sarvam ${res.status}): ${body.slice(0, 300)}`
      );
      return { text: rawText, model: null };
    }

    const data = (await res.json()) as ChatCompletionResponse;
    const raw = data.choices?.[0]?.message?.content ?? "";
    // sarvam-m is a reasoning model that prefixes its answer with
    // <think>...</think>. Strip any such blocks before returning.
    const out = raw
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/^[\s\S]*?<\/think>/i, "")
      .trim();

    const elapsed = Date.now() - start;
    console.log(
      `[comal] polish ok · ${model} · ${elapsed}ms · ${rawText.length}ch → ${out.length}ch`
    );
    return { text: out || rawText, model };
  } catch (err) {
    console.warn("[comal] polish failed (sarvam), returning raw:", err);
    return { text: rawText, model: null };
  }
}
