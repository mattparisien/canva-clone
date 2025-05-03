"use client"

import { useRef, useState, useEffect, useCallback, type WheelEvent, type MouseEvent } from "react"
import { useCanvas } from "@/context/canvas-context"
import { ResizableElement } from "@/components/resizable-element"
import { AlignmentGuides } from "@/components/alignment-guides"
import { TextToolbar } from "@/components/text-toolbar"
import { Slider } from "@/components/ui/slider"
import { Plus, PenLine, LayoutGrid, Maximize, HelpCircle } from "lucide-react"
import { MIN_ZOOM, MAX_ZOOM } from "@/lib/constants/editor"

export function Canvas() {
  /* ------------------------------------------------------------------
   * Context / refs
   * ------------------------------------------------------------------ */
  const {
    elements,
    selectedElement,
    selectedElementIds,
    selectElement,
    canvasSize,
    availableSizes,
    sizeCategories,
    changeCanvasSize,
    updateElement,
    updateMultipleElements,
    addElement,
  } = useCanvas()

  const containerRef = useRef<HTMLDivElement>(null) // the scrollable viewport
  const scaleWrapperRef = useRef<HTMLDivElement>(null) // wrapper that gets the CSS scale()
  const canvasRef = useRef<HTMLDivElement>(null) // un‑scaled logical canvas

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  const [zoom, setZoom] = useState(100) // 25 – 200 %
  const [showSizeMenu, setShowSizeMenu] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [activeDragElement, setActiveDragElement] = useState<string | null>(null)
  const [alignments, setAlignments] = useState({ horizontal: [] as number[], vertical: [] as number[] })
  const [lastDragPos, setLastDragPos] = useState<{ x: number, y: number } | null>(null) // Track last drag position
  const [debugInfo, setDebugInfo] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isInitialRender, setIsInitialRender] = useState(true)
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null)
  const [isCanvasHovering, setIsCanvasHovering] = useState(false)

  // Define min and max zoom levels

  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const scale = zoom / 100

  /* ------------------------------------------------------------------
   * Fit canvas to container on mount / resize
   * ------------------------------------------------------------------ */
  const fitCanvasToView = () => {
    if (!containerRef.current) return

    // Get container dimensions, accounting for UI elements
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    // Account for padding and UI elements (top controls, bottom controls)
    const availableWidth = containerWidth - 100 // 50px padding on each side
    const availableHeight = containerHeight - 160 // Account for top and bottom controls + padding

    // Calculate the scale needed to fit the canvas
    const widthRatio = availableWidth / canvasSize.width
    const heightRatio = availableHeight / canvasSize.height

    // Use the smaller ratio to ensure the canvas fits entirely
    const fitScale = Math.min(widthRatio, heightRatio, 1) // Cap at 100%
    
    // Set the zoom level
    setZoom(Math.round(fitScale * 100))
  }

  // Initial fit on mount and when canvas size changes
  useEffect(() => {
    // Use a timeout to ensure the container has been properly rendered
    const timer = setTimeout(() => {
      fitCanvasToView()
      setIsInitialRender(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [canvasSize.width, canvasSize.height])

  // Refit on window resize
  useEffect(() => {
    window.addEventListener("resize", fitCanvasToView)
    return () => window.removeEventListener("resize", fitCanvasToView)
  }, [canvasSize.width, canvasSize.height])

  /* ------------------------------------------------------------------
   * Wheel zoom (ctrl / cmd + wheel)
   * ------------------------------------------------------------------ */
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Prevent the default browser zoom behavior
      e.preventDefault()
      e.stopPropagation()

      // Calculate the new zoom level based on the wheel delta
      // Increased multiplier for faster zoom response (from 0.05 to 0.25)
      const zoomDelta = e.deltaY * 0.25

      // Apply the zoom change with a larger step for faster response
      const next = Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom - zoomDelta)))
      setZoom(next)

      return false
    }
  }

  /* ------------------------------------------------------------------
   * Canvas click → deselect
   * ------------------------------------------------------------------ */
  const handleCanvasClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      // Only clear selection if shift key is not pressed
      if (!e.shiftKey) {
        selectElement(null)
      }
    }
  }, [selectElement, canvasRef])

  /* ------------------------------------------------------------------
   * Drag handlers (logical units)
   * ------------------------------------------------------------------ */
  const handleDragStart = useCallback((element: any) => {
    setIsDragging(true)
    setActiveDragElement(element.id)
    setAlignments({ horizontal: [], vertical: [] })
    setLastDragPos({ x: element.x, y: element.y }) // Initialize last drag position
  }, [])

  const handleDrag = useCallback((element: any, x: number, y: number, newAlignments: typeof alignments, isDragSelection: boolean = false) => {
    setAlignments(newAlignments)
    
    // When dragging multiple elements, update their positions
    if (isDragSelection && selectedElementIds.length > 1) {
      if (lastDragPos) {
        // Calculate the delta movement
        const deltaX = x - lastDragPos.x;
        const deltaY = y - lastDragPos.y;
        
        // Update positions of all selected elements
        updateMultipleElements((prev) => {
          return {
            x: prev.x + deltaX,
            y: prev.y + deltaY
          };
        });

        // Update last drag position
        setLastDragPos({ x, y });
      }
    }
  }, [selectedElementIds, updateMultipleElements, lastDragPos])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setActiveDragElement(null)
    setAlignments({ horizontal: [], vertical: [] })
    setDebugInfo("")
    setLastDragPos(null) // Reset last drag position
  }, [])

  // Handle element hover
  const handleElementHover = useCallback((id: string | null) => {
    setHoveredElementId(id)
    if (id) {
      setIsCanvasHovering(false)
    } else {
      // Only show canvas hover if not dragging and no element is selected
      if (!isDragging) {
        setIsCanvasHovering(true)
      }
    }
  }, [isDragging])

  // Handle font size change
  const handleFontSizeChange = useCallback((size: number) => {
    if (selectedElement && selectedElement.type === "text") {
      updateElement(selectedElement.id, { fontSize: size })
    }
  }, [selectedElement, updateElement])

  // Handle font family change
  const handleFontFamilyChange = useCallback((family: string) => {
    if (selectedElement && selectedElement.type === "text") {
      updateElement(selectedElement.id, { fontFamily: family })
    }
  }, [selectedElement, updateElement])

  // Handle text alignment change
  const handleTextAlignChange = useCallback((align: "left" | "center" | "right" | "justify") => {
    if (selectedElement && selectedElement.type === "text") {
      updateElement(selectedElement.id, { textAlign: align })
    }
  }, [selectedElement, updateElement])

  // Handle text formatting change
  const handleFormatChange = useCallback((format: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }) => {
    if (selectedElement && selectedElement.type === "text") {
      const updates: Partial<typeof selectedElement> = {};
      
      if (format.bold !== undefined) updates.isBold = format.bold;
      if (format.italic !== undefined) updates.isItalic = format.italic;
      if (format.underline !== undefined) updates.isUnderlined = format.underline;
      if (format.strikethrough !== undefined) updates.isStrikethrough = format.strikethrough;
      
      updateElement(selectedElement.id, updates);
    }
  }, [selectedElement, updateElement]);

  // Handle position change
  const handlePositionChange = useCallback((position: { x?: number, y?: number }) => {
    if (selectedElement) {
      updateElement(selectedElement.id, position);
    }
  }, [selectedElement, updateElement]);

  // Filter sizes based on search term and active category
  const filteredSizes = availableSizes.filter((size) => {
    const matchesSearch = searchTerm === "" || size.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === null || size.category === activeCategory
    return matchesSearch && matchesCategory
  })

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */
  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 flex-col items-center overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-8"
      onWheel={handleWheel}
    >
      {/* Text Formatting Toolbar */}
      {selectedElement && selectedElement.type === "text" &&
      <TextToolbar
        selectedElement={selectedElement}
        onFontSizeChange={handleFontSizeChange}
        onFontFamilyChange={handleFontFamilyChange}
        onTextAlignChange={handleTextAlignChange}
        onFormatChange={handleFormatChange}
        onPositionChange={handlePositionChange}
        isHovering={!!hoveredElementId}
        elementId={selectedElement?.id || null}
        canvasWidth={canvasSize.width}
      />}

      {/* -------------------------------- Scaled canvas ------------------------------ */}
      <div className="flex h-full w-full items-center justify-center overflow-auto">
        <div
          ref={scaleWrapperRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
          className="flex items-center justify-center p-12"
        >
          <div
            ref={canvasRef}
            className={`relative bg-white overflow-hidden rounded-2xl shadow-2xl border border-gray-200${isCanvasHovering ? " outline outline-primary" : ""}`}
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              boxShadow: "0 4px 32px 0 rgba(80, 60, 180, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              outlineWidth: isCanvasHovering ? `${Math.min(6, Math.max(2, 2 / scale))}px` : undefined,
              outlineStyle: isCanvasHovering ? "solid" : undefined,
            }}
            onClick={handleCanvasClick}
            onMouseEnter={() => { if (!hoveredElementId) setIsCanvasHovering(true) }}
            onMouseLeave={() => setIsCanvasHovering(false)}
          >
            {/* Guides - always render them when dragging */}
            {isDragging && selectedElement && (
              <AlignmentGuides
                activeElement={selectedElement}
                elements={elements}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
                alignments={alignments}
              />
            )}

            {/* Elements */}
            {elements.map((el) => (
              <ResizableElement
                key={el.id}
                element={el}
                isSelected={selectedElementIds.includes(el.id) || selectedElement?.id === el.id}
                scale={scale}
                canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
                allElements={elements}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onHover={handleElementHover}
              />
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------- Add Page Button ------------------------------ */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
        <button className="px-6 h-10 flex items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white/80 text-sm text-gray-500 hover:bg-white hover:text-gray-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add page</span>
        </button>
      </div>

      {/* -------------------------------- Bottom Bar ------------------------------ */}
      <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-4 bg-[#EDF1F5]">
        {/* Left side - Notes button */}
        <div className="flex items-center">
          <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <PenLine className="h-5 w-5" />
            <span className="font-medium">Notes</span>
          </button>
        </div>

        {/* Right side - Zoom controls and page info */}
        <div className="flex items-center gap-6">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <div className="w-36 h-1 bg-gray-300 rounded-full relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white border border-gray-300 cursor-pointer"
                style={{ left: `${((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%` }}
              ></div>
              <Slider
                value={[zoom]}
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={1}
                className="absolute inset-0 opacity-0"
                onValueChange={([v]) => setZoom(v)}
              />
            </div>
            <span className="text-sm text-gray-700 font-medium">{zoom}%</span>
          </div>

          {/* Pages button */}
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-medium">Pages</span>
            </button>
          </div>

          {/* Page counter */}
          <span className="text-sm text-gray-700">1 / 1</span>

          {/* Grid view */}
          <button className="text-gray-700 hover:text-gray-900">
            <LayoutGrid className="h-5 w-5" />
          </button>

          {/* Fullscreen */}
          <button className="text-gray-700 hover:text-gray-900">
            <Maximize className="h-5 w-5" />
          </button>

          {/* Help */}
          <button className="text-gray-700 hover:text-gray-900">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
