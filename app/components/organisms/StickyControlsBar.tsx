"use client"

import { 
  SearchBar, 
  FilterSelect, 
  SortSelect, 
  ViewToggle, 
  ActionButton,
  type FilterOption,
  type SortOption,
  type ViewMode
} from "@components/molecules"
import React from "react"

export interface ControlAction {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
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
      <div className={`mx-auto max-w-7xl ${containerClassName}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Left section */}
          {hasLeftSection && (
            <div className="flex items-center gap-3">
              {/* Search */}
              {showSearch && onSearchChange && (
                <SearchBar
                  value={searchValue}
                  placeholder={searchPlaceholder}
                  onChange={onSearchChange}
                />
              )}
              
              {/* Custom left content */}
              {leftContent}
            </div>
          )}

          {/* Right section */}
          {hasRightSection && (
            <div className="flex items-center gap-3 ml-auto">
              
              {/* Filter */}
              {showFilter && onFilterChange && (
                <FilterSelect
                  value={filterValue}
                  options={filterOptions}
                  onChange={onFilterChange}
                  placeholder={filterLabel}
                />
              )}

              {/* Sort */}
              {showSort && onSortChange && (
                <SortSelect
                  value={sortValue}
                  options={sortOptions}
                  onChange={onSortChange}
                  placeholder={sortLabel}
                />
              )}

              {/* View mode toggle */}
              {showViewToggle && onViewModeChange && (
                <ViewToggle
                  viewMode={viewMode}
                  onChange={onViewModeChange}
                />
              )}

              {/* Custom actions */}
              {customActions.map((action, index) => (
                <ActionButton
                  key={index}
                  icon={action.icon}
                  label={action.label}
                  onClick={action.onClick}
                  isActive={action.isActive}
                  disabled={action.disabled}
                />
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
