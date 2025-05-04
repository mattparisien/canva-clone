"use client"

import { useState, useEffect } from "react"
import { LayoutGrid, Type, Upload, Folder, Crown, Shapes, Sparkles, Search, Settings, AppWindow } from "lucide-react"
import { useCanvas } from "@/context/canvas-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<string>("text")
  const [textTabHovered, setTextTabHovered] = useState(false)
  const [popoverHovered, setPopoverHovered] = useState(false)
  const { addElement, canvasSize } = useCanvas()

  const tabs = [
    { id: "design", icon: LayoutGrid, label: "Design" },
    { id: "elements", icon: Shapes, label: "Elements" },
    { id: "text", icon: Type, label: "Text" },
    { id: "brand", icon: Crown, label: "Brand" },
    { id: "uploads", icon: Upload, label: "Uploads" },
    { id: "tools", icon: Settings, label: "Tools" },
    { id: "projects", icon: Folder, label: "Projects" },
    { id: "apps", icon: AppWindow, label: "Apps" },
  ]

  // Find the sidebar's left offset for popover positioning
  const [sidebarRef, setSidebarRef] = useState<HTMLDivElement | null>(null)
  const [sidebarLeft, setSidebarLeft] = useState(0)
  // Update sidebarLeft on mount and window resize
  useEffect(() => {
    if (!sidebarRef) return
    const updateLeft = () => {
      const rect = sidebarRef.getBoundingClientRect()
      setSidebarLeft(rect.right)
    }
    updateLeft()
    window.addEventListener('resize', updateLeft)
    return () => window.removeEventListener('resize', updateLeft)
  }, [sidebarRef])

  // Update the estimateTextWidth function to be more accurate
  const estimateTextWidth = (text: string, fontSize: number): number => {
    // More accurate approximation based on character count and font size
    // Different characters have different widths, but this is a reasonable average
    return Math.max(text.length * fontSize * 0.5, fontSize * 2)
  }

  // Update the handleAddText function to use a larger default font size
  const handleAddText = (fontSize = 36, content = "Add your text here", fontWeight = "normal") => {
    // Use the proper text measurement function from our utils
    addElement({
      type: "text",
      x: 0, // Will be centered by the context
      y: 0, // Will be centered by the context
      width: 0, // Will be calculated by the factory using measureTextWidth
      height: 0, // Will be calculated by the factory
      content,
      fontSize,
      fontFamily: "Inter",
      // textAlign is not needed as it will use DEFAULT_TEXT_ALIGN
      isBold: fontWeight === "bold"
    })
  }

  return (
    <div className="flex h-full">
      {/* Main sidebar with icons */}
      <div ref={setSidebarRef} className="flex h-full w-[72px] flex-col border-r border-gray-200 bg-white">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center py-4 text-xs transition-colors",
              activeTab === tab.id
                ? "text-primary bg-primary-50"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
            )}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={tab.id === "text" ? () => setTextTabHovered(true) : undefined}
            onMouseLeave={tab.id === "text" ? () => setTextTabHovered(false) : undefined}
          >
            <tab.icon className="mb-1.5 h-5 w-5" />
            <span className="text-[11px]">{tab.label}</span>
          </div>
        ))}

        {/* Magic button at bottom */}
        <div className="mt-auto mb-4 flex justify-center">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
            <Sparkles className="h-5 w-5" />
          </button>
        </div>
      </div>
      {/* The popover is now absolutely positioned and overlays the canvas */}
      {activeTab === "text" && (textTabHovered || popoverHovered) && (
        <div
          className="fixed z-[70] mt-4 mb-4 w-[320px] rounded-xl bg-white shadow-md flex flex-col h-[calc(100vh-8rem)]"
          style={{ left: sidebarLeft, top: '4rem' }} // 4rem = 64px, matches typical header height
          onMouseEnter={() => setPopoverHovered(true)}
          onMouseLeave={() => setPopoverHovered(false)}
        >
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <div className="mb-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search fonts and combinations"
                  className="h-10 border-gray-200 bg-gray-50 pl-10 pr-4 text-sm rounded-lg"
                />
              </div>
            </div>

            <Button
              className="mb-4 w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-lg flex items-center justify-center gap-2"
              onClick={() => handleAddText(36, "Add a text box")}
            >
              <Type className="h-5 w-5" />
              <span className="font-medium">Add a text box</span>
            </Button>

            <div className="mb-6 w-full">
              <Button
                variant="outline"
                className="w-full border-gray-200 text-gray-700 h-12 rounded-lg flex items-center justify-center gap-2"
                onClick={() => handleAddText(36, "Magic Write", "bold")}
              >
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Magic Write</span>
              </Button>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Brand Kit</h3>
              <Button variant="ghost" className="h-8 text-xs text-primary hover:bg-primary-50">
                Edit
              </Button>
            </div>

            <div className="space-y-3 mb-8">
              <div
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-soft"
                onClick={() => handleAddText(32, "Title", "bold")}
              >
                <p className="text-2xl font-bold">Title</p>
              </div>

              <div
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-soft"
                onClick={() => handleAddText(24, "Heading", "semibold")}
              >
                <p className="text-xl font-semibold">Heading</p>
              </div>
            </div>

            <div className="mt-6 mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Default text styles</h3>
            </div>

            <div className="space-y-3 mb-8">
              <div
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-soft"
                onClick={() => handleAddText(18, "Add a subheading")}
              >
                <p className="text-lg">Add a subheading</p>
              </div>

              <div
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-soft"
                onClick={() => handleAddText(14, "Add a little bit of body text")}
              >
                <p className="text-sm">Add a little bit of body text</p>
              </div>
            </div>

            <div className="mt-6 mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Dynamic text</h3>
            </div>

            <div className="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-primary-200 hover:shadow-soft flex items-center">
              <div className="h-12 w-12 rounded bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold mr-3">
                1
              </div>
              <span className="text-sm font-medium">Page numbers</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
