"use client"

import { useEffect, useState } from "react"
import { SelectionProvider } from "@lib/context/selection-context"
import { SelectableCard } from "@components/ui/selectable.card"
import { SelectionActions } from "@components/features/common/selection-actions"
import { Button } from "@components/ui/button"

// Mock project type for demonstration
interface Project {
  id: string
  title: string
  thumbnail: string
  updatedAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock fetch projects
    const mockProjects = [
      {
        id: "1",
        title: "Marketing Campaign",
        thumbnail: "/placeholder.jpg",
        updatedAt: "2023-05-10T14:48:00.000Z",
      },
      {
        id: "2",
        title: "Brand Guidelines",
        thumbnail: "/placeholder.jpg",
        updatedAt: "2023-05-09T10:30:00.000Z",
      },
      {
        id: "3",
        title: "Social Media Pack",
        thumbnail: "/placeholder.jpg",
        updatedAt: "2023-05-08T09:15:00.000Z",
      },
      {
        id: "4",
        title: "Product Launch",
        thumbnail: "/placeholder.jpg",
        updatedAt: "2023-05-07T16:22:00.000Z",
      },
    ]

    setProjects(mockProjects)
    setIsLoading(false)
  }, [])

  const handleSelectProject = (id: string, isSelected: boolean) => {
    console.log(`Project ${id} is ${isSelected ? "selected" : "unselected"}`)
  }

  const handleOpenProject = (id: string) => {
    console.log(`Opening project ${id}`)
    // Navigate to project
  }

  const handleDeleteSelected = () => {
    // In a real implementation, you'd call your API to delete the projects
    console.log("Delete selected projects")
  }

  const handleDuplicateSelected = () => {
    console.log("Duplicate selected projects")
  }

  const handleMoveSelected = () => {
    console.log("Move selected projects")
  }

  const formatUpdatedAt = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return <div className="p-8">Loading projects...</div>
  }

  return (
    <SelectionProvider>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <Button>Create New Project</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((project) => (
            <SelectableCard
              key={project.id}
              id={project.id}
              image={{
                src: project.thumbnail,
                alt: project.title,
              }}
              title={project.title}
              subtitleLeft="Project"
              subtitleRight={formatUpdatedAt(project.updatedAt)}
              onClick={() => handleOpenProject(project.id)}
              onSelect={handleSelectProject}
            />
          ))}
        </div>

        <SelectionActions
          onDelete={handleDeleteSelected}
          onDuplicate={handleDuplicateSelected}
          onMove={handleMoveSelected}
        />
      </div>
    </SelectionProvider>
  )
}