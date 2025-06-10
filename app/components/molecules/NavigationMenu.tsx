"use client"

import Link from "next/link"

export interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

export interface NavigationMenuProps {
  items: NavigationItem[]
  className?: string
  itemClassName?: string
  activeClassName?: string
  direction?: "horizontal" | "vertical"
  spacing?: "sm" | "md" | "lg"
}

const spacingClasses = {
  horizontal: {
    sm: "space-x-2",
    md: "space-x-4", 
    lg: "space-x-6"
  },
  vertical: {
    sm: "space-y-1",
    md: "space-y-2",
    lg: "space-y-3"
  }
}

export function NavigationMenu({
  items,
  className = "",
  itemClassName = "",
  activeClassName = "text-brand-blue font-medium",
  direction = "horizontal",
  spacing = "md"
}: NavigationMenuProps) {
  const flexDirection = direction === "horizontal" ? "flex" : "flex flex-col"
  const spacingClass = spacingClasses[direction][spacing]

  return (
    <nav className={`${flexDirection} ${spacingClass} ${className}`}>
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={`transition-colors ${
            item.isActive 
              ? activeClassName 
              : "text-gray-500 hover:text-gray-900"
          } ${itemClassName}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
