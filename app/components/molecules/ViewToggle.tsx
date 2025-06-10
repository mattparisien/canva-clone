"use client"

import { Button } from "@components/atoms/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/atoms/tooltip"
import { Grid3x3, List } from "lucide-react"

export type ViewMode = "grid" | "list"

export interface ViewToggleProps {
  viewMode: ViewMode
  onChange?: (mode: ViewMode) => void
  disabled?: boolean
  className?: string
  tooltipDelay?: number
}

export function ViewToggle({
  viewMode,
  onChange,
  disabled = false,
  className = "",
  tooltipDelay = 100
}: ViewToggleProps) {
  const handleToggle = () => {
    if (!onChange || disabled) return
    onChange(viewMode === "grid" ? "list" : "grid")
  }

  return (
    <TooltipProvider delayDuration={tooltipDelay}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={`rounded-xl transition-all duration-300 ${className}`}
            onClick={handleToggle}
            disabled={disabled}
          >
            {viewMode === "grid" ? (
              <Grid3x3 className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
