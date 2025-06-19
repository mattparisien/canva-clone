"use client"

/**
 * Dashboard — rewritten for better reactivity & readability ✨
 * -----------------------------------------------------------
 * • Stable React‑Query keys → no stale cache issues after mutations
 * • Inline optimistic cache updates for faster UX
 * • Extracted tiny helpers for clarity (filterKey, buildProjectRequest)
 * • Collocated UI state; all side‑effects wrapped in useCallback
 * • Strict typing on hooks
 * -----------------------------------------------------------
 */

import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import {
  Filter,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

// atoms / molecules / organisms ------------------------------------------------
import { Section } from "@/components/atoms/section";
import { Button } from "@/components/atoms/button";
import { Heading } from "@/components/atoms";
import { LazyGrid } from "@/components/organisms/LazyGrid/LazyGrid";
import InteractiveCard from "@/components/organisms/InteractiveCard/InteractiveCard";
import { StickyControlsBar } from "@/components/organisms/StickyControlsBar";
import { SelectionActions } from "@/components/organisms/SelectionActions";
import ListView from "../components/list-view";

// context / hooks --------------------------------------------------------------
import { SelectionProvider, useSelection } from "@lib/context/selection-context";
import { useToast } from "@/components/atoms/use-toast";
import { useInfiniteProjects } from "@features/projects/use-infinite-projects";
import { useProjectQuery } from "@features/projects/use-projects";

// utils ------------------------------------------------------------------------
import { upperFirst } from "lodash";
import { getRelativeTime } from "@lib/utils/utils";
import type { ViewMode } from "@/components/molecules";
import { Project } from "@canva-clone/shared-types/dist/models/project";
import { ProjectListResponse } from "@canva-clone/shared-types/dist/api/project/project.responses";

// -----------------------------------------------------------------------------
//  Public wrapper (kept to avoid breaking call‑sites)
// -----------------------------------------------------------------------------
export default function Dashboard() {
  return (
    <SelectionProvider>
      <DashboardInner />
    </SelectionProvider>
  );
}

// -----------------------------------------------------------------------------
//  Inner component — contains real logic
// -----------------------------------------------------------------------------
function DashboardInner() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // selection --------------------------------------------------
  const { selectedIds, clearSelection } = useSelection();

  // view‑specific state ---------------------------------------
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<"all" | "starred" | "shared">(
    "all",
  );
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // react‑query hooks -----------------------------------------
  const {
    createSimpleProject,
    deleteProject,
    deleteMultipleProjects,
    toggleStar,
    updateProject,
  } = useProjectQuery();

  /**
   * Build filters & STABLE key — stringify to keep referential equality
   * across renders so that invalidateQueries can match correctly.
   */
  const filters = useMemo(() => {
    const f: Record<string, unknown> = {};
    if (activeTab === "starred") f.starred = true;
    if (activeTab === "shared") f.shared = true;
    if (searchQuery) f.search = searchQuery;
    return f;
  }, [activeTab, searchQuery]);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const {
    projects,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteProjects({
    limit: 12,
    filters,
    // queryKey: ["projects", filterKey], // ensure the key matches invalidations
  });

  const hasUsedTemplates = useMemo(
    () => projects.some((p) => p.isTemplate),
    [projects],
  );

  // ---------------------------------------------------------------------------
  //  Mutations & callbacks
  // ---------------------------------------------------------------------------

  /**
   * Adds new project → optimistic cache update (+ invalidate for safety)
   */
  const handleCreatePresentation = useCallback(async () => {
    try {
      setIsCreating(true);

      const req = buildProjectRequest();
      const newProject = await createSimpleProject(req);

      // Optimistically prepend to first page of current list
      queryClient.setQueryData<InfiniteData<ProjectListResponse>>(
        ["infiniteProjects", 12, filterKey],
        (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          if (!firstPage) return old;
          
          const updatedFirstPage: ProjectListResponse = {
            ...firstPage,
            projects: [newProject, ...firstPage.projects],
            total: firstPage.total + 1
          };
          
          return { 
            ...old, 
            pages: [updatedFirstPage, ...old.pages.slice(1)]
          };
        },
      );

      // Mark *all* projects queries stale so next focus refetches
      queryClient.invalidateQueries({ queryKey: ["projects"], exact: false });

      router.push(`/editor?id=${newProject.id}`);
    } catch (err) {
      console.error("create project", err);
      toast({
        title: "Creation failed",
        description: "Could not create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }, [createSimpleProject, filterKey, queryClient, router, toast]);

  const handleOpenProject = useCallback(
    (id: string) => router.push(`/editor?id=${id}`),
    [router],
  );

  const handleDeleteProject = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await deleteProject(id);
    },
    [deleteProject],
  );

  const handleToggleStar = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const p = projects.find((x) => x.id === id);
      if (p) await toggleStar({ id, starred: !p.starred });
    },
    [projects, toggleStar],
  );

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedIds.length) return;
    try {
      toast({ title: "Deleting", description: "Removing selected projects…" });
      await deleteMultipleProjects(selectedIds);
      clearSelection();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Some projects could not be deleted.",
        variant: "destructive",
      });
      refetch();
    }
  }, [selectedIds, deleteMultipleProjects, toast, clearSelection, refetch]);

  const handleTitleChange = useCallback(
    async (id: string, newTitle: string) => {
      try {
        await updateProject({ id, data: { title: newTitle } });
        toast({ title: "Updated", description: "Title changed!" });
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Rename failed", variant: "destructive" });
      }
    },
    [updateProject, toast],
  );

  // ---------------------------------------------------------------------------
  //  Render helpers
  // ---------------------------------------------------------------------------
  const renderGridItem = useCallback(
    (project: Project) => (
      <InteractiveCard
        key={project.id}
        id={project.id}
        image={
          project.thumbnail ? {
            src: project.thumbnail,
            alt: project.title || "Project thumbnail",
          } : undefined
        }
        title={project.title || "Untitled Design"}
        subtitleLeft="Design" // fallback since type property doesn't exist in shared types
        subtitleRight={`Last updated ${getRelativeTime(project.updatedAt)}`}
        onClick={() => handleOpenProject(project.id)}
        onTitleChange={handleTitleChange}
        dimensions={undefined} // designSpec doesn't exist in shared types
      />
    ),
    [handleOpenProject, handleTitleChange],
  );

  // Fetch next page wrapper for LazyGrid
  const loadMore = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  // ---------------------------------------------------------------------------
  //  JSX
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* ------------------------------------------  All Designs */}
      <Section>
        <Heading level={2}>My Designs</Heading>

        <StickyControlsBar
          showCondition={projects.length > 0}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle
          customActions={[
            { icon: Filter, label: "Filter", onClick: () => console.log("Filter") },
            { icon: SlidersHorizontal, label: "Sort", onClick: () => console.log("Sort") },
          ]}
        />

        {/* error ------------------------------------------------ */}
        {isError && !isLoading && (
          <ErrorPane onRetry={refetch} />
        )}

        {/* content ---------------------------------------------- */}
        {!isError && (
          <>
            {viewMode === "grid" ? (
              <LazyGrid
                items={projects}
                renderItem={renderGridItem}
                loadMore={loadMore}
                hasMore={!!hasNextPage}
                isLoading={isFetchingNextPage}
                isInitialLoading={isLoading && projects.length === 0}
                loadingVariant="grid"
                loadingText="Loading your projects…"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
              />
            ) : (
              <ListView
                getVisibleDesigns={() => projects}
                handleOpenDesign={handleOpenProject}
                designs={projects}
                handleDeleteDesign={handleDeleteProject}
                toggleStar={handleToggleStar}
                getDefaultThumbnail={(i) => `/placeholder${i % 2 === 0 ? ".jpg" : ".svg"}`}
                toggleDesignSelection={() => {/* selection handled elsewhere */}}
                isDesignSelected={(id) => selectedIds.includes(id)}
              />
            )}

            {/* empty state -------------------------------------- */}
            {projects.length === 0 && !isLoading && (
              <EmptyState onCreate={handleCreatePresentation} creating={isCreating} tab={activeTab} />
            )}
          </>
        )}
      </Section>

      {/* --------------------------------------- Recently Used Templates */}
      {hasUsedTemplates && <RecentlyUsedTemplates />}

      {/* --------------------------------------- Bulk actions */}
      <SelectionActions
        onDelete={handleDeleteSelected}
        onDuplicate={() => Promise.resolve(console.log("duplicate"))}
        onMove={() => Promise.resolve(console.log("move"))}
        className="z-50"
      />
    </>
  );
}

