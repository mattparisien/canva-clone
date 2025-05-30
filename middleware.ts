import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// This function can be marked `async` if using `await` inside
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // Check if the user is authenticated
    if (req.nextauth.token) {
      return NextResponse.next()
    }

    // Redirect to signin page if not authenticated
    const signinUrl = new URL('/signin', req.url)
    signinUrl.searchParams.set('returnUrl', req.nextUrl.pathname)
    return NextResponse.redirect(signinUrl)
  },
  {
    callbacks: {
      // Only run this middleware on protected routes
      authorized: ({ token }) => !!token,
    },
  }
)

// Configure protected routes that require authentication
export const config = {
  // Don't protect auth routes and api routes
  matcher: ["/((?!signin|signup|forgot-password|reset-password|api|_next/static|favicon.ico).*)"],
}