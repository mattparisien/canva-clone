"use client"

import { Button } from "@components/atoms/button"
import { Loader2 } from "lucide-react"
import React from "react"

export interface ActionItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "ghost" | "outline" | "default" | "destructive" | "secondary" | "link"
}

export interface ActionButtonGroupProps {
  actions: ActionItem[]
  disabled?: boolean
  className?: string
  buttonClassName?: string
  spacing?: "sm" | "md" | "lg"
}

const spacingClasses = {
  sm: "gap-1",
  md: "gap-2", 
  lg: "gap-3"
}

export function ActionButtonGroup({
  actions,
  disabled = false,
  className = "",
  buttonClassName = "",
  spacing = "md"
}: ActionButtonGroupProps) {
  if (actions.length === 0) return null

  return (
    <div className={`flex items-center ${spacingClasses[spacing]} ${className}`}>
      {actions.map((action, index) => (
        <Button
          key={index}
          size="icon"
          variant={action.variant || "ghost"}
          onClick={action.onClick}
          disabled={disabled || action.disabled || action.loading}
          className={`rounded-md ${buttonClassName}`}
        >
          {action.loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <action.icon className="h-5 w-5" />
          )}
        </Button>
      ))}
    </div>
  )
}
