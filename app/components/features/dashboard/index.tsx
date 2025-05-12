"use client"

import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"
import { useToast } from "@components/ui/use-toast"
import { useProjectQuery } from "@features/projects/use-projects"
import {
  Filter,
  Grid3x3,
  List,
  Plus,
  SlidersHorizontal,
  Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import GridView from "./grid-view"
import ListView from "./list-view"

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    projects,
    isLoading,
    isError,
    createProject,
    deleteProject,
    toggleStar,
    deleteMultipleProjects
  } = useProjectQuery()

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  // Move selected state up here to track all selected items
  const [selectedProjects, setSelectedProjects] = useState<Record<string, boolean>>({})

  // Toggle selection of a project
  const toggleProjectSelection = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to the project when clicking the checkbox
    setSelectedProjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, [setSelectedProjects])

  // Check if a project is selected
  const isProjectSelected = (id: string) => !!selectedProjects[id];

  // Create new presentation
  const handleCreatePresentation = async () => {
    try {
      setIsCreating(true)

      // Create default presentation document
      const newProject = {
        title: 'Untitled Project',
        description: "",
        type: "presentation",
        userId: "user123", // Replace with actual user ID from auth
        canvasSize: {
          name: "Presentation 16:9",
          width: 1920,
          height: 1080
        },
        pages: [
          {
            id: uuidv4(),
            canvasSize: {
              name: "Presentation 16:9",
              width: 1920,
              height: 1080
            },
            elements: [],
            background: {
              type: "color",
              value: "#ffffff"
            }
          }
        ],
        starred: false,
        shared: false
      }

      // Create the document using the mutation from useProjectQuery
      createProject(newProject)

      // Navigate to editor with the new project ID
      // Note: We'll need to handle this differently since we don't get the ID back immediately
      // For now, navigate to the dashboard and users will see the new project there
      router.push(`/editor`)

    } catch (error) {
      console.error("Failed to create project:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Open existing project
  const handleOpenProject = useCallback((id: string) => {
    router.push(`/editor?id=${id}`)
  }, [router])

  // Handle project deletion
  const handleDeleteProject = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    deleteProject(id)
  }, [deleteProject])

  // Handle star toggling
  const handleToggleStar = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click

    const project = projects.find(p => p._id === id)
    if (!project) return

    toggleStar({ id, starred: !project.starred })
  }, [projects, toggleStar])

  // Handle deleting multiple projects
  const handleDeleteSelectedProjects = useCallback(() => {
    const selectedIds = Object.entries(selectedProjects)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedIds.length === 0) return;

    deleteMultipleProjects(selectedIds);
    setSelectedProjects({});
  }, [selectedProjects, deleteMultipleProjects]);

  // Get visible projects based on active tab and search query
  const getVisibleProjects = useCallback(() => {
    let filteredProjects = projects;

    // Filter by tab first
    switch (activeTab) {
      case "starred":
        filteredProjects = filteredProjects.filter(p => p.starred)
        break
      case "shared":
        filteredProjects = filteredProjects.filter(p => p.shared)
        break
      case "recent":
        filteredProjects = [...filteredProjects].sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ).slice(0, 3)
        break
    }

    // Then filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredProjects = filteredProjects.filter(
        project => project.title.toLowerCase().includes(query) ||
          (project.category && project.category.toLowerCase().includes(query)) ||
          (project.type && project.type.toLowerCase().includes(query))
      );
    }

    return filteredProjects;
  }, [projects, activeTab, searchQuery])

  const getDefaultThumbnail = useCallback((index: number) => {
    const thumbnails = [
      "/abstract-geometric-shapes.png",
      "/placeholder.jpg",
      "/placeholder-logo.svg",
      "/abstract-logo.png",
      "/placeholder.svg"
    ]
    return thumbnails[index % thumbnails.length]
  }, [])

  // Get count of selected projects
  const selectedCount = Object.values(selectedProjects).filter(Boolean).length;

  return (
    <div className="container mx-auto pb-10 pt-5 max-w-7xl">
      {/* Hero section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-black">My Designs</h1>
      </div>

      {/* Sticky Tabs and Controls */}
      <div className="sticky top-16 z-40 -mx-4 px-4 py-3 mb-8 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList className="inline-flex h-auto items-center justify-center rounded-full bg-gray-100 p-1 space-x-1 w-full md:w-auto">
                  <TabsTrigger value="all" className="inline-flex items-center justify-center whitespace-nowrap !rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 text-gray-600 hover:text-brand-blue data-[state=active]:bg-brand-blue/[.06] data-[state=active]:text-gray-800 data-[state=active]:shadow-sm">All</TabsTrigger>
                  <TabsTrigger value="recent" className="inline-flex items-center justify-center whitespace-nowrap !rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 text-gray-600 hover:text-brand-blue data-[state=active]:bg-brand-blue/[.06] data-[state=active]:text-gray-800 data-[state=active]:shadow-sm">Recent</TabsTrigger>
                  <TabsTrigger value="starred" className="inline-flex items-center justify-center whitespace-nowrap !rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 text-gray-600 hover:text-brand-blue data-[state=active]:bg-brand-blue/[.06] data-[state=active]:text-gray-800 data-[state=active]:shadow-sm">Starred</TabsTrigger>
                  <TabsTrigger value="shared" className="inline-flex items-center justify-center whitespace-nowrap !rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 text-gray-600 hover:text-brand-blue data-[state=active]:bg-brand-blue/[.06] data-[state=active]:text-gray-800 data-[state=active]:shadow-sm">Shared</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full md:w-[300px] lg:w-[350px]">
                <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="search"
                  className="pl-10 py-2 bg-white border border-gray-200 rounded-xl focus-visible:ring-brand-blue/30 focus-visible:ring-offset-0"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div> */}

            <div className="flex items-center gap-3 ml-auto">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl transition-all duration-300"
                      onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    >
                      {viewMode === "grid" ? (
                        <Grid3x3 className="h-4 w-4" />
                      ) : (
                        <List className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl transition-all duration-300">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Filter</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl transition-all duration-300">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sort</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCreatePresentation}
                      disabled={isCreating}
                      className="group relative h-14 w-14 rounded-full shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 transition-all duration-300 overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-teal transition-opacity duration-200 ease-in-out"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-brand-blue-dark to-brand-teal-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"></span>
                      <span className="relative z-10">
                        {isCreating ? (
                          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Plus className="text-white transition-transform duration-300 group-hover:scale-110" style={{
                            width: "1.3rem",
                            height: "1.3rem",
                          }} />
                        )}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="px-2 py-1 text-sm">Create new project</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-brand-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">Loading your projects...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-red-100 p-6 mb-4">
            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">Failed to Load Projects</h3>
          <p className="text-gray-500 mb-6 max-w-sm">There was an error loading your projects. Please try again.</p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue-dark hover:to-brand-teal-dark text-white font-medium"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Content when not loading and no error */}
      {!isLoading && !isError && (
        <>
          {viewMode === "grid" ? (
            <GridView

              designs={projects}
            />
          ) : (
            <ListView
              getVisibleDesigns={getVisibleProjects}
              handleOpenDesign={handleOpenProject}
              toggleDesignSelection={toggleProjectSelection}
              getDefaultThumbnail={getDefaultThumbnail}
              isDesignSelected={isProjectSelected}
              designs={projects}
              handleDeleteDesign={handleDeleteProject}
              toggleStar={handleToggleStar}
            />
          )}

          {/* Empty state */}
          {getVisibleProjects().length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="rounded-full bg-gradient-to-r from-brand-blue-light/20 to-brand-teal-light/20 p-6 mb-4">
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
              <h3 className="text-xl font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">No projects found</h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                {activeTab === "all"
                  ? "You haven't created any projects yet. Create your first one now!"
                  : activeTab === "starred"
                    ? "You haven't starred any projects yet."
                    : activeTab === "shared"
                      ? "You don't have any shared projects."
                      : "No recent projects found."}
              </p>
              <Button
                onClick={handleCreatePresentation}
                disabled={isCreating}
                className="group relative rounded-2xl overflow-hidden bg-transparent font-medium py-3 h-auto transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-teal transition-opacity duration-200 ease-in-out"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue-dark to-brand-teal-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"></span>
                <span className="relative z-10 px-4 py-1 flex items-center text-white">
                  {isCreating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" /> Create Project
                    </>
                  )}
                </span>
              </Button>
            </div>
          )}

          {/* Recently used templates section */}
          {activeTab === "all" && !isLoading && getVisibleProjects().length > 0 && (
            <div className="mt-16">
              <h1 className="text-3xl font-bold tracking-tight mb-4 text-black">Recently Used Templates</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card key={item} className="cursor-pointer overflow-hidden group h-40 transition-all rounded-2xl border-gray-100">
                    <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      <img
                        src={`/placeholder${item % 2 === 0 ? '.jpg' : '.svg'}`}
                        alt={`Template ${item}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/70 to-brand-teal/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button size="sm" variant="secondary" className="bg-white hover:bg-white/90 text-sm rounded-xl">
                          Use
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Fixed selection popover */}
      {selectedCount > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-xl px-8 py-4 flex items-center gap-6 z-50 min-w-[320px] md:min-w-[400px] border border-gray-100">
          <span className="text-gray-700 font-medium">{selectedCount} selected</span>
          <div className="flex-1"></div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-gray-100"
            onClick={handleDeleteSelectedProjects}
            aria-label="Delete selected items"
          >
            <Trash2 className="w-10 h-10 text-gray-600" />
          </Button>
        </div>
      )}
    </div>
  )
}