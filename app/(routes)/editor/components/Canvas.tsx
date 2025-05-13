"use client"

import { AlignmentGuides } from "@/(routes)/editor/components/AlignmentGuides"
import { ResizableElement } from "@/(routes)/editor/components/ResizableElement"
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react"
import { Element as CanvasElement } from "@lib/types/canvas.types" // Added explicit Element type import
import useEditorStore from "@lib/stores/useEditorStore"
import useCanvasStore, { useCurrentPageElements, useCurrentCanvasSize } from "@lib/stores/useCanvasStore"

export default function Canvas({
  zoom,
  setZoom
}: {
  zoom: number;
  setZoom: (zoom: number) => void;
}) {
  /* ------------------------------------------------------------------
   * Context / refs
   * ------------------------------------------------------------------ */
  // Use Zustand stores directly
  const isEditMode = useEditorStore(state => state.isEditMode)
  
  // Canvas store selectors
  const elements = useCurrentPageElements()
  const canvasSize = useCurrentCanvasSize()
  const selectedElementIds = useCanvasStore(state => state.selectedElementIds)
  const selectElement = useCanvasStore(state => state.selectElement)
  const selectCanvas = useCanvasStore(state => state.selectCanvas)
  const isCanvasSelected = useCanvasStore(state => state.isCanvasSelected)
  const fitCanvasToView = useCanvasStore(state => state.fitCanvasToView)
  const isElementSelected = useCanvasStore(state => state.isElementSelected)
  const selectedElement = useCanvasStore(state => state.selectedElement)
  const isLoaded = useCanvasStore(state => state.isLoaded)
  const updateMultipleElements = useCanvasStore(state => state.updateMultipleElements)

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
  const [isInitialRender, setIsInitialRender] = useState(true)


  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const scale = zoom / 100

  /* ------------------------------------------------------------------
   * Fit canvas to container on mount / resize
   * ------------------------------------------------------------------ */
  // const fitCanvasToView = useCallback(() => {
  //   if (!scaleWrapperRef.current) return;

  // //   // Get container dimensions
  // //   const containerWidth = scaleWrapperRef.current.clientWidth
  // //   const containerHeight = scaleWrapperRef.current.clientHeight

  // //   // Account for padding and UI elements with more accurate values
  // //   // Adjust these values based on your UI layout
  // //   const horizontalPadding = 120 // Increased padding on sides
  // //   const verticalPadding = 300   // Increased padding for top/bottom controls

  // //   const availableWidth = containerWidth - horizontalPadding
  // //   const availableHeight = containerHeight - verticalPadding

  // //   // Calculate the scale needed to fit the canvas
  // //   const widthRatio = availableWidth / canvasSize.width
  // //   const heightRatio = availableHeight / canvasSize.height

  // //   // Use the smaller ratio to ensure the canvas fits entirely
  // //   // Add a small buffer (0.95) to ensure there's always some margin
  // //   const fitScale = Math.min(widthRatio, heightRatio, 1) * 0.95

  // //   // Use the setZoom prop passed from Editor
  // //   setZoom(Math.round(fitScale * 100))
  // // }, [canvasSize.width, canvasSize.height, setZoom]);

  // // // Initial fit on mount and when canvas size changes
  // // useEffect(() => {
  // //   // Increased timeout to ensure all layout is complete
  // //   const timer = setTimeout(() => {
  // //     fitCanvasToView()
  // //     setIsInitialRender(false)
  // //   }, 300) // Increased from 100ms to 300ms

  // //   return () => clearTimeout(timer)
  // }, [canvasSize.width, canvasSize.height, fitCanvasToView])

  // Refit on window resize
  // useEffect(() => {
  //   window.addEventListener("resize", fitCanvasToView)
  //   return () => window.removeEventListener("resize", fitCanvasToView)
  // }, [canvasSize.width, canvasSize.height])

  // Clear selection when switching to view mode
  useEffect(() => {
    if (!isEditMode) {
      selectElement(null);
      selectCanvas(false);
    }
  }, [isEditMode, selectElement, selectCanvas]);


  /* ------------------------------------------------------------------
   * Canvas click → deselect
   * ------------------------------------------------------------------ */
  const handleCanvasClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    // If in view mode, do nothing
    if (!isEditMode) return;
    
    if (e.target === canvasRef.current) {
      // Toggle canvas selection if it's already selected
      if (isCanvasSelected) {
        selectCanvas(false);
      } else {
        // Select the canvas if target is the canvas itself
        selectCanvas(true);
      }
      
      // Clear element selection
      if (!e.shiftKey) {
        selectElement(null);
      }
    }
  }, [selectElement, selectCanvas, canvasRef, isCanvasSelected, isEditMode])

  /* ------------------------------------------------------------------
   * Drag handlers (logical units)
   * ------------------------------------------------------------------ */
  const handleDragStart = useCallback((element: any) => {
    // If in view mode, do nothing
    if (!isEditMode) return;
    
    setIsDragging(true)
    setActiveDragElement(element.id)
    setAlignments({ horizontal: [], vertical: [] })
    setLastDragPos({ x: element.x, y: element.y }) // Initialize last drag position
  }, [isEditMode])

  const handleDrag = useCallback((element: any, x: number, y: number, newAlignments: typeof alignments, isDragSelection: boolean = false) => {
    // If in view mode, do nothing
    if (!isEditMode) return;
    
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
  }, [selectedElementIds, updateMultipleElements, lastDragPos, isEditMode])

  const handleDragEnd = useCallback(() => {
    // If in view mode, do nothing
    if (!isEditMode) return;
    
    setIsDragging(false)
    setActiveDragElement(null)
    setAlignments({ horizontal: [], vertical: [] })
    setDebugInfo("")
    setLastDragPos(null) // Reset last drag position
  }, [isEditMode])

  // Handle element hover
  const handleElementHover = useCallback((id: string | null) => {
    // Only set hover states in edit mode
    if (isEditMode) {
      setIsHoveringChild(id !== null)
    }
  }, [isEditMode])

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */
  const [isCanvasHovering, setIsCanvasHovering] = useState(false)
  
  // Track when we're hovering over a child element to prevent canvas border
  const [isHoveringChild, setIsHoveringChild] = useState(false)

  // Only show border when hovering over canvas but not over its children, and only in edit mode
  const showCanvasBorder = isCanvasHovering && !isHoveringChild && isEditMode

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-gradient-to-b from-slate-50 to-slate-100 pattern-grid-slate-100">
      {/* Canvas scaling wrapper with subtle grid pattern */}
      <div
        ref={scaleWrapperRef}
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
        className="flex items-center justify-center relative shadow-[-3px 10px 27px -7px rgba(0,0,0,0.8)]"
      >
        
        {/* Loading indicator - shown when canvas is not loaded */}
        {!isLoaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-t-4 border-b-4 border-brand-blue rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 font-medium">Loading canvas...</p>
            </div>
          </div>
        )}
        
        {/* Actual canvas */}
        <div
          ref={canvasRef}
          className={`canvas-wrapper relative bg-white overflow-hidden rounded-lg z-10 transition-all duration-200 ${
            (isCanvasHovering && !isHoveringChild && isEditMode) 
              ? "ring-8 ring-brand-blue ring-opacity-60" 
              : (isCanvasSelected && isEditMode) 
              ? "ring-8 ring-brand-blue ring-opacity-80"
              : ""
          }`}
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            boxShadow: "0 6px 30px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)",
            cursor: isEditMode ? "default" : "default",
            borderRadius: "2px",
          }}
          onClick={handleCanvasClick}
          onMouseEnter={() => isEditMode && setIsCanvasHovering(true)}
          onMouseLeave={() => isEditMode && setIsCanvasHovering(false)}
        >
          {/* Guides with brand colors */}
          {isDragging && selectedElement && isEditMode && (
            <AlignmentGuides
              activeElement={selectedElement}
              elements={elements}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
              alignments={alignments}
            />
          )}

          {/* Canvas elements */}
          {elements.map((el) => (
            <ResizableElement
              key={el.id}
              element={el}
              isSelected={isEditMode && (selectedElementIds.includes(el.id) || selectedElement?.id === el.id)}
              scale={scale}
              canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
              allElements={elements}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onHover={handleElementHover}
              isEditMode={isEditMode}
            />
          ))}
          
          {/* Canvas editing overlay indicator - clean white background when selected */}
          {isCanvasSelected && isEditMode && (
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{
                border: '3px solid rgba(30, 136, 229, 0.8)',
                borderRadius: '3px'
              }}
            />
          )}
        </div>
        
        {/* Zoom indicator when changing zoom level */}
        <div 
          className={`absolute bottom-4 right-4 bg-white py-1 px-3 rounded-full shadow-md text-sm font-medium text-gray-700 transform transition-all duration-300 flex items-center gap-2 ${
            isInitialRender ? 'translate-y-10 opacity-0' : 'opacity-80 hover:opacity-100'
          }`}
          style={{ transformOrigin: 'bottom right', transform: `scale(${1/scale})` }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-blue">
            <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 21H3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 3L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{zoom}%</span>
        </div>
      </div>
    </div>
  )
}
