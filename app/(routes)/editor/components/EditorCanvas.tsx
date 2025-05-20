"use client"

import { AlignmentGuides } from "@/(routes)/editor/components/AlignmentGuides"
import { EditorCanvasElement } from "@/(routes)/editor/components/EditorCanvasElement"
import { calculateFitScale } from "@/lib/utils/canvas-utils"
import useCanvasStore, { useCurrentCanvasSize, useCurrentPageElements } from "@lib/stores/useCanvasStore"
import useEditorStore from "@lib/stores/useEditorStore"
import classNames from "classnames"
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react"

export default function Canvas({
  zoom,
  setZoom,
  editorRef
}: {
  zoom: number;
  setZoom: (zoom: number) => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
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
  const togggleCanvasSelection = useCanvasStore(state => state.toggleCanvasSelection)
  const selectedElement = useCanvasStore(state => state.selectedElement)
  const isLoaded = useCanvasStore(state => state.isLoaded)
  const updateMultipleElements = useCanvasStore(state => state.updateMultipleElements)

  const canvasRef = useRef<HTMLDivElement>(null) // un‑scaled logical canvas

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  const [isDragging, setIsDragging] = useState(false)
  const [activeDragElement, setActiveDragElement] = useState<string | null>(null)
  const [alignments, setAlignments] = useState({ horizontal: [] as number[], vertical: [] as number[] })
  const [lastDragPos, setLastDragPos] = useState<{ x: number, y: number } | null>(null) // Track last drag position


  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const scale = zoom / 100


  // Fit canvas to container logic
  const fitCanvasToContainer = useCallback(() => {
    if (isLoaded && canvasRef.current && editorRef?.current && canvasSize.width > 0 && canvasSize.height > 0) {
      const container = editorRef.current;
      const newScale = calculateFitScale(
        canvasSize.width,
        canvasSize.height,
        container.clientWidth,
        container.clientHeight
      );
      // Set a minimum zoom level, e.g., 5%
      const newZoom = Math.max(5, Math.round(newScale * 100));

      if (zoom !== newZoom) { // Only update if zoom needs to change
        setZoom(newZoom);
      }
    }
  }, [isLoaded, editorRef, canvasSize, setZoom, zoom]); // Added zoom to dependencies

  useEffect(() => {
    // Initial fit (with a slight delay for layout stabilization)
    const timeoutId = setTimeout(fitCanvasToContainer, 50);

    // Fit on window resize
    window.addEventListener('resize', fitCanvasToContainer);

    // Optional: For more precise fitting if editorRef resizes independently of the window,
    // you could use a ResizeObserver on editorRef.current here.

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', fitCanvasToContainer);
      // If using ResizeObserver, disconnect it here.
    };
  }, [fitCanvasToContainer, canvasSize]); // Re-run if fitCanvasToContainer or canvasSize changes

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


  // Clear isHoveringChild when leaving canvas
  const handleCanvasMouseLeave = useCallback(() => {
    setIsCanvasHovering(false)
    setIsHoveringChild(false)
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e: globalThis.MouseEvent) => {
      // Only deselect if canvas is currently selected AND click is outside canvas
      if (canvasRef.current &&
        !canvasRef.current.contains(e.target as Node) &&
        isCanvasSelected) {
        togggleCanvasSelection();
      }
    };

    // Add the event listener
    window.addEventListener("click", handleOutsideClick);

    // Clean up the event listener
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [isCanvasSelected, togggleCanvasSelection]);


  const isBorderActive = (isCanvasSelected && isEditMode) || isCanvasHovering && isEditMode;

  return (

    <div
      ref={canvasRef}
      className={classNames("flex items-center justify-center p-1 z-50 relative bg-white shadow-[-3px 10px 27px -7px rgba(0,0,0,0.8)] overflow-hidden",
        // "border-4 border-brand-blue": isBorderActive,
        isBorderActive && "is-highlighted"
      )}
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        flexShrink: 0, // Add flex-shrink to prevent squeezing by flex parents
        boxShadow: "0 6px 30px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)",
        cursor: isEditMode ? "default" : "default",
        borderRadius: "2px",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        // Fix: TypeScript custom property using type assertion
        ['--canvas-scale' as string]: `${scale}`,
        zIndex: 'var(--editor-canvas-z)'
      }}
      onClick={handleCanvasClick}
      onMouseLeave={handleCanvasMouseLeave}
      onMouseEnter={() => {
        console.log('Canvas mouse enter triggered');
        if (isEditMode) setIsCanvasHovering(true);
      }}

    >

      {/* Loading indicator - shown when canvas is not loaded */}
      {
        !isLoaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-t-4 border-b-4 border-brand-blue rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 font-medium">Loading canvas...</p>
            </div>
          </div>
        )
      }

      {/* Guides with brand colors */}
      {
        isDragging && selectedElement && isEditMode && (
          <AlignmentGuides
            activeElement={selectedElement}
            elements={elements}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            alignments={alignments}
          />
        )
      }

      {/* Canvas elements */}
      {
        elements.map((el) => (
          <EditorCanvasElement
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
        ))
      }
    </div>
  )
}
