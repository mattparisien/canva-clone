"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthSessionProvider } from "@/components/auth-session-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/lib/context/auth-context"
import React from "react"

// Create a new QueryClient instance
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </AuthSessionProvider>
    </QueryClientProvider>
  )
}