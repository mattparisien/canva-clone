"use client"

import React from "react"

// No-op auth provider since authentication is disabled
export function AuthSessionProvider({
  children,
  ...props
}: {
  children: React.ReactNode
  [key: string]: any
}) {
  return <>{children}</>
}