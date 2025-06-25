"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useProjectPresets } from "@/features/projects/use-projects"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { projectsAPI } from "@/lib/api"

interface ProjectPreset {
  id: string
  category: string
  key: string
  name: string
  canvasSize: {
    name: string
    width: number
    height: number
  }
  type: string
  tags: string[]
}

interface GroupedPresets {
  [category: string]: ProjectPreset[]
}

interface PresetSelectorPopoverProps {
  children: React.ReactNode
  onPresetSelect?: (preset: ProjectPreset) => void
}

export function PresetSelectorPopover({ 
  children, 
  onPresetSelect 
}: PresetSelectorPopoverProps) {
  const { presets, isLoading } = useProjectPresets()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handlePresetSelect = async (preset: ProjectPreset) => {
    try {
      if (onPresetSelect) {
        onPresetSelect(preset)
      } else {
        // Create a new project from the preset
        const { projectsAPI } = await import('@/lib/api')
        const newProject = await projectsAPI.createFromPreset(preset.id, {
          title: `${preset.name} Project`
        })
        
        console.log('Created project:', newProject)
        
        // Navigate to editor with the new project - try both _id and id
        const projectId = newProject._id || (newProject as any).id
        if (projectId) {
          router.push(`/editor?id=${projectId}`)
        } else {
          console.warn('No project ID found in response, falling back to preset navigation')
          router.push(`/editor?preset=${preset.id}`)
        }
      }
    } catch (error) {
      console.error('Error creating project from preset:', error)
      // Fallback to the old behavior
      router.push(`/editor?preset=${preset.id}`)
    }
    setOpen(false)
  }

  const handleBlankProject = async () => {
    try {
      if (onPresetSelect) {
        onPresetSelect({
          id: 'blank',
          category: 'Custom',
          key: 'blank',
          name: 'Blank Project',
          canvasSize: {
            name: 'Custom',
            width: 800,
            height: 600
          },
          type: 'custom',
          tags: ['blank', 'custom']
        })
      } else {
        // Create a blank project using raw object to bypass TypeScript limitations
        const { projectsAPI } = await import('@/lib/api')
        const projectData: any = {
          title: 'Untitled Design',
          type: 'custom',
          layout: {
            pages: [{
              name: 'Page 1',
              canvas: { width: 800, height: 600 },
              background: { type: 'color', value: '#ffffff' },
              elements: []
            }]
          }
        }
        
        const newProject = await projectsAPI.create(projectData)
        
        console.log('Created blank project:', newProject)
        
        // Navigate to editor with the new project
        const projectId = newProject._id || (newProject as any).id
        if (projectId) {
          router.push(`/editor?id=${projectId}`)
        } else {
          router.push('/editor')
        }
      }
    } catch (error) {
      console.error('Error creating blank project:', error)
      // Fallback to the old behavior
      router.push('/editor')
    }
    setOpen(false)
  }

  // Group presets by category
  const groupedPresets = presets.reduce((acc: GroupedPresets, preset: ProjectPreset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = []
    }
    acc[preset.category].push(preset)
    return acc
  }, {})

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="start"
        sideOffset={8}
        className="w-80 max-h-96 overflow-y-auto"
      >
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Create New Project</h4>
          <Separator />
          
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3"
            onClick={handleBlankProject}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">Blank Project</span>
              <span className="text-xs text-muted-foreground">Start with an empty canvas</span>
            </div>
          </Button>
          
          <Separator />
          
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading presets...
            </div>
          ) : (
            <div className="space-y-1">
              {Object.entries(groupedPresets).map(([category, categoryPresets]: [string, ProjectPreset[]]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {category}
                  </div>
                  {categoryPresets.map((preset: ProjectPreset) => (
                    <Button
                      key={preset.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{preset.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {preset.canvasSize.width} × {preset.canvasSize.height}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
