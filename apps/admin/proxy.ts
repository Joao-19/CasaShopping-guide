import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Define ONLY the routes that DO NOT need auth
// Removed '/' from here, as we want to protect the home
const publicRoutes = ["/login"];

export function proxy(request: NextRequest) {
  // Try to get the token
  // Using 'access_token' to match the web app pattern, assuming backend sets same cookie name or gateway handles it
  const token = request.cookies.get("access_token")?.value;

  // Get current path
  const { pathname } = request.nextUrl;

  // Check if current route is in the public list
  const isPublicRoute = publicRoutes.includes(pathname);

  // --- SCENARIO 1: Unlogged user trying to access PRIVATE route ---
  // If not public (e.g. / or /dashboard) and no token
  if (!isPublicRoute && !token) {
    // Redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // --- SCENARIO 2: Logged user trying to access LOGIN route ---
  // If has token and tries to enter login
  if (isPublicRoute && token) {
    // Redirect to Dashboard (Home)
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If passed all checks, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.webp$|.*\\.svg$|.*\\.avif$).*)",
  ],
};
