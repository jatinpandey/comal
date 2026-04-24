// Polish dispatcher. Decides which LLM provider cleans up the raw
// transcript based on POLISH_PROVIDER ("sarvam" | "anthropic" | "off").
// Default is "sarvam" — uses SARVAM_API_KEY via the Sarvam chat completion
// endpoint. Anthropic is kept in lib/polishAnthropic.ts and stays ready
// to use once the Anthropic account is provisioned.

export interface PolishResult {
  text: string;
  model: string | null;
}

type Provider = "sarvam" | "anthropic" | "off";

function provider(): Provider {
  const raw = (process.env.POLISH_PROVIDER ?? "sarvam").toLowerCase();
  if (raw === "anthropic" || raw === "off") return raw;
  return "sarvam";
}

export async function polishTranscript(rawText: string): Promise<PolishResult> {
  const p = provider();
  if (p === "off") {
    console.log("[comal] polish skipped: POLISH_PROVIDER=off");
    return { text: rawText, model: null };
  }
  if (p === "anthropic") {
    const { polishWithAnthropic } = await import("./polishAnthropic");
    return polishWithAnthropic(rawText);
  }
  const { polishWithSarvam } = await import("./polishSarvam");
  return polishWithSarvam(rawText);
}
