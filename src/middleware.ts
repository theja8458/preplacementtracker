import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CURRENT_TERMS_VERSION } from "@/lib/constants";

const protectedRoutes = [
  "/dashboard",
  "/tracker",
  "/leaderboard",
  "/discuss",
  "/companies",
  "/onboarding",
  "/foundations",
  "/profile",
];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // /terms/view is always public (no auth required)
  if (pathname.startsWith("/terms/view")) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Not authenticated → redirect to landing
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Authenticated but terms not accepted → redirect to /terms
  // (Allow /terms itself through so they can actually accept)
  if (token && pathname.startsWith("/terms")) {
    // Already on the terms page — let them through
    return NextResponse.next();
  }

  if (token && isProtected) {
    const acceptedVersion = (token as any).termsAcceptedVersion as string | null;
    if (acceptedVersion !== CURRENT_TERMS_VERSION) {
      return NextResponse.redirect(new URL("/terms", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tracker/:path*",
    "/leaderboard/:path*",
    "/discuss/:path*",
    "/companies/:path*",
    "/onboarding/:path*",
    "/foundations/:path*",
    "/profile/:path*",
    "/terms/:path*",
  ],
};
