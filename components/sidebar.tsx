"use client"

import { useState } from "react"
import { LayoutGrid, Type, Upload, Folder, Grid3X3, Crown } from "lucide-react"
import { useCanvas } from "@/context/canvas-context"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<string>("design")
  const { addElement, canvasSize } = useCanvas()

  const tabs = [
    { id: "design", icon: LayoutGrid, label: "Design" },
    { id: "elements", icon: Grid3X3, label: "Elements" },
    { id: "text", icon: Type, label: "Text" },
    { id: "brand", icon: Crown, label: "Brand" },
    { id: "uploads", icon: Upload, label: "Uploads" },
    { id: "projects", icon: Folder, label: "Projects" },
  ]

  // Helper function to estimate text width based on content and font size
  const estimateTextWidth = (text: string, fontSize: number): number => {
    // This is a more accurate approximation for most fonts
    // Different characters have different widths, but this is a reasonable average
    // We add a bit of padding to ensure text fits comfortably
    return Math.max(text.length * fontSize * 0.6, fontSize * 4) + 20
  }

  const handleAddText = (fontSize = 24, content = "Add your text here") => {
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
      fontFamily: "Arial",
    })
  }

  return (
    <div className="flex h-full w-[72px] flex-col border-r bg-white">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center py-5 text-xs transition-colors",
            activeTab === tab.id ? "text-purple-600" : "text-gray-500 hover:text-gray-900",
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon className="mb-1.5 h-5 w-5" />
          <span className="text-[11px]">{tab.label}</span>

          {tab.id === "text" && activeTab === "text" && (
            <div className="absolute left-[72px] top-0 z-10 mt-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-sm font-medium">Text</h3>

              <div className="space-y-4">
                <div
                  className="cursor-pointer rounded border p-4 text-center transition-colors hover:border-purple-500"
                  onClick={() => handleAddText(32, "Add a heading")}
                >
                  <p className="text-lg font-medium">Add a heading</p>
                </div>

                <div
                  className="cursor-pointer rounded border p-4 text-center transition-colors hover:border-purple-500"
                  onClick={() => handleAddText(24, "Add a subheading")}
                >
                  <p className="text-base">Add a subheading</p>
                </div>

                <div
                  className="cursor-pointer rounded border p-4 text-center transition-colors hover:border-purple-500"
                  onClick={() => handleAddText(16, "Add a little bit of body text")}
                >
                  <p className="text-sm">Add a little bit of body text</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
