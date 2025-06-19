"use client"

import { Input } from "@components/atoms/input"
import { Search } from "lucide-react"

export interface SearchBarProps {
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  minWidth?: string
}

export function SearchBar({
  value = "",
  placeholder = "Search...",
  onChange,
  className = "",
  disabled = false,
  minWidth = "min-w-[200px]"
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`pl-10 ${minWidth}`}
      />
    </div>
  )
}
