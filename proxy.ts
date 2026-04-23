import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE,
  DEVICE_COOKIE,
  authTokenFor,
  timingSafeEqual,
} from "@/lib/auth";

// Gate every route except the login page, the login API, and Next's
// internal asset paths (which the matcher below already excludes). Also
// stamp a long-lived anonymous device ID cookie so the transcribe route
// can tag log entries.

function attachDeviceCookie(res: NextResponse, req: NextRequest) {
  if (!req.cookies.get(DEVICE_COOKIE)?.value) {
    res.cookies.set(DEVICE_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname === "/api/login") {
    return attachDeviceCookie(NextResponse.next(), req);
  }

  const password = process.env.APP_PASSWORD;

  // If no password is configured, don't gate (useful for local dev without
  // setting APP_PASSWORD).
  if (!password) {
    return attachDeviceCookie(NextResponse.next(), req);
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value ?? "";
  const expected = await authTokenFor(password);

  if (cookie && timingSafeEqual(cookie, expected)) {
    return attachDeviceCookie(NextResponse.next(), req);
  }

  // API requests get a 401 JSON; page requests get redirected to /login.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return attachDeviceCookie(NextResponse.redirect(url), req);
}

export const config = {
  matcher: [
    // Match everything except Next internals and common static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
