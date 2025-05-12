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
        <div className="col-span-full flex justify-center py-6">
          <Spinner />
        </div>
      )}
    </div>
  );
}

/**
 * Lightweight SVG spinner (Tailwind-friendly).
 * Replace with your app-wide Loader component if preferred.
 */
function Spinner() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 animate-spin text-gray-400"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M22 12a10 10 0 01-10 10V12h10z"
        fill="currentColor"
        className="opacity-75"
      />
    </svg>
  );
}
