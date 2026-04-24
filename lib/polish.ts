import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Read the spec at module load. In dev, saving polish.md triggers a
// module reload; in prod the file is bundled with the deployment.
const SPEC_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "prompts",
  "polish.md"
);
const SPEC = readFileSync(SPEC_PATH, "utf8");

let client: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (client !== undefined) return client;
  const key = process.env.ANTHROPIC_API_KEY;
  client = key ? new Anthropic({ apiKey: key }) : null;
  return client;
}

export interface PolishResult {
  text: string;
  model: string | null;
}

export async function polishTranscript(rawText: string): Promise<PolishResult> {
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
      system: SPEC,
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
    console.warn("[comal] polish failed, returning raw:", err);
    return { text: rawText, model: null };
  }
}
