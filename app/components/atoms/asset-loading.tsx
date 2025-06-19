import { Skeleton } from "@/components/atoms/skeleton"
import { cn } from "@/lib/utils/utils"

interface AssetLoadingCardProps {
  className?: string
  variant?: "grid" | "list"
}

export function AssetLoadingCard({ 
  className, 
  variant = "grid" 
}: AssetLoadingCardProps) {
  if (variant === "list") {
    return (
      <div className={cn("p-4 border rounded-lg bg-white", className)}>
        <div className="flex items-center gap-4">
          {/* Icon/Thumbnail skeleton */}
          <Skeleton className="w-12 h-12 rounded" />
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          
          {/* Actions skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm",
      className
    )}>
      {/* Card image/thumbnail area */}
      <Skeleton className="aspect-[4/3] w-full" />
      
      {/* Card content area */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-4 w-3/4" />
        
        {/* Subtitle skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  )
}

interface AssetLoadingGridProps {
  count?: number
  variant?: "grid" | "list"
  className?: string
}

export function AssetLoadingGrid({ 
  count = 8, 
  variant = "grid",
  className 
}: AssetLoadingGridProps) {
  const gridClassName = variant === "grid" 
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    : "space-y-2"

  return (
    <div className={cn(gridClassName, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <AssetLoadingCard 
          key={`loading-${index}`} 
          variant={variant}
        />
      ))}
    </div>
  )
}
