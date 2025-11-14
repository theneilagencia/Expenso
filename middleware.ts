import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("sb-access-token");

  const protectedPaths = ["/dashboard", "/onboarding"];

  if (protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p))) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"]
};
