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
import { 
  FONT_FAMILIES, 
  DEFAULT_FONT_SIZE, 
  MIN_FONT_SIZE, 
  MAX_FONT_SIZE,
  DEFAULT_TEXT_ALIGN,
  type TextAlignment
} from "@/lib/constants/editor"

interface TextToolbarProps {
  selectedElement: Element | null
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (family: string) => void
  onTextAlignChange: (align: TextAlignment) => void
  onFormatChange?: (format: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }) => void
  isHovering: boolean
  elementId: string | null
}

export function TextToolbar({
  selectedElement,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  onFormatChange,
  elementId,
}: TextToolbarProps) {
  const [fontSize, setFontSize] = useState(selectedElement?.fontSize || DEFAULT_FONT_SIZE)
  const [fontFamily, setFontFamily] = useState(selectedElement?.fontFamily || FONT_FAMILIES[0])
  const [showFontDropdown, setShowFontDropdown] = useState(false)
  const [isToolbarHovered, setIsToolbarHovered] = useState(false)
  const [textAlign, setTextAlign] = useState<TextAlignment>(
    selectedElement?.textAlign || DEFAULT_TEXT_ALIGN
  )
  // Add text formatting states
  const [isBold, setIsBold] = useState(selectedElement?.isBold || false)
  const [isItalic, setIsItalic] = useState(selectedElement?.isItalic || false)
  const [isUnderlined, setIsUnderlined] = useState(selectedElement?.isUnderlined || false)
  const [isStrikethrough, setIsStrikethrough] = useState(selectedElement?.isStrikethrough || false)
  
  const toolbarRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update local state when selected element changes
  useEffect(() => {
    if (selectedElement?.type === "text") {
      setFontSize(selectedElement.fontSize || DEFAULT_FONT_SIZE)
      setFontFamily(selectedElement.fontFamily || FONT_FAMILIES[0])
      setTextAlign(selectedElement.textAlign || DEFAULT_TEXT_ALIGN)
      setIsBold(selectedElement.isBold || false)
      setIsItalic(selectedElement.isItalic || false)
      setIsUnderlined(selectedElement.isUnderlined || false)
      setIsStrikethrough(selectedElement.isStrikethrough || false)
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

  const handleTextAlignChange = (align: TextAlignment) => {
    setTextAlign(align)
    onTextAlignChange(align)
  }

  // Handle text formatting changes
  const handleBoldChange = () => {
    const newValue = !isBold
    setIsBold(newValue)
    if (onFormatChange) {
      onFormatChange({ bold: newValue })
    }
  }

  const handleItalicChange = () => {
    const newValue = !isItalic
    setIsItalic(newValue)
    if (onFormatChange) {
      onFormatChange({ italic: newValue })
    }
  }

  const handleUnderlineChange = () => {
    const newValue = !isUnderlined
    setIsUnderlined(newValue)
    if (onFormatChange) {
      onFormatChange({ underline: newValue })
    }
  }

  const handleStrikethroughChange = () => {
    const newValue = !isStrikethrough
    setIsStrikethrough(newValue)
    if (onFormatChange) {
      onFormatChange({ strikethrough: newValue })
    }
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

  return (
    <div
      ref={toolbarRef}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white rounded-xl shadow-lg px-4 py-2 gap-2 border border-gray-100"
      onMouseEnter={handleToolbarMouseEnter}
      onMouseLeave={handleToolbarMouseLeave}
    >
      {/* Font Family Dropdown */}
      <div className="relative">
        <button
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm"
          onClick={() => setShowFontDropdown(!showFontDropdown)}
        >
          <span>{fontFamily}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {showFontDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {FONT_FAMILIES.map((font) => (
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
          className="rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm"
          onClick={() => handleFontSizeChange(Math.max(MIN_FONT_SIZE, fontSize - 1))}
        >
          <Minus className="h-4 w-4" />
        </button>

        <input
          type="number"
          value={fontSize}
          onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          className="rounded-md border border-gray-200 px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-purple-400 focus:outline-none"
        />

        <button
          className="rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm"
          onClick={() => handleFontSizeChange(Math.min(MAX_FONT_SIZE, fontSize + 1))}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      {/* Text Color (placeholder) */}
      <button className="rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm">
        <Type className="h-4 w-4" />
      </button>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      {/* Text Formatting */}
      <div className="flex items-center">
        <button 
          className={cn("rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm", 
            isBold && "bg-purple-100 text-purple-700")}
          onClick={handleBoldChange}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button 
          className={cn("rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm", 
            isItalic && "bg-purple-100 text-purple-700")}
          onClick={handleItalicChange}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button 
          className={cn("rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm", 
            isUnderlined && "bg-purple-100 text-purple-700")}
          onClick={handleUnderlineChange}
        >
          <Underline className="h-4 w-4" />
        </button>
        <button 
          className={cn("rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm", 
            isStrikethrough && "bg-purple-100 text-purple-700")}
          onClick={handleStrikethroughChange}
        >
          <Strikethrough className="h-4 w-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      {/* Text Alignment */}
      <div className="flex items-center">
        <button
          className={cn("rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm", textAlign === "left" && "bg-gray-200")}
          onClick={() => handleTextAlignChange("left")}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          className={cn("rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm", textAlign === "center" && "bg-gray-200")}
          onClick={() => handleTextAlignChange("center")}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          className={cn("rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm", textAlign === "right" && "bg-gray-200")}
          onClick={() => handleTextAlignChange("right")}
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          className={cn("rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm", textAlign === "justify" && "bg-gray-200")}
          onClick={() => handleTextAlignChange("justify")}
        >
          <AlignJustify className="h-4 w-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      {/* Effects and Position */}
      <button className="rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm">Effects</button>

      <button className="rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium shadow-sm">Position</button>
    </div>
  )
}
