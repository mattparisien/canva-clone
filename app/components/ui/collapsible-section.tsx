"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@utils/utils"

interface CollapsibleSectionProps {
  heading: string
  defaultOpen?: boolean
  className?: string
  headingClassName?: string
  contentClassName?: string
  children: React.ReactNode
}

export function CollapsibleSection({
  heading,
  defaultOpen = true,
  className,
  headingClassName,
  contentClassName,
  children
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const toggleSection = () => {
    setIsOpen(!isOpen)
  }
  
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    toggleSection()
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div 
        className={cn(
          "flex items-center cursor-pointer group", 
          headingClassName
        )}
        onClick={toggleSection}
      >
        <div 
          className="h-6 w-6 flex items-center justify-center rounded-full transition-colors group-hover:bg-muted mr-2"
          onClick={handleIconClick}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform" />
          )}
        </div>
        <h2 className="text-xl font-bold">{heading}</h2>
      </div>
      
      {isOpen && (
        <div className={cn("transition-all", contentClassName)}>
          {children}
        </div>
      )}
    </div>
  )
}