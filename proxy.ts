import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, authTokenFor, timingSafeEqual } from "@/lib/auth";

// Gate every route except the login page, the login API, and Next's
// internal asset paths (which the matcher below already excludes).

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname === "/api/login") {
    return NextResponse.next();
  }

  const password = process.env.APP_PASSWORD;

  // If no password is configured, don't gate (useful for local dev without
  // setting APP_PASSWORD).
  if (!password) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value ?? "";
  const expected = await authTokenFor(password);

  if (cookie && timingSafeEqual(cookie, expected)) {
    return NextResponse.next();
  }

  // API requests get a 401 JSON; page requests get redirected to /login.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match everything except Next internals and common static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
