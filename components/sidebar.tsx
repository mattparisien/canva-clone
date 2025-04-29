"use client"

import { useState } from "react"
import { LayoutGrid, Type, Upload, Folder, Crown, ImageIcon, Shapes, Sparkles } from "lucide-react"
import { useCanvas } from "@/context/canvas-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<string>("text")
  const { addElement, canvasSize } = useCanvas()

  const tabs = [
    { id: "design", icon: LayoutGrid, label: "Design" },
    { id: "elements", icon: Shapes, label: "Elements" },
    { id: "text", icon: Type, label: "Text" },
    { id: "images", icon: ImageIcon, label: "Images" },
    { id: "uploads", icon: Upload, label: "Uploads" },
    { id: "brand", icon: Crown, label: "Brand" },
    { id: "projects", icon: Folder, label: "Projects" },
  ]

  // Helper function to estimate text width based on content and font size
  const estimateTextWidth = (text: string, fontSize: number): number => {
    // This is a more accurate approximation for most fonts
    // Different characters have different widths, but this is a reasonable average
    // We add a bit of padding to ensure text fits comfortably
    return Math.max(text.length * fontSize * 0.6, fontSize * 4) + 20
  }

  const handleAddText = (fontSize = 24, content = "Add your text here", fontWeight = "normal") => {
    // Estimate width based on content and font size
    const estimatedWidth = estimateTextWidth(content, fontSize)

    // Height is typically 1.2-1.5 times the font size for line height
    const height = fontSize * 1.5

    addElement({
      type: "text",
      x: 0, // Will be centered by the context
      y: 0, // Will be centered by the context
      width: estimatedWidth,
      height,
      content,
      fontSize,
      fontFamily: "Inter",
    })
  }

  return (
    <div className="flex h-full">
      {/* Main sidebar with icons */}
      <div className="flex h-full w-[72px] flex-col border-r border-gray-100 bg-white">
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
          >
            <tab.icon className="mb-1.5 h-5 w-5" />
            <span className="text-[11px]">{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Secondary sidebar with content */}
      {activeTab === "text" && (
        <div className="w-[280px] border-r border-gray-100 bg-white p-5 shadow-soft">
          <div className="mb-5">
            <Input
              type="text"
              placeholder="Search fonts and combinations"
              className="h-10 border-gray-200 bg-gray-50 text-sm"
            />
          </div>

          <Button
            className="mb-4 w-full bg-primary hover:bg-primary-700 text-white h-12 rounded-lg"
            onClick={() => handleAddText(24, "Add a text box")}
          >
            <Type className="mr-2 h-5 w-5" />
            Add a text box
          </Button>

          <Button
            variant="outline"
            className="mb-6 w-full border-gray-200 text-gray-700 h-12 rounded-lg"
            onClick={() => handleAddText(24, "Magic Write", "bold")}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Magic Write
          </Button>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800">Brand Kit</h3>
            <Button variant="ghost" className="h-8 text-xs text-primary hover:bg-primary-50">
              Edit
            </Button>
          </div>

          <div className="space-y-3">
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
            <h3 className="text-sm font-medium text-gray-800">Default text styles</h3>
          </div>

          <div className="space-y-3">
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
            <h3 className="text-sm font-medium text-gray-800">Dynamic text</h3>
          </div>

          <div className="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-primary-200 hover:shadow-soft flex items-center">
            <div className="h-12 w-12 rounded bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold mr-3">
              1
            </div>
            <span className="text-sm font-medium">Page numbers</span>
          </div>
        </div>
      )}
    </div>
  )
}
