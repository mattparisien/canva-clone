"use client"

import { Button } from "@components/atoms/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/atoms/tooltip"
import React from "react"

export interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  tooltipDelay?: number
}

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  isActive = false,
  disabled = false,
  variant = "outline",
  size = "icon",
  className = "",
  tooltipDelay = 100
}: ActionButtonProps) {
  return (
    <TooltipProvider delayDuration={tooltipDelay}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`rounded-xl transition-all duration-300 ${
              isActive ? 'bg-primary text-primary-foreground' : ''
            } ${className}`}
            onClick={onClick}
            disabled={disabled}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
