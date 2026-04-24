import Anthropic from "@anthropic-ai/sdk";
import { POLISH_SPEC } from "./polishSpec";
import type { PolishResult } from "./polish";

let client: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (client !== undefined) return client;
  const key = process.env.ANTHROPIC_API_KEY;
  client = key ? new Anthropic({ apiKey: key }) : null;
  return client;
}

export async function polishWithAnthropic(
  rawText: string
): Promise<PolishResult> {
  const c = getClient();
  if (!c) {
    console.log("[comal] polish skipped: ANTHROPIC_API_KEY not set");
    return { text: rawText, model: null };
  }

  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  const start = Date.now();

  try {
    const msg = await c.messages.create({
      model,
      max_tokens: 2048,
      system: POLISH_SPEC,
      messages: [{ role: "user", content: rawText }],
    });

    const out = msg.content
      .filter(
        (b): b is Extract<typeof b, { type: "text" }> => b.type === "text"
      )
      .map((b) => b.text)
      .join("")
      .trim();

    const elapsed = Date.now() - start;
    console.log(
      `[comal] polish ok · ${model} · ${elapsed}ms · ${rawText.length}ch → ${out.length}ch`
    );
    return { text: out || rawText, model };
  } catch (err) {
    console.warn("[comal] polish failed (anthropic), returning raw:", err);
    return { text: rawText, model: null };
  }
}
