import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

const AUTH_COOKIE_NAME = "toeic_token";
const GUEST_COOKIE_NAME = "toeic_guest_id";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // 1. Add Essential Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), interest-cohort=()"
  );

  // 2. Protect Admin Route at the Edge
  if (pathname.startsWith("/admin")) {
    const tokenCookie = req.cookies.get(AUTH_COOKIE_NAME);
    if (!tokenCookie?.value) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", "/admin");
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode JWT payload (payloadBase64.signature)
      const [payloadB64] = tokenCookie.value.split(".");
      if (!payloadB64) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      const payload = JSON.parse(
        Buffer.from(payloadB64, "base64url").toString("utf8")
      );
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 3. Ensure Guest Session Isolation: Assign unique Guest Cookie if neither token nor guest ID exists
  const token = req.cookies.get(AUTH_COOKIE_NAME);
  const guestId = req.cookies.get(GUEST_COOKIE_NAME);

  if (!token?.value && !guestId?.value) {
    const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    response.cookies.set({
      name: GUEST_COOKIE_NAME,
      value: newGuestId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600, // 30 days
    });
  }

  return response;
}
