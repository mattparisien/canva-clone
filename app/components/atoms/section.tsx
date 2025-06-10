"use client"

import * as React from "react"
import { cn } from "@utils/utils"

interface SectionProps {
  heading?: string
  subHeading?: string
  className?: string
  headingClassName?: string
  contentClassName?: string
  children?: React.ReactNode
}

export function Section({
  heading,
  subHeading,
  className,
  headingClassName,
  contentClassName,
  children
}: SectionProps) {
  return (
    <section className={cn("container mb-10", className)}>
      {heading || subHeading && <div className={cn("flex flex-col md:mb-10 mb-5", headingClassName)}>
        {heading && <h2 className="text-2xl font-bold">{heading}</h2>}
        {subHeading && <p className="text-gray-500 text-sm">{subHeading}</p>}
      </div>}

      <div className={cn("transition-all", contentClassName)}>
        {children}
      </div>
    </section>
  )
}