"use client"

import InteractiveCard from "@/components/composite/InteractiveCard/InteractiveCard"
import { SelectionActions } from "@/components/composite/SelectionActions"
import { Button } from "@components/ui/button"
import { useToast } from "@components/ui/use-toast"
import { templatesAPI, projectsAPI } from "@lib/api"
import { SelectionProvider } from "@lib/context/selection-context"
import { useTemplatesQuery } from "@/features/templates/use-templates"
import { useRouter } from "next/navigation"
import { Template } from "@/lib/types/api"

export default function TemplatesPage() {
  const { templates, isLoading, isError, useTemplate, createTemplate } = useTemplatesQuery()
  const { toast } = useToast()
  const router = useRouter()

  const handleSelectTemplate = (id: string, isSelected: boolean) => {
    console.log(`Template ${id} is ${isSelected ? "selected" : "unselected"}`)
  }

  const handleOpenTemplate = (id: string) => {
    console.log(`Using template ${id}`)
    // Use the template to create a new project
    useTemplate({ 
      templateId: id, 
      ownerId: "current-user-id" // You'll need to get this from auth context
    })
  }

  const handleCreateTemplate = async () => {
    try {
      // Step 1: Create a new blank project first
      const projectData = {
        title: "New Template Design",
        ownerId: "current-user-id", // You'll need to get this from auth context
        type: "custom" as const,
        layout: {
          pages: [{
            name: "Page 1",
            canvas: { width: 800, height: 600 },
            background: {
              type: "color",
              value: "#ffffff"
            },
            elements: []
          }]
        }
      };

      const project = await projectsAPI.create(projectData);
      
      // Step 2: Create a template from the project using the templates API
      const templateSlug = `template-${Date.now()}`; // Generate unique slug
      const template = await templatesAPI.createFromProject(project._id, {
        slug: templateSlug,
        categories: ["General"],
        tags: ["blank", "custom"]
      });
      
      toast({
        title: "Success", 
        description: "New template created! Redirecting to editor...",
      });

      // Redirect to editor with the project for designing the template
      setTimeout(() => {
        router.push(`/editor/${project._id}?mode=template&templateId=${template._id}`);
      }, 1000);

    } catch (error) {
      console.error("Failed to create template:", error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handleDeleteSelected = async () => {
    console.log("Delete selected templates")
    return Promise.resolve()
  }

  const handleDuplicateSelected = async () => {
    console.log("Duplicate selected templates")
    return Promise.resolve()
  }

  const handleMoveSelected = async () => {
    console.log("Move selected templates")
    return Promise.resolve()
  }

  const handleTitleChange = async (id: string, newTitle: string) => {
    try {
      // Templates don't typically allow title editing, but we'll keep this for consistency
      console.log(`Updating template ${id} title to: ${newTitle}`)
      
      toast({
        title: "Success",
        description: "Template updated successfully",
      })
    } catch (error) {
      console.error("Failed to update template:", error)
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive"
      })
    }
  }

  const formatUpdatedAt = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return <div className="p-8">Loading templates...</div>
  }

  if (isError) {
    return <div className="p-8">Error loading templates. Please try again.</div>
  }

  return (
    <SelectionProvider>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Templates</h1>
          <Button onClick={handleCreateTemplate}>
            Create New Template
          </Button>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
            <p className="text-gray-600">Check back later for new templates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((template: Template) => (
              <InteractiveCard
                key={template._id}
                id={template._id}
                image={{
                  src: template.thumbnail || "/placeholder.jpg",
                  alt: template.title,
                }}
                title={template.title}
                subtitleLeft="Template"
                subtitleRight={template.category || "General"}
                onClick={() => handleOpenTemplate(template._id)}
                onSelect={handleSelectTemplate}
                onTitleChange={handleTitleChange}
              />
            ))}
          </div>
        )}

        <SelectionActions
          onDelete={handleDeleteSelected}
          onDuplicate={handleDuplicateSelected}
          onMove={handleMoveSelected}
        />
      </div>
    </SelectionProvider>
  )
}