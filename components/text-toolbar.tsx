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
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TextToolbarProps {
  selectedElement: Element | null
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (family: string) => void
  onTextAlignChange: (align: TextAlignment) => void
  onFormatChange?: (format: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }) => void
  onPositionChange?: (position: { x?: number; y?: number }) => void
  isHovering: boolean
  elementId: string | null
  canvasWidth: number
}

export function TextToolbar({
  selectedElement,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  onFormatChange,
  onPositionChange,
  elementId,
  canvasWidth,
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
  // Add position state
  const [isPositionPopoverOpen, setIsPositionPopoverOpen] = useState(false)
  
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
  const handleFontSizeChange = (newSize: number | string) => {
    // If empty string, just update the input value but don't apply the change
    if (newSize === '') {
      setFontSize('' as unknown as number);
      return;
    }
    
    // Convert to number and clamp value between min and max
    const sizeAsNumber = Number(newSize);
    const clampedSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, sizeAsNumber));
    setFontSize(clampedSize);
    onFontSizeChange(clampedSize);
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

  // Handle horizontal positioning changes
  const handleAlignStart = () => {
    if (!selectedElement || !onPositionChange) return;
    onPositionChange({ x: 0 });
  }
  
  const handleAlignCenter = () => {
    if (!selectedElement || !onPositionChange) return;
    const centerX = (canvasWidth - selectedElement.width) / 2;
    onPositionChange({ x: centerX });
  }
  
  const handleAlignEnd = () => {
    if (!selectedElement || !onPositionChange) return;
    const endX = canvasWidth - selectedElement.width;
    onPositionChange({ x: endX });
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
      className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center bg-white/95 backdrop-blur-sm rounded-md shadow-toolbar-float px-2.5 py-1.5 gap-1 border border-gray-100"
      onMouseEnter={handleToolbarMouseEnter}
      onMouseLeave={handleToolbarMouseLeave}
    >
      {/* Font Family Dropdown */}
      <div className="relative">
        <button
          className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition font-medium text-sm w-[100px]"
          onClick={() => setShowFontDropdown(!showFontDropdown)}
        >
          <span className="truncate">{fontFamily}</span>
          <ChevronDown className="h-3 w-3 opacity-70 flex-shrink-0" />
        </button>

        {showFontDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto border border-gray-100">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm hover:bg-gray-50",
                  fontFamily === font ? "bg-gray-50 font-medium text-purple-600" : "",
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

      <div className="h-5 w-px bg-gray-200 mx-1"></div>

      {/* Font Size Controls */}
      <div className="flex items-center">
        <div className="flex items-stretch rounded-xl overflow-hidden border border-gray-200">
          <button
            className="px-2 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-purple-600 transition flex items-center justify-center border-r border-gray-200"
            onClick={() => handleFontSizeChange(fontSize - 1)}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <input
            type="number"
            value={fontSize}
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            placeholder="– –"
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="w-12 px-1.5 py-0.5 text-sm font-medium focus:ring-1 focus:ring-purple-400 focus:outline-none text-center border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            className="px-2 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-purple-600 transition flex items-center justify-center border-l border-gray-200"
            onClick={() => handleFontSizeChange(fontSize + 1)}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="h-5 w-px bg-gray-200 mx-1"></div>

      {/* Text Color (placeholder) */}
      <button className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition">
        <Type className="h-3.5 w-3.5" />
      </button>

      <div className="h-5 w-px bg-gray-200 mx-1"></div>

      {/* Text Formatting */}
      <div className="flex items-center">
        <button 
          className={cn("rounded-xl p-1.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition", 
            isBold && "bg-purple-50 text-purple-600")}
          onClick={handleBoldChange}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button 
          className={cn("rounded-xl p-1.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition", 
            isItalic && "bg-purple-50 text-purple-600")}
          onClick={handleItalicChange}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button 
          className={cn("rounded-xl p-1.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition", 
            isUnderlined && "bg-purple-50 text-purple-600")}
          onClick={handleUnderlineChange}
        >
          <Underline className="h-3.5 w-3.5" />
        </button>
        <button 
          className={cn("rounded-xl p-1.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition", 
            isStrikethrough && "bg-purple-50 text-purple-600")}
          onClick={handleStrikethroughChange}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-5 w-px bg-gray-200 mx-1"></div>

      {/* Text Alignment */}
      <div className="flex items-center">
        <button
          className={cn("rounded-xl p-1.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition", 
            textAlign === "left" && "bg-purple-50 text-purple-600")}
          onClick={() => handleTextAlignChange("left")}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button
          className={cn("rounded-xl p-1.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition", 
            textAlign === "center" && "bg-purple-50 text-purple-600")}
          onClick={() => handleTextAlignChange("center")}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button
          className={cn("rounded-xl p-1.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition", 
            textAlign === "right" && "bg-purple-50 text-purple-600")}
          onClick={() => handleTextAlignChange("right")}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </button>
        <button
          className={cn("rounded-xl p-1.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition", 
            textAlign === "justify" && "bg-purple-50 text-purple-600")}
          onClick={() => handleTextAlignChange("justify")}
        >
          <AlignJustify className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-5 w-px bg-gray-200 mx-1"></div>

      {/* Effects and Position */}
      <div className="flex items-center">
        <button className="rounded-xl px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition text-sm font-medium">Effects</button>
  
        <div className="h-5 w-px bg-gray-200 mx-1"></div>
  
        <Popover>
          <PopoverTrigger asChild>
            <button className="rounded-xl px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition text-sm font-medium">Position</button>
          </PopoverTrigger>
          <PopoverContent className="w-auto bg-white border border-gray-100 rounded-xl shadow-lg p-2">
            <div className="flex flex-col gap-1">
              <button className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition text-sm font-medium" onClick={handleAlignStart}>
                <AlignStartHorizontal className="h-4 w-4" />
                <span>Align Start</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition text-sm font-medium" onClick={handleAlignCenter}>
                <AlignCenterHorizontal className="h-4 w-4" />
                <span>Align Center</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition text-sm font-medium" onClick={handleAlignEnd}>
                <AlignEndHorizontal className="h-4 w-4" />
                <span>Align End</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
