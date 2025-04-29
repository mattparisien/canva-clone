"use client"

import { useRef, useState, useEffect, type WheelEvent, type MouseEvent } from "react"
import { useCanvas } from "@/context/canvas-context"
import { ResizableElement } from "@/components/resizable-element"
import { AlignmentGuides } from "@/components/alignment-guides"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Plus, ChevronUp, ChevronDown, Minus, ZoomIn } from "lucide-react"

export function Canvas() {
  /* ------------------------------------------------------------------
   * Context / refs
   * ------------------------------------------------------------------ */
  const { elements, selectedElement, selectElement, canvasSize, availableSizes, changeCanvasSize } = useCanvas()

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
  useEffect(() => {
    const fit = () => {
      if (!containerRef.current) return
      const { clientWidth: cw, clientHeight: ch } = containerRef.current
      const widthRatio = (cw - 80) / canvasSize.width
      const heightRatio = (ch - 80) / canvasSize.height
      const fitScale = Math.min(widthRatio, heightRatio, 1)
      setZoom(Math.round(fitScale * 100))
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
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

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */
  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 flex-col items-center overflow-hidden bg-gray-100 p-4"
      onWheel={handleWheel}
    >
      {/* -------------------------------- Size Dropdown ------------------------------ */}
      <div className="absolute left-4 top-4 z-10">
        <Button
          variant="outline"
          className="flex items-center gap-1 bg-white"
          onClick={() => setShowSizeMenu(!showSizeMenu)}
        >
          <span>Resize</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        {showSizeMenu && (
          <div className="absolute mt-2 w-64 rounded-md border bg-white p-2 shadow-lg">
            <h3 className="mb-2 px-2 font-medium">Canvas size</h3>
            {availableSizes.map((size) => (
              <div
                key={size.name}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 hover:bg-gray-100"
                onClick={() => {
                  changeCanvasSize(size)
                  setShowSizeMenu(false)
                }}
              >
                <span>{size.name}</span>
                <span className="text-xs text-gray-500">
                  {size.width} × {size.height}px
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------------- Zoom controls ------------------------------ */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-md border bg-white px-2 py-1 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(25, zoom - 10))}>
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Slider value={[zoom]} min={25} max={400} step={5} className="w-24" onValueChange={([v]) => setZoom(v)} />
          <span className="min-w-12 text-center text-xs">{zoom}%</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(400, zoom + 10))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* -------------------------------- Scaled canvas ------------------------------ */}
      <div className="flex h-full w-full items-center justify-center overflow-auto">
        <div
          ref={scaleWrapperRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
          className="p-10"
        >
          <div
            ref={canvasRef}
            className="relative bg-white shadow-lg border border-gray-200"
            style={{ width: canvasSize.width, height: canvasSize.height }}
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
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md border bg-white px-4 py-2 shadow-md">
        <Button variant="ghost" size="sm">
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="text-sm">Page 1</span>
        <Button variant="ghost" size="sm">
          <ChevronDown className="h-4 w-4" />
        </Button>
        <div className="mx-2 h-4 w-px bg-gray-300" />
        <Button variant="ghost" size="sm" className="text-sm">
          <Plus className="mr-1 h-4 w-4" />
          Add page
        </Button>
      </div>

      {/* Debug info */}
      <div className="absolute bottom-16 left-4 z-50 rounded bg-white p-2 text-xs shadow-md">
        <div>
          Canvas: {canvasSize.width}x{canvasSize.height}
        </div>
        <div>
          Guides: H:{alignments.horizontal.length} V:{alignments.vertical.length}
        </div>
        <div>Dragging: {isDragging ? "Yes" : "No"}</div>
      </div>
    </div>
  )
}
