"use client"

export interface SelectionCounterProps {
  count: number
  singular?: string
  plural?: string
  className?: string
}

export function SelectionCounter({
  count,
  singular = "item",
  plural = "items",
  className = ""
}: SelectionCounterProps) {
  if (count === 0) return null

  const displayText = count === 1 
    ? `${count} ${singular} selected`
    : `${count} ${plural} selected`

  return (
    <span className={`text-sm font-medium text-gray-700 ${className}`}>
      {displayText}
    </span>
  )
}
