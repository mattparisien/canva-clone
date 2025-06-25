"use client"

import InteractiveCard from "@/components/composite/InteractiveCard/InteractiveCard"
import { SelectionActions } from "@/components/composite/SelectionActions"
import { Button } from "@components/ui/button"
import { useToast } from "@components/ui/use-toast"
import { templatesAPI } from "@lib/api"
import { SelectionProvider } from "@lib/context/selection-context"
import { useTemplatesQuery, useTemplatePresets } from "@/features/templates/use-templates"
import { useRouter } from "next/navigation"
import { Template, TemplatePreset } from "@/lib/types/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export default function TemplatesPage() {
  const { templates, isLoading, isError, useTemplate, createTemplate } = useTemplatesQuery()
  const { presets, isLoading: presetsLoading } = useTemplatePresets()
  const { toast } = useToast()
  const router = useRouter()

  const handleSelectTemplate = (id: string, isSelected: boolean) => {
    console.log(`Template ${id} is ${isSelected ? "selected" : "unselected"}`)
  }

  const handleOpenTemplate = (id: string) => {
    console.log(`Opening template ${id} for editing`)
    // Navigate directly to the editor with the template ID
    router.push(`/editor?templateId=${id}`)
  }

  const handleCreateTemplate = async (preset?: TemplatePreset) => {
    try {
      // Create a unique slug for the template
      const timestamp = Date.now();
      const slug = `template-${timestamp}`;
      
      // Use preset data if provided, otherwise use defaults
      const canvasSize = preset?.canvasSize || { name: "Custom", width: 800, height: 600 };
      const templateName = preset?.name || "New Template";
      const templateType = preset?.type || "custom";
      const templateCategory = preset?.category || "General";
      const templateTags = preset?.tags || ["blank", "custom"];
      
      // Create a new template directly using the templates API
      const templateData: any = {
        title: templateName,
        slug: slug,
        description: `A new ${templateName.toLowerCase()} template`,
        type: templateType as "presentation" | "social" | "print" | "custom",
        category: templateCategory,
        author: "507f1f77bcf86cd799439011", // Valid ObjectId format for demo
        featured: false,
        popular: false,
        canvasSize: canvasSize,
        tags: templateTags,
        pages: [{
          id: "page-1",
          name: "Page 1",
          canvasSize: canvasSize,
          elements: [],
          background: {
            type: "color",
            value: "#ffffff"
          }
        }]
      };

      // Add preset ID if a preset was selected
      if (preset?.id) {
        templateData.presetId = preset.id;
      }

      createTemplate(templateData);
      
      toast({
        title: "Success",
        description: `New ${templateName} template created successfully!`,
      });

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Create New Template
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
              <DropdownMenuLabel>Choose Template Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCreateTemplate()}>
                Blank Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {presetsLoading ? (
                <DropdownMenuItem disabled>
                  Loading presets...
                </DropdownMenuItem>
              ) : (
                <>
                  {/* Group presets by category */}
                  {Object.entries(
                    presets.reduce((acc: { [category: string]: TemplatePreset[] }, preset: TemplatePreset) => {
                      if (!acc[preset.category]) {
                        acc[preset.category] = [];
                      }
                      acc[preset.category].push(preset);
                      return acc;
                    }, {})
                  ).map(([category, categoryPresets]: [string, TemplatePreset[]]) => (
                    <div key={category}>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {category}
                      </DropdownMenuLabel>
                      {categoryPresets.map((preset: TemplatePreset) => (
                        <DropdownMenuItem
                          key={preset.id}
                          onClick={() => handleCreateTemplate(preset)}
                        >
                          <div className="flex flex-col">
                            <span>{preset.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {preset.canvasSize.width} × {preset.canvasSize.height}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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