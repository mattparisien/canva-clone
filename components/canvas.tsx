"use client"

import { useRef, useState, useEffect, type WheelEvent, type MouseEvent } from "react"
import { useCanvas } from "@/context/canvas-context"
import { ResizableElement } from "@/components/resizable-element"
import { AlignmentGuides } from "@/components/alignment-guides"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Plus, ChevronUp, ChevronDown, Minus, ZoomIn, Search, Lock, Eye, Layers } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Canvas() {
  /* ------------------------------------------------------------------
   * Context / refs
   * ------------------------------------------------------------------ */
  const { elements, selectedElement, selectElement, canvasSize, availableSizes, sizeCategories, changeCanvasSize } =
    useCanvas()

  const containerRef = useRef<HTMLDivElement>(null) // the scrollable viewport
  const scaleWrapperRef = useRef<HTMLDivElement>(null) // wrapper that gets the CSS scale()
  const canvasRef = useRef<HTMLDivElement>(null) // un‑scaled logical canvas

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  const [zoom, setZoom] = useState(100) // 25 – 400 %
  const [showSizeMenu, setShowSizeMenu] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [activeDragElement, setActiveDragElement] = useState<string | null>(null)
  const [alignments, setAlignments] = useState({ horizontal: [] as number[], vertical: [] as number[] })
  const [debugInfo, setDebugInfo] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isInitialRender, setIsInitialRender] = useState(true)

  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const scale = zoom / 100

  /** Convert a client‑space coordinate to logical canvas units */
  const toLogical = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    }
  }

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

    console.log("Fitting canvas:", {
      containerSize: { width: containerWidth, height: containerHeight },
      availableSize: { width: availableWidth, height: availableHeight },
      canvasSize: { width: canvasSize.width, height: canvasSize.height },
      ratios: { width: widthRatio, height: heightRatio },
      fitScale,
    })

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
      e.preventDefault()
      const next = Math.round(Math.min(400, Math.max(25, zoom - e.deltaY * 0.1)))
      setZoom(next)
    }
  }

  /* ------------------------------------------------------------------
   * Canvas click → deselect
   * ------------------------------------------------------------------ */
  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) selectElement(null)
  }

  /* ------------------------------------------------------------------
   * Drag handlers (logical units)
   * ------------------------------------------------------------------ */
  const handleDragStart = (element: any) => {
    console.log("Drag started")
    setIsDragging(true)
    setActiveDragElement(element.id)
    setAlignments({ horizontal: [], vertical: [] })
  }

  const handleDrag = (element: any, x: number, y: number, newAlignments: typeof alignments) => {
    console.log("Dragging with alignments:", newAlignments)
    setAlignments(newAlignments)
    setDebugInfo(`Horizontal: ${newAlignments.horizontal.length}, Vertical: ${newAlignments.vertical.length}`)
  }

  const handleDragEnd = () => {
    console.log("Drag ended")
    setIsDragging(false)
    setActiveDragElement(null)
    setAlignments({ horizontal: [], vertical: [] })
    setDebugInfo("")
  }

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
      className="relative flex flex-1 flex-col items-center overflow-hidden bg-gray-50 p-4"
      onWheel={handleWheel}
    >
      {/* -------------------------------- Size Dropdown ------------------------------ */}
      <div className="absolute left-4 top-4 z-10">
        <Button
          variant="outline"
          className="flex items-center gap-1 bg-white border-gray-200 hover:border-primary hover:bg-primary-50 shadow-soft"
          onClick={() => setShowSizeMenu(!showSizeMenu)}
        >
          <span>{canvasSize.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        {showSizeMenu && (
          <div className="absolute mt-2 w-80 max-h-[80vh] overflow-y-auto rounded-lg border border-gray-100 bg-white p-4 shadow-medium">
            <h3 className="mb-3 font-medium text-gray-800">Canvas size</h3>

            {/* Search input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sizes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category tabs */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              <button
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === null
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveCategory(null)}
              >
                All
              </button>
              {sizeCategories.map((category) => (
                <button
                  key={category}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === category
                      ? "bg-primary-100 text-primary-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Size list */}
            <div className="max-h-80 overflow-y-auto rounded-md border border-gray-100">
              {filteredSizes.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">No sizes match your search</p>
              ) : (
                filteredSizes.map((size) => (
                  <div
                    key={`${size.category}-${size.name}`}
                    className="flex cursor-pointer items-center justify-between border-b border-gray-100 px-3 py-2.5 hover:bg-gray-50"
                    onClick={() => {
                      changeCanvasSize(size)
                      setShowSizeMenu(false)
                    }}
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-800">{size.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{size.category}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {size.width} × {size.height}px
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------- Canvas Tools ------------------------------ */}
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-1 py-1 shadow-soft">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
                <Lock className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lock element</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle visibility</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Layers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* -------------------------------- Zoom controls ------------------------------ */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 shadow-soft">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-600 hover:bg-gray-100"
          onClick={() => setZoom(Math.max(25, zoom - 10))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Slider value={[zoom]} min={25} max={400} step={5} className="w-24" onValueChange={([v]) => setZoom(v)} />
          <span className="min-w-12 text-center text-xs font-medium">{zoom}%</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-600 hover:bg-gray-100"
          onClick={() => setZoom(Math.min(400, zoom + 10))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-1 text-xs font-medium text-primary hover:bg-primary-50"
          onClick={fitCanvasToView}
        >
          Fit
        </Button>
      </div>

      {/* -------------------------------- Scaled canvas ------------------------------ */}
      <div className="flex h-full w-full items-center justify-center overflow-auto">
        <div
          ref={scaleWrapperRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
          className="flex items-center justify-center p-10"
        >
          <div
            ref={canvasRef}
            className="relative bg-white shadow-medium"
            style={{ width: canvasSize.width, height: canvasSize.height, border: "1px solid #e5e7eb" }}
            onClick={handleCanvasClick}
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
                isSelected={selectedElement?.id === el.id}
                scale={scale}
                canvasRef={canvasRef}
                allElements={elements}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------- Page controls ------------------------------ */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-soft">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100">
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-gray-800">Page 1</span>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100">
          <ChevronDown className="h-4 w-4" />
        </Button>
        <div className="mx-2 h-4 w-px bg-gray-200" />
        <Button variant="ghost" size="sm" className="text-sm text-gray-700 hover:bg-gray-100">
          <Plus className="mr-1.5 h-4 w-4" />
          Add page
        </Button>
      </div>
    </div>
  )
}