// -----------------------------------------------------------------------------
//  Small sub‑components — kept in‑file for brevity
// -----------------------------------------------------------------------------
function ErrorPane({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-red-100 p-6 mb-4">
        {/* icon */}
        <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium mb-2">Failed to load projects</h3>
      <p className="text-gray-500 mb-6 max-w-sm">There was an error fetching data. Please try again.</p>
      <Button onClick={onRetry} variant="gradient" className="rounded-2xl">
        Try again
      </Button>
    </div>
  );
}

function EmptyState({
  onCreate,
  creating,
  tab,
}: {
  onCreate: () => void;
  creating: boolean;
  tab: "all" | "starred" | "shared";
}) {
  const messages: Record<string, string> = {
    all: "You haven't created any projects yet. Create your first one now!",
    starred: "You haven't starred any projects yet.",
    shared: "You don't have any shared projects.",
  };
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="rounded-full bg-gradient-to-r from-brand-blue-light/20 to-brand-teal-light/20 p-6 mb-4">
        {/* folder icon */}
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-blue">
          <path
            d="M13 7L11.8845 4.76893C11.5634 4.1261 11.4029 3.80468 11.1634 3.57411C10.9516 3.37225 10.6963 3.21936 10.4161 3.12542C10.0992 3.02 9.74021 3.02 9.02229 3.02H5.2C4.0799 3.02 3.51984 3.02 3.09202 3.24327C2.71569 3.43861 2.41859 3.73571 2.22325 4.11204C2 4.53986 2 5.09992 2 6.22V17.78C2 18.9001 2 19.4602 2.22325 19.888C2.41859 20.2643 2.71569 20.5614 3.09202 20.7568C3.51984 20.98 4.0799 20.98 5.2 20.98H18.8C19.9201 20.98 20.4802 20.98 20.908 20.7568C21.2843 20.5614 21.5814 20.2643 21.7768 19.888C22 19.4602 22 18.9001 22 17.78V10.02C22 8.89992 22 8.33986 21.7768 7.91204C21.5814 7.53571 21.2843 7.23861 20.908 7.04327C20.4802 6.82 19.9201 6.82 18.8 6.82H13ZM13 7H8.61687C8.09853 7 7.83936 7 7.61522 6.9023C7.41806 6.81492 7.25028 6.67546 7.13348 6.49934C7 6.29918 7 6.03137 7 5.49574C7 4.96012 7 4.6923 7.13348 4.49214C7.25028 4.31603 7.41806 4.17657 7.61522 4.08919C7.83936 3.99149 8.09853 3.99149 8.61687 3.99149H9.02229C9.74021 3.99149 10.0992 3.99149 10.4161 4.09692C10.6963 4.19085 10.9516 4.34374 11.1634 4.54561C11.4029 4.77618 11.5634 5.0976 11.8845 5.74043L13 7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">
        No projects found
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm">{messages[tab]}</p>
      <Button
        onClick={onCreate}
        disabled={creating}
        variant="gradient"
        className="rounded-2xl font-medium py-3 h-auto"
      >
        {creating ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating…
          </span>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" /> Create project
          </>
        )}
      </Button>
    </div>
  );
}

function RecentlyUsedTemplates() {
  return (
    <Section heading="Recently Used Templates">
      <div className="mt-16">
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-black">Recently Used Templates</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="cursor-pointer overflow-hidden group h-40 transition-all rounded-2xl border-gray-100"
            >
              <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <img
                  src={`/placeholder${i % 2 === 0 ? ".jpg" : ".svg"}`}
                  alt={`Template ${i}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/70 to-brand-teal/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Button size="sm" variant="secondary" className="bg-white hover:bg-white/90 text-sm rounded-xl">
                    Use
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// -----------------------------------------------------------------------------
//  Helpers
// -----------------------------------------------------------------------------
function buildProjectRequest() {
  return {
    userId: "user123", // TODO: pull from auth context
    title: "Untitled Project",
    description: "",
    type: "presentation" as const,
    category: "personal" as const,
    // Add default page with required dimensions
    pages: [
      {
        id: `page-${new Date().getTime()}`,
        name: "Page 1",
        dimensions: {
          width: 1920,
          height: 1080,
          aspectRatio: "16:9"
        },
        elements: [],
        background: {
          type: "color",
          value: "#ffffff"
        }
      }
    ]
  };
}
