export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    mock: !process.env.SARVAM_API_KEY,
    polish: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
