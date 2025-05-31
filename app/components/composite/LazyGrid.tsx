"use client";

import React, { useCallback, useEffect, useRef } from "react";

/**
 * LazyGrid
 * ------------
 * A responsive, infinitely-scrolling grid component.
 *
 * Props:
 *  - items: Array of data to render
 *  - renderItem: (item, index) => ReactNode – how to render each cell
 *  - loadMore: () => void | Promise<void> – called when the sentinel becomes visible
 *  - hasMore: boolean – whether more data is available
 *  - isLoading?: boolean – optional flag to show a loader while fetching
 *  - className?: string – Tailwind/CSS classes for the grid wrapper
 *  - columnClassName?: string – Tailwind/CSS classes for each cell wrapper
 *
 * Example usage (inside a page or component):
 *
 * const { data, fetchNext, hasNext, isFetching } = useInfiniteQuery(...);
 *
 * <LazyGrid
 *   items={data}
 *   renderItem={(item) => <Card data={item} />}
 *   loadMore={fetchNext}
 *   hasMore={hasNext}
 *   isLoading={isFetching}
 * />
 */

export interface LazyGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading?: boolean;
  /**
   * Tailwind/CSS classes for the grid wrapper.
   * Defaults to a 1-column mobile, 2-column sm, 3-column md, 4-column lg layout.
   */
  className?: string;
  /**
   * Tailwind/CSS classes applied to every cell wrapper (optional).
   */
  columnClassName?: string;
}

export function LazyGrid<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading = false,
  className = "grid w-full gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  columnClassName = "",
}: LazyGridProps<T>) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]): void => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        // Trigger the caller-provided loader
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [onIntersect, hasMore]);

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index} className={columnClassName}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* IntersectionObserver target */}
      {hasMore && <div ref={sentinelRef} className="h-1 w-full col-span-full" />}

      {/* Optional loader */}
      {isLoading && (
        <>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`loading-${index}`} className={columnClassName}>
              <LoadingCard />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Loading card with shimmer effect similar to Dropbox/Canva
 */
function LoadingCard() {
  return (
    <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Card image/thumbnail area */}
      <div className="aspect-[4/3] bg-gray-200 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
      </div>
      
      {/* Card content area */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded-md w-3/4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
        </div>
        
        {/* Subtitle skeleton */}
        <div className="h-3 bg-gray-200 rounded-md w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
        </div>
        
        {/* Additional info skeleton */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 bg-gray-200 rounded-md w-1/4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
          </div>
          <div className="h-6 w-6 bg-gray-200 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
          </div>
        </div>
      </div>
      
      {/* Global shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
    </div>
  );
}
