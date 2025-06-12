"use client";

// -----------------------------------------------------------------------------
//  useInfiniteProjects — v2
//  Fixes
//  • Stable query key (stringified filters) → mutation invalidations work
//  • Helper export buildFilterKey() so other hooks/mutations can reuse the same logic
//  • Keeps the public API identical to minimise breaking changes
// -----------------------------------------------------------------------------

import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { projectsAPI } from "@lib/api";
import type { Project } from "@/lib/types/api";
import { useEffect, useMemo } from "react";

interface ProjectsPageData {
  projects: Project[];
  totalProjects: number;
  totalPages: number;
  currentPage: number;
}

export interface UseInfiniteProjectsOptions {
  limit?: number;
  filters?: {
    starred?: boolean;
    shared?: boolean;
    type?: string;
    category?: string;
    search?: string;
  };
}

// -----------------------------------------------------------------------------
//  Helper — stringify filters deterministically so React‑Query keys stay stable
// -----------------------------------------------------------------------------
export function buildFilterKey(filters: UseInfiniteProjectsOptions["filters"]) {
  return JSON.stringify(filters ?? {});
}

/**
 * Infinite loader for projects with pagination.
 * Returns a flattened array of projects + query helpers.
 */
export function useInfiniteProjects(options: UseInfiniteProjectsOptions = {}) {
  const { limit = 12, filters = {} } = options;

  // Stable string key — memoised so it only changes when filters truly change
  const filterKey = useMemo(() => buildFilterKey(filters), [filters]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<ProjectsPageData, Error, InfiniteData<ProjectsPageData>, readonly ["infiniteProjects", number, string], number>({
    queryKey: ["infiniteProjects", limit, filterKey],
    queryFn: async ({ pageParam = 1 }) => {
      // API call is untouched — still passes raw filters object
      const result = await projectsAPI.getPaginated(pageParam as number, limit, filters);
      
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,

    // Always stale so an invalidate triggers a refetch immediately
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  
  // Flatten all pages into a single list (memoised)
  const projects = useMemo(() => {
    if (!data) return [] as Project[];
    return data.pages.flatMap((p) => p.projects);
  }, [data]);

  const totalProjects = data?.pages[0]?.totalProjects ?? 0;

  return {
    projects,
    totalProjects,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    // Expose the key so mutation files can invalidate easily
    queryKey: ["infiniteProjects", limit, filterKey] as const,
  };
}

// -----------------------------------------------------------------------------
//  Utility — manual optimistic prepend (can be used in mutation onSuccess)
// -----------------------------------------------------------------------------
export function prependProjectToCache(
  queryClient: import("@tanstack/react-query").QueryClient,
  key: readonly ["infiniteProjects", number, string],
  project: Project,
) {
  queryClient.setQueryData<InfiniteData<ProjectsPageData>>(key, (old) => {
    if (!old) return old;

    const firstPage = old.pages[0];
    const updatedFirst: ProjectsPageData = {
      ...firstPage,
      projects: [project, ...firstPage.projects],
      totalProjects: firstPage.totalProjects + 1,
    };

    return { ...old, pages: [updatedFirst, ...old.pages.slice(1)] };
  });
}
