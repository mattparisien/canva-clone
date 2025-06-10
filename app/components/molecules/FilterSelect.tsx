"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/atoms/select"
import { Filter } from "lucide-react"

export interface FilterOption {
  value: string
  label: string
}

export interface FilterSelectProps {
  value?: string
  options: FilterOption[]
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  width?: string
  className?: string
}

export function FilterSelect({
  value,
  options,
  onChange,
  placeholder = "Filter",
  disabled = false,
  width = "w-[130px]",
  className = ""
}: FilterSelectProps) {
  if (options.length === 0) return null

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={`${width} ${className}`}>
        <Filter className="h-4 w-4 mr-2" />
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
