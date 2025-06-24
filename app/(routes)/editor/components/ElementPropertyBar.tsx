"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import type { Element } from "@/lib/types/canvas" // Update import to use types directly
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGN,
  FONT_FAMILIES,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  type TextAlignment
} from "@/lib/constants/editor"
import { cn } from "@/lib/utils/utils"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Italic,
  Minus,
  Plus,
  Strikethrough,
  Type,
  Underline
} from "lucide-react"
import { useEffect, useRef, useState, forwardRef, ForwardRefRenderFunction, useCallback } from "react"
import useEditorStore from "@/lib/stores/useEditorStore"

// Common button style classes
const BUTTON_BASE_CLASSES = "text-gray-500 hover:bg-gray-50 hover:text-brand-blue transition"
const BUTTON_ICON_CLASSES = "p-1.5"
const BUTTON_ACTIVE_CLASSES = "bg-brand-blue-light text-brand-blue"
const BUTTON_ROUNDED_XL = "rounded-xl"
const BUTTON_ROUNDED_LG = "rounded-lg"

// Reusable components
interface ToolbarButtonProps {
  onClick: (e: React.MouseEvent) => void
  isActive?: boolean
  children: React.ReactNode
  className?: string
  title?: string
  rounded?: 'xl' | 'lg'
}

