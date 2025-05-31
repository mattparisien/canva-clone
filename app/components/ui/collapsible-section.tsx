"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/utils"

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 text-left hover:opacity-70 transition-opacity flex items-center gap-3"
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-200 -rotate-90",
            isOpen && "rotate-0"
          )}
        />
        <h2 className="text-xl font-bold">{title}</h2>
      </button>
      {isOpen && (
        <div className="pl-8 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}