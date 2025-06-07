"use client"

import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"
import {
  Filter,
  Grid3x3,
  List,
  Search,
  SlidersHorizontal
} from "lucide-react"
import React from "react"

export type ViewMode = "grid" | "list"

export interface ControlAction {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
}

export interface FilterOption {
  value: string
  label: string
}

export interface SortOption {
  value: string
  label: string
}

export interface StickyControlsBarProps {
  // Show condition - when to display the bar
  showCondition?: boolean
  
  // Search functionality
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
  
  // Filter functionality
  filterValue?: string
  filterOptions?: FilterOption[]
  onFilterChange?: (value: string) => void
  showFilter?: boolean
  filterLabel?: string
  
  // Sort functionality
  sortValue?: string
  sortOptions?: SortOption[]
  onSortChange?: (value: string) => void
  showSort?: boolean
  sortLabel?: string
  
  // View mode toggle
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  showViewToggle?: boolean
  
  // Custom actions
  customActions?: ControlAction[]
  
  // Layout options
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  
  // Styling
  className?: string
  containerClassName?: string
  
  // Positioning
  stickyTop?: string
  zIndex?: string
}

export function StickyControlsBar({
  showCondition = true,
  searchValue = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  showSearch = false,
  filterValue,
  filterOptions = [],
  onFilterChange,
  showFilter = false,
  filterLabel = "Filter",
  sortValue,
  sortOptions = [],
  onSortChange,
  showSort = false,
  sortLabel = "Sort",
  viewMode = "grid",
  onViewModeChange,
  showViewToggle = true,
  customActions = [],
  leftContent,
  rightContent,
  className = "",
  containerClassName = "",
  stickyTop = "top-16",
  zIndex = "z-40"
}: StickyControlsBarProps) {
  if (!showCondition) return null

  const hasLeftSection = showSearch || leftContent
  const hasRightSection = showFilter || showSort || showViewToggle || customActions.length > 0 || rightContent

  return (
    <div className={`sticky ${stickyTop} ${zIndex} -mx-4 px-4 py-3 mb-8 backdrop-blur-sm border-b border-gray-100 ${className}`}>
      <div className={`container mx-auto max-w-7xl ${containerClassName}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Left section */}
          {hasLeftSection && (
            <div className="flex items-center gap-3">
              {/* Search */}
              {showSearch && onSearchChange && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 min-w-[200px]"
                  />
                </div>
              )}
              
              {/* Custom left content */}
              {leftContent}
            </div>
          )}

          {/* Right section */}
          {hasRightSection && (
            <div className="flex items-center gap-3 ml-auto">
              
              {/* Filter */}
              {showFilter && filterOptions.length > 0 && onFilterChange && (
                <Select value={filterValue} onValueChange={onFilterChange}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={filterLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Sort */}
              {showSort && sortOptions.length > 0 && onSortChange && (
                <Select value={sortValue} onValueChange={onSortChange}>
                  <SelectTrigger className="w-[130px]">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={sortLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* View mode toggle */}
              {showViewToggle && onViewModeChange && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl transition-all duration-300"
                        onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")}
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
              )}

              {/* Custom actions */}
              {customActions.map((action, index) => (
                <TooltipProvider key={index} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-xl transition-all duration-300 ${
                          action.isActive ? 'bg-primary text-primary-foreground' : ''
                        }`}
                        onClick={action.onClick}
                        disabled={action.disabled}
                      >
                        <action.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{action.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

              {/* Custom right content */}
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
