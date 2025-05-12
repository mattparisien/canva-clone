"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { projectsAPI, Project } from "@lib/api/api";
import { useMemo } from "react";

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

/**
 * Custom hook for infinite loading of projects with pagination
 */
export function useInfiniteProjects(options: UseInfiniteProjectsOptions = {}) {
  const { limit = 12, filters = {} } = options;

  // Use the InfiniteQuery hook to handle pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['infiniteProjects', limit, filters],
    queryFn: async ({ pageParam = 1 }) => {
      // Call the API with the current page and filters
      const result = await projectsAPI.getProjects(pageParam, limit, filters);
      console.log(result);
      return result;
    },
    getNextPageParam: (lastPage: ProjectsPageData) => {
      // If we're on the last page, return undefined to indicate there's no more data
      if (lastPage.currentPage >= lastPage.totalPages) {
        return undefined;
      }
      // Otherwise, return the next page number
      return lastPage.currentPage + 1;
    },
    initialPageParam: 1,
  });

  // Flatten the projects from all pages into a single array for easier consumption
  const projects = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.projects);
  }, [data]);

  // Calculate total count from the most recent page
  const totalProjects = data?.pages[0]?.totalProjects || 0;

  return {
    projects,
    totalProjects,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  };
}