"use client"

import { useState, useEffect, useRef } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  Minus,
  Plus,
  Type,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Element } from "@/context/canvas-context"

interface TextToolbarProps {
  selectedElement: Element | null
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (family: string) => void
  onTextAlignChange: (align: "left" | "center" | "right" | "justify") => void
  isHovering: boolean
  elementId: string | null
}

export function TextToolbar({
  selectedElement,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  elementId,
}: TextToolbarProps) {
  const [fontSize, setFontSize] = useState(selectedElement?.fontSize || 36)
  const [fontFamily, setFontFamily] = useState(selectedElement?.fontFamily || "Inter")
  const [showFontDropdown, setShowFontDropdown] = useState(false)
  const [isToolbarHovered, setIsToolbarHovered] = useState(false)
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">(
    selectedElement?.textAlign || "left"
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update local state when selected element changes
  useEffect(() => {
    if (selectedElement?.type === "text") {
      setFontSize(selectedElement.fontSize || 36)
      setFontFamily(selectedElement.fontFamily || "Inter")
      setTextAlign(selectedElement.textAlign || "left")
    }
  }, [selectedElement])

  // Handle font size change
  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize)
    onFontSizeChange(newSize)
  }

  // Handle font family change
  const handleFontFamilyChange = (newFamily: string) => {
    setFontFamily(newFamily)
    onFontFamilyChange(newFamily)
    setShowFontDropdown(false)
  }

  const handleTextAlignChange = (align: "left" | "center" | "right" | "justify") => {
    setTextAlign(align)
    onTextAlignChange(align)
  }

  // Handle mouse enter/leave for the toolbar itself
  const handleToolbarMouseEnter = () => {
    setIsToolbarHovered(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const handleToolbarMouseLeave = () => {
    setIsToolbarHovered(false)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  const fontFamilies = [
    "Inter",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
    "Comic Sans MS",
    "Impact",
  ]

  return (
    <div
      ref={toolbarRef}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white rounded-lg shadow-md px-2 py-1.5"
      onMouseEnter={handleToolbarMouseEnter}
      onMouseLeave={handleToolbarMouseLeave}
    >
      {/* Font Family Dropdown */}
      <div className="relative">
        <button
          className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          onClick={() => setShowFontDropdown(!showFontDropdown)}
        >
          <span>{fontFamily}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {showFontDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {fontFamilies.map((font) => (
              <button
                key={font}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
                  fontFamily === font ? "bg-gray-50 font-medium text-primary-700" : "",
                )}
                style={{ fontFamily: font }}
                onClick={() => handleFontFamilyChange(font)}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      {/* Font Size Controls */}
      <div className="flex items-center">
        <button
          className="p-1 text-gray-700 hover:bg-gray-100 rounded"
          onClick={() => handleFontSizeChange(Math.max(8, fontSize - 1))}
        >
          <Minus className="h-4 w-4" />
        </button>

        <input
          type="number"
          value={fontSize}
          onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          className="w-12 text-center border-none text-sm font-medium focus:outline-none"
        />

        <button
          className="p-1 text-gray-700 hover:bg-gray-100 rounded"
          onClick={() => handleFontSizeChange(Math.min(72, fontSize + 1))}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      {/* Text Color (placeholder) */}
      <button className="p-1 text-gray-700 hover:bg-gray-100 rounded">
        <Type className="h-4 w-4" />
      </button>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      {/* Text Formatting */}
      <div className="flex items-center">
        <button className="p-1 text-gray-700 hover:bg-gray-100 rounded">
          <Bold className="h-4 w-4" />
        </button>
        <button className="p-1 text-gray-700 hover:bg-gray-100 rounded">
          <Italic className="h-4 w-4" />
        </button>
        <button className="p-1 text-gray-700 hover:bg-gray-100 rounded">
          <Underline className="h-4 w-4" />
        </button>
        <button className="p-1 text-gray-700 hover:bg-gray-100 rounded">
          <Strikethrough className="h-4 w-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      {/* Text Alignment */}
      <div className="flex items-center">
        <button
          className={cn("p-1 text-gray-700 hover:bg-gray-100 rounded", textAlign === "left" && "bg-gray-200")}
          onClick={() => handleTextAlignChange("left")}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          className={cn("p-1 text-gray-700 hover:bg-gray-100 rounded", textAlign === "center" && "bg-gray-200")}
          onClick={() => handleTextAlignChange("center")}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          className={cn("p-1 text-gray-700 hover:bg-gray-100 rounded", textAlign === "right" && "bg-gray-200")}
          onClick={() => handleTextAlignChange("right")}
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          className={cn("p-1 text-gray-700 hover:bg-gray-100 rounded", textAlign === "justify" && "bg-gray-200")}
          onClick={() => handleTextAlignChange("justify")}
        >
          <AlignJustify className="h-4 w-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      {/* Effects and Position */}
      <button className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">Effects</button>

      <button className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">Position</button>
    </div>
  )
}
