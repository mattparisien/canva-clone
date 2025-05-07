import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

// Define a function to check if the path is public
function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  );
}

// Export the middleware handler with withAuth
export default withAuth(
  // withAuth augments your Request with the user's token
  function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // If the path is public, allow access
    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }
    
    // Otherwise, let the withAuth middleware handle the authentication
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Configure which routes should be protected
export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * - API routes that don't require auth
     * - Static files
     * - Public routes (/, /signin, /signup, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|signin|signup|forgot-password|reset-password).*)",
  ],
};