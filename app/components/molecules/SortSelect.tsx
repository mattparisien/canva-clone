"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/atoms/select"
import { SlidersHorizontal } from "lucide-react"

export interface SortOption {
  value: string
  label: string
}

export interface SortSelectProps {
  value?: string
  options: SortOption[]
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  width?: string
  className?: string
}

export function SortSelect({
  value,
  options,
  onChange,
  placeholder = "Sort",
  disabled = false,
  width = "w-[130px]",
  className = ""
}: SortSelectProps) {
  if (options.length === 0) return null

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={`${width} ${className}`}>
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
