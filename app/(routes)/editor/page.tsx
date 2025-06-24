"use client"
import Editor from "./components/Editor"
import React from "react"
import { useSearchParams } from "next/navigation"
import useEditorStore from "@/lib/stores/useEditorStore"
import { templatesAPI } from "@/lib/api"

export default function EditorPage() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')

  // Template loading effect
  React.useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        try {
          console.log(`Loading template ${templateId} in editor`)
          
          // Fetch template data
          const template = await templatesAPI.getById(templateId)
          
          if (template) {
            console.log('Template loaded:', template.title)
            
            // Convert template data to editor format
            const templatePages = template.pages || []
            const frontendPages = templatePages.map((templatePage: any) => ({
              id: `page-${Date.now()}-${Math.random()}`,
              name: templatePage.name || 'Page',
              canvas: templatePage.canvasSize || templatePage.canvas || { width: 800, height: 600 },
              background: templatePage.background || { type: 'color', value: '#ffffff' },
              elements: (templatePage.elements || []).map((el: any) => ({
                ...el,
                // Ensure frontend-specific properties exist
                isNew: false,
                locked: false,
                isEditable: true,
              })),
              canvasSize: templatePage.canvasSize || {
                name: 'Custom',
                width: templatePage.canvas?.width || 800,
                height: templatePage.canvas?.height || 600,
              }
            }))
            
            // Initialize editor with template data
            useEditorStore.setState({
              designName: `${template.title} - Copy`,
              pages: frontendPages.length > 0 ? frontendPages : [{
                id: `page-${Date.now()}`,
                name: 'Page 1',
                canvas: { width: 800, height: 600 },
                background: { type: 'color', value: '#ffffff' },
                elements: [],
                canvasSize: { name: 'Custom', width: 800, height: 600 }
              }],
              currentPageId: frontendPages[0]?.id || `page-${Date.now()}`,
              currentPageIndex: 0,
              isDesignSaved: false,
              designId: null // This will be a new design based on template
            })
          }
        } catch (error) {
          console.error('Error loading template:', error)
          // Fall back to default initialization
        }
      }
    }

    loadTemplate()
  }, [templateId])

  // Add a global wheel event handler to prevent browser zoom
  React.useEffect(() => {
    // This function will prevent the default browser zoom behavior
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        return false
      }
    }

    // Add the event listener to document with passive: false to allow preventDefault
    document.addEventListener("wheel", preventZoom, { passive: false })

    // Also add to window as a fallback
    window.addEventListener("wheel", preventZoom, { passive: false })

    // Add keydown event listener to prevent Ctrl+Plus/Minus zoom
    const preventKeyZoom = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "-" || e.key === "=")) {
        e.preventDefault()
        return false
      }
    }

    window.addEventListener("keydown", preventKeyZoom)

    return () => {
      document.removeEventListener("wheel", preventZoom)
      window.removeEventListener("wheel", preventZoom)
      window.removeEventListener("keydown", preventKeyZoom)
    }
  }, [])

  return <Editor />
}