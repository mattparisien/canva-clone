"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@utils/utils"

interface SectionProps {
  heading?: string
  defaultOpen?: boolean
  isCollapsible?: boolean
  className?: string
  headingClassName?: string
  contentClassName?: string
  children?: React.ReactNode
}

export function Section({
  heading,
  defaultOpen = true,
  isCollapsible = false,
  className,
  headingClassName,
  contentClassName,
  children
}: SectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const toggleSection = () => {
    if (isCollapsible) {
      setIsOpen(!isOpen)
    }
  }

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    toggleSection()
  }

  return (
    <section className={cn("mb-10", className)}>
      <div
        className={cn(
          "flex items-center cursor-pointer group",
          headingClassName
        )}
        onClick={toggleSection}
      >
        {isCollapsible && <div
          className="h-6 w-6 flex items-center justify-center rounded-full transition-colors group-hover:bg-muted mr-2"
          onClick={handleIconClick}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform" />
          )}
        </div>}
        <h2 className="text-2xl font-bold">{heading}</h2>
      </div>

      {isOpen && (
        <div className={cn("transition-all", contentClassName)}>
          {children}
        </div>
      )}
    </section>
  )
}