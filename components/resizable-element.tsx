"use client"

import type React from "react"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { useCanvas } from "@/context/canvas-context"
import type { Element } from "@/context/canvas-context"
import { TextEditor } from "@/components/text-editor"
import { Trash2 } from "lucide-react"

interface ResizableElementProps {
  element: Element
  isSelected: boolean
  scale: number
  canvasRef: React.RefObject<HTMLDivElement>
  allElements: Element[]
  canvasWidth: number
  canvasHeight: number
  onDragStart: (element: Element) => void
  onDrag: (element: Element, x: number, y: number, alignments: { horizontal: number[]; vertical: number[] }) => void
  onDragEnd: () => void
  onHover: (id: string | null) => void
}

// Threshold for alignment snapping in pixels
const SNAP_THRESHOLD = 20

// Use a smaller max size and a higher min size for better scaling
const HANDLE_BASE_SIZE = 18;
const HANDLE_MIN_SIZE = 12;
const HANDLE_MAX_SIZE = 24;

export function ResizableElement({
  element,
  isSelected,
  scale,
  canvasRef,
  allElements,
  canvasWidth,
  canvasHeight,
  onDragStart,
  onDrag,
  onDragEnd,
  onHover,
}: ResizableElementProps) {
  const { updateElement, selectElement, clearNewElementFlag, deleteElement } = useCanvas()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const [showDeleteButton, setShowDeleteButton] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Store original dimensions and position for aspect ratio preservation
  const originalState = useRef({
    width: element.width,
    height: element.height,
    x: element.x,
    y: element.y,
    aspectRatio: element.width / element.height,
    fontSize: element.fontSize || 36,
  })

  // Initial position for drag calculations
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const initialMousePos = useRef({ x: 0, y: 0 })

  // Handle element dragging
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectElement(element.id) // Select on mouse down
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
    onDragStart(element)
  }

  // Handle element deletion
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElement(element.id)
  }

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setIsHovering(true)
    onHover(element.id)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    onHover(null)
  }

  // Handle text height change
  const handleHeightChange = (newHeight: number) => {
    if (element.type === "text") {
      updateElement(element.id, { height: newHeight })
    }
  }

  // Handle element resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)

    // Store initial mouse position for the entire resize operation
    initialMousePos.current = {
      x: e.clientX,
      y: e.clientY,
    }

    // Also set dragStart for incremental updates
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })

    // Store the current dimensions and position when starting resize
    originalState.current = {
      width: element.width,
      height: element.height,
      x: element.x,
      y: element.y,
      aspectRatio: element.width / element.height,
      fontSize: element.fontSize || 36,
    }
  }

  // Show delete button when element is selected
  useEffect(() => {
    setShowDeleteButton(isSelected)
  }, [isSelected])

  // Find the closest snap point if within threshold
  const getSnappedPosition = (currentX: number, currentY: number, otherElements: Element[]) => {
    if (!isSelected || !isDragging) return { x: currentX, y: currentY, alignments: { horizontal: [], vertical: [] } }

    const elementRight = currentX + element.width
    const elementBottom = currentY + element.height
    const elementCenterX = currentX + element.width / 2
    const elementCenterY = currentY + element.height / 2

    let snappedX = currentX
    let snappedY = currentY
    const horizontalGuides: number[] = []
    const verticalGuides: number[] = []

    // Canvas center alignment
    const canvasCenterX = canvasWidth / 2
    const canvasCenterY = canvasHeight / 2

    // Check alignment with canvas center (horizontal)
    if (Math.abs(elementCenterX - canvasCenterX) < SNAP_THRESHOLD) {
      snappedX = canvasCenterX - element.width / 2
      verticalGuides.push(canvasCenterX)
    }

    // Check alignment with canvas center (vertical)
    if (Math.abs(elementCenterY - canvasCenterY) < SNAP_THRESHOLD) {
      snappedY = canvasCenterY - element.height / 2
      horizontalGuides.push(canvasCenterY)
    }

    // Check alignment with canvas edges
    if (Math.abs(currentX) < SNAP_THRESHOLD) {
      snappedX = 0
      verticalGuides.push(0)
    }

    if (Math.abs(elementRight - canvasWidth) < SNAP_THRESHOLD) {
      snappedX = canvasWidth - element.width
      verticalGuides.push(canvasWidth)
    }

    if (Math.abs(currentY) < SNAP_THRESHOLD) {
      snappedY = 0
      horizontalGuides.push(0)
    }

    if (Math.abs(elementBottom - canvasHeight) < SNAP_THRESHOLD) {
      snappedY = canvasHeight - element.height
      horizontalGuides.push(canvasHeight)
    }

    // Check alignment with other elements
    otherElements.forEach((otherElement) => {
      if (otherElement.id === element.id) return

      const otherRight = otherElement.x + otherElement.width
      const otherBottom = otherElement.y + otherElement.height
      const otherCenterX = otherElement.x + otherElement.width / 2
      const otherCenterY = otherElement.y + otherElement.height / 2

      // Horizontal alignments (top, center, bottom)
      if (Math.abs(currentY - otherElement.y) < SNAP_THRESHOLD) {
        snappedY = otherElement.y
        horizontalGuides.push(otherElement.y)
      }

      if (Math.abs(elementCenterY - otherCenterY) < SNAP_THRESHOLD) {
        snappedY = otherCenterY - element.height / 2
        horizontalGuides.push(otherCenterY)
      }

      if (Math.abs(elementBottom - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom - element.height
        horizontalGuides.push(otherBottom)
      }

      // Vertical alignments (left, center, right)
      if (Math.abs(currentX - otherElement.x) < SNAP_THRESHOLD) {
        snappedX = otherElement.x
        verticalGuides.push(otherElement.x)
      }

      if (Math.abs(elementCenterX - otherCenterX) < SNAP_THRESHOLD) {
        snappedX = otherCenterX - element.width / 2
        verticalGuides.push(otherCenterX)
      }

      if (Math.abs(elementRight - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight - element.width
        verticalGuides.push(otherRight)
      }
    })

    // Ensure we have unique values
    const uniqueHorizontal = [...new Set(horizontalGuides)]
    const uniqueVertical = [...new Set(verticalGuides)]

    return {
      x: snappedX,
      y: snappedY,
      alignments: {
        horizontal: uniqueHorizontal,
        vertical: uniqueVertical,
      },
    }
  }

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return

      if (isDragging) {
        // Calculate the delta movement adjusted for scale
        const deltaX = (e.clientX - dragStart.x) / scale
        const deltaY = (e.clientY - dragStart.y) / scale

        // Calculate new position
        const newX = element.x + deltaX
        const newY = element.y + deltaY

        // Get snapped position and alignment guides
        const {
          x: snappedX,
          y: snappedY,
          alignments: newAlignments,
        } = getSnappedPosition(
          newX,
          newY,
          allElements.filter((el) => el.id !== element.id),
        )

        // Update element position
        updateElement(element.id, {
          x: snappedX,
          y: snappedY,
        })

        // Notify parent component
        onDrag(element, snappedX, snappedY, newAlignments)

        // Update drag start position for next move
        setDragStart({
          x: e.clientX,
          y: e.clientY,
        })
      } else if (isResizing && resizeDirection) {
        // Get original values from ref
        const {
          width: origWidth,
          height: origHeight,
          x: origX,
          y: origY,
          aspectRatio,
          fontSize: origFontSize,
        } = originalState.current

        // Calculate the total delta from the initial mouse position
        // This approach provides smoother resizing by avoiding accumulated errors
        const totalDeltaX = (e.clientX - initialMousePos.current.x) / scale
        const totalDeltaY = (e.clientY - initialMousePos.current.y) / scale

        let newWidth = origWidth
        let newHeight = origHeight
        let newX = origX
        let newY = origY
        let newFontSize = origFontSize

        // Check if we're resizing from a corner (which requires maintaining aspect ratio)
        const isCornerResize = resizeDirection.length > 1

        if (isCornerResize) {
          // For corner resizing, we'll maintain aspect ratio
          if (resizeDirection === "se") {
            // Southeast corner
            // Calculate both potential dimensions
            const potentialWidth = Math.max(50, origWidth + totalDeltaX)
            const potentialHeight = Math.max(20, origHeight + totalDeltaY)

            // Choose the dimension that would result in the larger area
            // This creates a more natural resizing feel
            if (potentialWidth / origWidth > potentialHeight / origHeight) {
              newWidth = potentialWidth
              newHeight = newWidth / aspectRatio
            } else {
              newHeight = potentialHeight
              newWidth = newHeight * aspectRatio
            }
          } else if (resizeDirection === "sw") {
            // Southwest corner
            const potentialWidth = Math.max(50, origWidth - totalDeltaX)
            const potentialHeight = Math.max(20, origHeight + totalDeltaY)

            if (potentialWidth / origWidth > potentialHeight / origHeight) {
              newWidth = potentialWidth
              newHeight = newWidth / aspectRatio
            } else {
              newHeight = potentialHeight
              newWidth = newHeight * aspectRatio
            }
            newX = origX + (origWidth - newWidth)
          } else if (resizeDirection === "ne") {
            // Northeast corner
            const potentialWidth = Math.max(50, origWidth + totalDeltaX)
            const potentialHeight = Math.max(20, origHeight - totalDeltaY)

            if (potentialWidth / origWidth > potentialHeight / origHeight) {
              newWidth = potentialWidth
              newHeight = newWidth / aspectRatio
            } else {
              newHeight = potentialHeight
              newWidth = newHeight * aspectRatio
            }
            newY = origY + (origHeight - newHeight)
          } else if (resizeDirection === "nw") {
            // Northwest corner
            const potentialWidth = Math.max(50, origWidth - totalDeltaX)
            const potentialHeight = Math.max(20, origHeight - totalDeltaY)

            if (potentialWidth / origWidth > potentialHeight / origHeight) {
              newWidth = potentialWidth
              newHeight = newWidth / aspectRatio
            } else {
              newHeight = potentialHeight
              newWidth = newHeight * aspectRatio
            }
            newX = origX + (origWidth - newWidth)
            newY = origY + (origHeight - newHeight)
          }

          // Scale the font size proportionally for text elements when using corner handles
          if (element.type === "text" && element.fontSize) {
            const scaleFactor = newWidth / origWidth
            newFontSize = Math.max(8, Math.round(origFontSize * scaleFactor))
          }
        } else {
          // For edge handles, allow non-uniform scaling
          if (resizeDirection.includes("e")) {
            newWidth = Math.max(50, origWidth + totalDeltaX)
          }
          if (resizeDirection.includes("w")) {
            newWidth = Math.max(50, origWidth - totalDeltaX)
            newX = origX + (origWidth - newWidth)
          }
          if (resizeDirection.includes("s")) {
            newHeight = Math.max(20, origHeight + totalDeltaY)
          }
          if (resizeDirection.includes("n")) {
            newHeight = Math.max(20, origHeight - totalDeltaY)
            newY = origY + (origHeight - newHeight)
          }

          // For edge handles, we don't scale the font size
          if (element.type === "text" && element.fontSize) {
            newFontSize = origFontSize
          }
        }

        // Update element with new dimensions, position and font size
        updateElement(element.id, {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
          ...(element.type === "text" ? { fontSize: newFontSize } : {}),
        })

        // Update drag start position for next move
        setDragStart({
          x: e.clientX,
          y: e.clientY,
        })
      }
    }

    const handleMouseUp = () => {
      if (isDragging) {
        onDragEnd()
      }

      setIsDragging(false)
      setIsResizing(false)
      setResizeDirection(null)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    isDragging,
    isResizing,
    resizeDirection,
    dragStart,
    element,
    updateElement,
    scale,
    canvasRef,
    allElements,
    canvasWidth,
    canvasHeight,
    onDrag,
    onDragEnd,
  ])

  // Track width for text elements to trigger height recalculation
  const [textEditorKey, setTextEditorKey] = useState(0)
  useLayoutEffect(() => {
    if (element.type === "text") {
      setTextEditorKey((k) => k + 1)
    }
    // Only run when width changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.width])

  // Render the appropriate element based on type
  const renderElement = () => {
    switch (element.type) {
      case "text":
        return (
          <div className="w-full h-full text-element">
            <TextEditor
              key={textEditorKey}
              content={element.content || ""}
              fontSize={element.fontSize}
              fontFamily={element.fontFamily}
              isSelected={isSelected}
              isNew={element.isNew}
              onChange={(content) => updateElement(element.id, { content })}
              onFontSizeChange={(fontSize) => updateElement(element.id, { fontSize })}
              onFontFamilyChange={(fontFamily) => updateElement(element.id, { fontFamily })}
              onEditingStart={() => {
                if (element.isNew) {
                  clearNewElementFlag(element.id)
                }
              }}
              onHeightChange={handleHeightChange}
              textAlign={element.textAlign || "center"}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={elementRef}
      className={`absolute ${isSelected ? "outline outline-4 outline-primary" : isHovering ? "outline outline-4 outline-primary" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: isDragging ? "grabbing" : "grab",
        transform: "none",
      }}
      onMouseDown={handleDragStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderElement()}

      {/* Delete button */}
      {showDeleteButton && (
        <button
          className="absolute -top-8 -right-2 p-1.5 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            className="absolute -top-3 -left-3 cursor-nwse-resize bg-white shadow-md group/handle"
            style={{
              width: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              height: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              borderRadius: "50%",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              border: "1px solid var(--handle-border)",
              zIndex: 10,
              transition: "background 0.15s"
            }}
            onMouseDown={(e) => handleResizeStart(e, "nw")}
            onMouseEnter={e => e.currentTarget.style.background = "var(--handle-hover)"}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff"
              e.currentTarget.style.border = "1px solid var(--handle-border)"
            }}
          />
          <div
            className="absolute -top-3 -right-3 cursor-nesw-resize bg-white shadow-md group/handle"
            style={{
              width: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              height: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              borderRadius: "50%",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              border: "1px solid var(--handle-border)",
              zIndex: 10,
              transition: "background 0.15s"
            }}
            onMouseDown={(e) => handleResizeStart(e, "ne")}
            onMouseEnter={e => e.currentTarget.style.background = "var(--handle-hover)"}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff"
              e.currentTarget.style.border = "1px solid var(--handle-border)"
            }}
          />
          <div
            className="absolute -bottom-3 -left-3 cursor-nesw-resize bg-white shadow-md group/handle"
            style={{
              width: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              height: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              borderRadius: "50%",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              border: "1px solid var(--handle-border)",
              zIndex: 10,
              transition: "background 0.15s"
            }}
            onMouseDown={(e) => handleResizeStart(e, "sw")}
            onMouseEnter={e => e.currentTarget.style.background = "var(--handle-hover)"}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff"
              e.currentTarget.style.border = "1px solid var(--handle-border)"
            }}
          />
          <div
            className="absolute -bottom-3 -right-3 cursor-nwse-resize bg-white shadow-md group/handle"
            style={{
              width: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              height: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              borderRadius: "50%",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              border: "1px solid var(--handle-border)",
              zIndex: 10,
              transition: "background 0.15s"
            }}
            onMouseDown={(e) => handleResizeStart(e, "se")}
            onMouseEnter={e => e.currentTarget.style.background = "var(--handle-hover)"}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff"
              e.currentTarget.style.border = "1px solid var(--handle-border)"
            }}
          />
          {/* Left/right handles only (no top/bottom) */}
          <div
            className="absolute top-1/2 -left-3 -translate-y-1/2 cursor-ew-resize bg-white shadow-md group/handle"
            style={{
              width: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              height: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              borderRadius: "50%",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              border: "1px solid var(--handle-border)",
              zIndex: 10,
              transition: "background 0.15s"
            }}
            onMouseDown={(e) => handleResizeStart(e, "w")}
            onMouseEnter={e => e.currentTarget.style.background = "var(--handle-hover)"}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff"
              e.currentTarget.style.border = "1px solid var(--handle-border)"
            }}
          />
          <div
            className="absolute top-1/2 -right-3 -translate-y-1/2 cursor-ew-resize bg-white shadow-md group/handle"
            style={{
              width: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              height: `${Math.max(HANDLE_MIN_SIZE, Math.min(HANDLE_MAX_SIZE, HANDLE_BASE_SIZE / scale))}px`,
              borderRadius: "50%",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              border: "1px solid var(--handle-border)",
              zIndex: 10,
              transition: "background 0.15s"
            }}
            onMouseDown={(e) => handleResizeStart(e, "e")}
            onMouseEnter={e => e.currentTarget.style.background = "var(--handle-hover)"}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff"
              e.currentTarget.style.border = "1px solid var(--handle-border)"
            }}
          />
        </>
      )}
    </div>
  )
}
