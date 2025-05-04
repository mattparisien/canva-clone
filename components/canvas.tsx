"use client"

import { AlignmentGuides } from "@/components/alignment-guides"
import { ResizableElement } from "@/components/resizable-element"
import { useCanvas } from "@/context/canvas-context"
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react"

export function Canvas({
  zoom,
  setZoom
}: {
  zoom: number;
  setZoom: (zoom: number) => void;
}) {
  /* ------------------------------------------------------------------
   * Context / refs
   * ------------------------------------------------------------------ */
  const {
    elements,
    selectedElement,
    selectedElementIds,
    selectElement,
    isCanvasSelected,
    selectCanvas,
    canvasSize,
    availableSizes,
    sizeCategories,
    changeCanvasSize,
    updateElement,
    updateMultipleElements,
    addElement,
  } = useCanvas()

  const scaleWrapperRef = useRef<HTMLDivElement>(null) // wrapper that gets the CSS scale()
  const canvasRef = useRef<HTMLDivElement>(null) // un‑scaled logical canvas

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  const [isDragging, setIsDragging] = useState(false)
  const [activeDragElement, setActiveDragElement] = useState<string | null>(null)
  const [alignments, setAlignments] = useState({ horizontal: [] as number[], vertical: [] as number[] })
  const [lastDragPos, setLastDragPos] = useState<{ x: number, y: number } | null>(null) // Track last drag position
  const [debugInfo, setDebugInfo] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isInitialRender, setIsInitialRender] = useState(true)


  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const scale = zoom / 100

  /* ------------------------------------------------------------------
   * Fit canvas to container on mount / resize
   * ------------------------------------------------------------------ */
  const fitCanvasToView = useCallback(() => {
    if (!scaleWrapperRef.current) return

    // Get container dimensions, accounting for UI elements
    const containerWidth = scaleWrapperRef.current.clientWidth
    const containerHeight = scaleWrapperRef.current.clientHeight

    // Account for padding and UI elements (top controls, bottom controls)
    const availableWidth = containerWidth - 100 // 50px padding on each side
    const availableHeight = containerHeight - 160 // Account for top and bottom controls + padding

    // Calculate the scale needed to fit the canvas
    const widthRatio = availableWidth / canvasSize.width
    const heightRatio = availableHeight / canvasSize.height

    // Use the smaller ratio to ensure the canvas fits entirely
    const fitScale = Math.min(widthRatio, heightRatio, 1) // Cap at 100%

    // Use the setZoom prop passed from Editor
    setZoom(Math.round(fitScale * 100))
  }, [canvasSize.width, canvasSize.height, setZoom]);

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
   * Canvas click → deselect
   * ------------------------------------------------------------------ */
  const handleCanvasClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      // Select the canvas if target is the canvas itself
      selectCanvas(true);
      
      // Clear element selection
      if (!e.shiftKey) {
        selectElement(null);
      }
    }
  }, [selectElement, selectCanvas, canvasRef])

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
    setIsHoveringChild(id !== null)
  }, [])

  // Filter sizes based on search term and active category
  const filteredSizes = availableSizes.filter((size) => {
    const matchesSearch = searchTerm === "" || size.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === null || size.category === activeCategory
    return matchesSearch && matchesCategory
  })

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */
  const [isCanvasHovering, setIsCanvasHovering] = useState(false)
  
  // Track when we're hovering over a child element to prevent canvas border
  const [isHoveringChild, setIsHoveringChild] = useState(false)

  // Only show border when hovering over canvas but not over its children
  const showCanvasBorder = isCanvasHovering && !isHoveringChild

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto">
      <div
        ref={scaleWrapperRef}
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
        className="flex items-center justify-center p-12 canvas-wrapper"
      >
        <div
          ref={canvasRef}
          className={`relative bg-white overflow-hidden ${showCanvasBorder ? "outline outline-primary" : ""} ${isCanvasSelected ? "outline outline-primary" : ""}`}
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            boxShadow: "0 4px 32px 0 rgba(80, 60, 180, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            outlineWidth: (showCanvasBorder || isCanvasSelected) ? `${Math.min(6, Math.max(2, 2 / scale))}px` : undefined,
          }}
          onClick={handleCanvasClick}
          onMouseEnter={() => setIsCanvasHovering(true)}
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
  )
}
