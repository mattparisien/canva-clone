"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils/utils"

interface EmptyStateProps {
  icon?: ReactNode
  heading: string
  message?: ReactNode
  className?: string
  children?: ReactNode
}

export function EmptyState({ icon, heading, message, className, children }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-xl font-medium mb-2">{heading}</h3>
      {message && <p className="text-gray-500 mb-4 max-w-sm">{message}</p>}
      {children}
    </div>
  )
}

export default EmptyState
