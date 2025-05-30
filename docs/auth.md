# NextAuth Authentication Implementation

This document outlines the NextAuth.js implementation for front-end authentication in the Canva Clone project.

## Features Implemented

- User authentication with credentials (email/password)
- Session management with JWT strategy
- Protected routes with middleware
- Authentication context with React hooks
- Sign-in and sign-up pages
- Authentication persistence

## Key Files

- **app/lib/auth.ts**: Contains NextAuth.js configuration options
- **app/(routes)/api/auth/[...nextauth]/route.ts**: API route handler for NextAuth
- **app/lib/types/next-auth.d.ts**: TypeScript declarations for extending NextAuth types
- **app/components/auth-session-provider.tsx**: SessionProvider wrapper for React 19
- **app/lib/context/auth-context.tsx**: React context for accessing auth state
- **middleware.ts**: Route protection middleware

## Environment Variables

The following environment variables must be set:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-for-next-auth-jwt-encryption
```

For production, make sure to set `NEXTAUTH_URL` to your production domain and generate a strong random string for `NEXTAUTH_SECRET`.

## Authentication Flow

1. User submits credentials (email/password) via the sign-in form
2. NextAuth validates credentials using the authorization function
3. On successful validation, NextAuth creates and stores a JWT token
4. Protected routes check for valid session via middleware
5. Unauthenticated users are redirected to the sign-in page

## Usage

The `useAuth()` hook provides access to authentication state and methods:

```tsx
import { useAuth } from "@/lib/context/auth-context";

function MyComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  
  // Use authentication state and methods
}
```

## Route Protection

The middleware automatically protects all routes except for authentication pages and API routes. Unauthenticated users are redirected to the sign-in page.

## Extending

To add additional authentication providers (e.g., Google, GitHub), modify the `providers` array in `app/lib/auth.ts`.