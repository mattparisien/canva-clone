"use client"

import React from "react"
import { SessionProvider as OriginalSessionProvider } from "next-auth/react"

// A more compatible version of SessionProvider for React 19
export function AuthSessionProvider({
  children,
  ...props
}: {
  children: React.ReactNode
  [key: string]: any
}) {
  return (
    // @ts-ignore - Force the SessionProvider to work with React 19
    <OriginalSessionProvider {...props}>
      {children}
    </OriginalSessionProvider>
  )
}