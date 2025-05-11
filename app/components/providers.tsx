"use client"

import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@context/auth-context"
import { AuthSessionProvider } from "./auth-session-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a new QueryClient instance
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </AuthSessionProvider>
    </QueryClientProvider>
  )
}