const ToolbarButton = ({ onClick, isActive, children, className = "", title, rounded = 'xl' }: ToolbarButtonProps) => {
  const roundedClass = rounded === 'xl' ? BUTTON_ROUNDED_XL : BUTTON_ROUNDED_LG
  return (
    <button
      className={cn(
        BUTTON_BASE_CLASSES,
        BUTTON_ICON_CLASSES,
        roundedClass,
        isActive && BUTTON_ACTIVE_CLASSES,
        className
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

const Divider = () => <div className="h-5 w-px bg-gray-200 mx-1"></div>

interface ElementPropertyBarProps {
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

const ElementPropertyBarComponent: ForwardRefRenderFunction<HTMLDivElement, ElementPropertyBarProps> = ({
  selectedElement,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  onFormatChange,
  onPositionChange,
  elementId,
  canvasWidth,
}, ref) => {
  const [fontSize, setFontSize] = useState(selectedElement?.fontSize || DEFAULT_FONT_SIZE)
  const [fontFamily, setFontFamily] = useState(selectedElement?.fontFamily || FONT_FAMILIES[0])
  const [showFontDropdown, setShowFontDropdown] = useState(false)
  const [isToolbarHovered, setIsToolbarHovered] = useState(false)
  const [textAlign, setTextAlign] = useState<TextAlignment>(
    selectedElement?.textAlign || DEFAULT_TEXT_ALIGN
  )
  // Add text formatting states
  const [isBold, setIsBold] = useState(selectedElement?.bold || false)
  const [isItalic, setIsItalic] = useState(selectedElement?.italic || false)
  const [isUnderlined, setIsUnderlined] = useState(selectedElement?.underline || false)
  const [isStrikethrough, setIsStrikethrough] = useState(selectedElement?.isStrikethrough || false)
  // Add position state

  const openSidebarPanel = useEditorStore((state) => state.openSidebarPanel);
  const closeSidebarPanel = useEditorStore((state) => state.closeSidebarPanel);
  const isPanelOpen = useEditorStore((state) => state.sidebarPanel.isOpen);


  const toolbarRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Combine internal ref with forwarded ref
  const handleRef = (node: HTMLDivElement) => {
    toolbarRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // Update local state when selected element changes
  useEffect(() => {
    if (selectedElement?.kind === "text") {
      setFontSize(selectedElement.fontSize || DEFAULT_FONT_SIZE)
      setFontFamily(selectedElement.fontFamily || FONT_FAMILIES[0])
      setTextAlign(selectedElement.textAlign || DEFAULT_TEXT_ALIGN)
      setIsBold(selectedElement.bold || false)
      setIsItalic(selectedElement.italic || false)
      setIsUnderlined(selectedElement.underline || false)
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

  // Handle text formatting changes - DRY approach with unified handler
  const handleFormatChange = (formatType: 'bold' | 'italic' | 'underline' | 'strikethrough') =>
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentValue = {
        bold: isBold,
        italic: isItalic,
        underline: isUnderlined,
        strikethrough: isStrikethrough
      }[formatType];

      const newValue = !currentValue;

      // Update local state
      switch (formatType) {
        case 'bold':
          setIsBold(newValue);
          break;
        case 'italic':
          setIsItalic(newValue);
          break;
        case 'underline':
          setIsUnderlined(newValue);
          break;
        case 'strikethrough':
          setIsStrikethrough(newValue);
          break;
      }

      // Call parent handler
      if (onFormatChange) {
        onFormatChange({ [formatType]: newValue });
      }
    };

  // Handle horizontal positioning changes
  const handleAlignStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement || !onPositionChange) return;
    onPositionChange({ x: 0 });
  }

  const handleAlignCenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement || !onPositionChange) return;
    const centerX = (canvasWidth - selectedElement.width) / 2;
    onPositionChange({ x: centerX });
  }

  const handleAlignEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Function to stop propagation of click events
  const handleToolbarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleTextColorButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPanelOpen) {
      openSidebarPanel("text-color");
    } else {
      closeSidebarPanel();
    }
  }, [isPanelOpen, openSidebarPanel, closeSidebarPanel]);

  const handleBackgroundColorButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openSidebarPanel("background-color");
  }, [openSidebarPanel]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  // Determine if we're dealing with a text element or shape element
  const isTextElement = selectedElement?.kind === "text";
  const isShapeElement = selectedElement && !isTextElement;

  return (
    <div
      ref={handleRef}
      className="absolute left-1/2 -translate-x-1/2 z-40 flex items-center bg-white/95 backdrop-blur-sm rounded-md shadow-toolbar-float px-2.5 py-1.5 gap-1 border border-gray-100 z-editor-popover"
      onMouseEnter={handleToolbarMouseEnter}
      onMouseLeave={handleToolbarMouseLeave}
      onClick={handleToolbarClick}
      data-editor-interactive="true"
      style={{
        height: "var(--editor-propertyBar-height)",
        top: "var(--editor-propertyBar-topOffset)",
      }}
    >
      {/* Text Element Controls - Show all text-related controls */}
      {isTextElement && (
        <>
          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition font-medium text-sm w-[100px]"
              onClick={(e) => {
                e.stopPropagation();
                setShowFontDropdown(!showFontDropdown);
              }}
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
                      fontFamily === font ? "bg-gray-50 font-medium text-brand-blue" : "",
                    )}
                    style={{ fontFamily: font }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFontFamilyChange(font);
                    }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Font Size Controls */}
          <div className="flex items-center">
            <div className="flex items-stretch rounded-lg overflow-hidden border border-gray-200">
              <button
                className="px-2 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-brand-blue transition flex items-center justify-center border-r border-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFontSizeChange(fontSize - 1);
                }}
              >
                <Minus className="h-4 w-4" />
              </button>

              <input
                type="number"
                value={fontSize}
                min={MIN_FONT_SIZE}
                max={MAX_FONT_SIZE}
                placeholder="– –"
                onChange={(e) => handleFontSizeChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-12 px-1.5 py-0.5 text-sm font-medium focus:ring-1 focus:ring-brand-blue focus:outline-none text-center border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                className="px-2 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-brand-blue transition flex items-center justify-center border-l border-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFontSizeChange(fontSize + 1);
                }}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Text Color with Hue Bar */}
          <ToolbarButton onClick={handleTextColorButtonClick} title="Text Color">
            <Type className="h-4 w-4 mx-auto" />
            <div className="w-6 h-[6px] bg-center bg-repeat bg-contain rounded-sm border-[0.8px] border-neutral-400" style={{
              backgroundImage: `url(hue-bar.png)`
            }}></div>
          </ToolbarButton>

          <Divider />

          {/* Text Formatting */}
          <div className="flex items-center">
            <ToolbarButton onClick={handleFormatChange('bold')} isActive={isBold}>
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={handleFormatChange('italic')} isActive={isItalic}>
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={handleFormatChange('underline')} isActive={isUnderlined}>
              <Underline className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={handleFormatChange('strikethrough')} isActive={isStrikethrough} rounded="lg">
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Text Alignment */}
          <div className="flex items-center">
            <ToolbarButton
              onClick={(e) => {
                e.stopPropagation();
                handleTextAlignChange("left");
              }}
              isActive={textAlign === "left"}
              rounded="lg"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={(e) => {
                e.stopPropagation();
                handleTextAlignChange("center");
              }}
              isActive={textAlign === "center"}
              rounded="lg"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={(e) => {
                e.stopPropagation();
                handleTextAlignChange("right");
              }}
              isActive={textAlign === "right"}
              rounded="lg"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Divider />
        </>
      )}

      {/* Shape Element Controls - Show color control for shapes */}
      {isShapeElement && (
        <>
          {/* Shape Color with Hue Wheel */}
          <ToolbarButton onClick={handleBackgroundColorButtonClick} title="Shape Color">
            <div className="w-5 h-5 bg-center bg-contain rounded-full border-[0.8px] border-neutral-400" style={{
              backgroundImage: `url(hue-wheel.png)`
            }}></div>
          </ToolbarButton>

          <Divider />
        </>
      )}

      {/* Position Controls - Show for both text and shape elements */}
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button className="rounded-xl px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition text-sm font-medium">Position</button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3 bg-white border border-gray-100 rounded-xl shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 justify-between">
                <button
                  className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 hover:text-brand-blue transition"
                  onClick={handleAlignStart}
                >
                  <AlignLeft className="h-4 w-4" />
                  <span className="text-xs font-medium">Left</span>
                </button>
                <button
                  className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 hover:text-brand-blue transition"
                  onClick={handleAlignCenter}
                >
                  <AlignCenter className="h-4 w-4" />
                  <span className="text-xs font-medium">Center</span>
                </button>
                <button
                  className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 hover:text-brand-blue transition"
                  onClick={handleAlignEnd}
                >
                  <AlignRight className="h-4 w-4" />
                  <span className="text-xs font-medium">Right</span>
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export const ElementPropertyBar = forwardRef<HTMLDivElement, ElementPropertyBarProps>(ElementPropertyBarComponent);
