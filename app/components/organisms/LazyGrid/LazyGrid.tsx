"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { AssetLoadingGrid } from "@/components/atoms/asset-loading";

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
   * Show initial loading state when there are no items yet
   */
  isInitialLoading?: boolean;
  /**
   * Number of skeleton items to show during loading
   */
  loadingCount?: number;
  /**
   * Variant for loading cards (grid or list)
   */
  loadingVariant?: "grid" | "list";
  /**
   * Custom loading text for initial loading state
   */
  loadingText?: string;
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
  isInitialLoading = false,
  loadingCount = 8,
  loadingVariant = "grid",
  loadingText,
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

  // Show initial loading state when no items and loading
  if (isInitialLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" text={loadingText} />
      </div>
    );
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index} className={columnClassName}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* IntersectionObserver target */}
      {hasMore && <div ref={sentinelRef} className="h-1 w-full col-span-full" />}

      {/* Pagination loading (when loading more items) */}
      {isLoading && items.length > 0 && (
        <div className="col-span-full flex justify-center py-8">
          <LoadingSpinner size="md" text="Loading more..." />
        </div>
      )}

      {/* Initial skeleton loading (when no items yet) */}
      {isLoading && items.length === 0 && (
        <AssetLoadingGrid 
          count={loadingCount} 
          variant={loadingVariant}
          className="col-span-full"
        />
      )}
    </div>
  );
}


