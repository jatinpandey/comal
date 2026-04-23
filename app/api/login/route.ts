import { cookies } from "next/headers";
import { AUTH_COOKIE, authTokenFor, timingSafeEqual } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const submitted = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");

  const password = process.env.APP_PASSWORD;
  if (!password) {
    return Response.json({ error: "auth not configured" }, { status: 500 });
  }

  const submittedToken = await authTokenFor(submitted);
  const expected = await authTokenFor(password);

  if (!timingSafeEqual(submittedToken, expected)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", next);
    url.searchParams.set("error", "1");
    return Response.redirect(url, 303);
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Only allow redirecting to same-origin paths.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return Response.redirect(new URL(safeNext, req.url), 303);
}
