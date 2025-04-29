"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useCanvas } from "@/context/canvas-context"
import type { Element } from "@/context/canvas-context"
import { TextEditor } from "@/components/text-editor"

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
}

// Threshold for alignment snapping in pixels
const SNAP_THRESHOLD = 5

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
}: ResizableElementProps) {
  const { updateElement, selectElement, clearNewElementFlag } = useCanvas()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  // Store original dimensions for aspect ratio preservation
  const originalDimensions = useRef({ width: element.width, height: element.height })

  // Initial position for drag calculations
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Handle element selection
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectElement(element.id)
  }

  // Handle element dragging
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)

    // Store the initial mouse position
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })

    // Notify parent component
    onDragStart(element)
  }

  // Handle element resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setDragStart({ x: e.clientX, y: e.clientY })

    // Store the current dimensions when starting resize
    originalDimensions.current = {
      width: element.width,
      height: element.height,
    }
  }

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
        // Calculate the delta movement adjusted for scale
        const deltaX = (e.clientX - dragStart.x) / scale
        const deltaY = (e.clientY - dragStart.y) / scale

        let newWidth = element.width
        let newHeight = element.height
        let newX = element.x
        let newY = element.y
        let newFontSize = element.fontSize || 24

        // Store original dimensions for scaling calculation
        const originalWidth = originalDimensions.current.width
        const originalHeight = originalDimensions.current.height
        const originalFontSize = element.fontSize || 24
        const aspectRatio = originalWidth / originalHeight

        // Check if we're resizing from a corner (which requires maintaining aspect ratio)
        const isCornerResize = resizeDirection.length > 1

        if (isCornerResize) {
          // For corner resizing, we'll use the larger of the two deltas to determine the scale factor
          // This ensures the aspect ratio is maintained
          let scaleFactor = 1

          // Calculate potential new dimensions based on which corner is being dragged
          if (resizeDirection === "se") {
            // Southeast corner - positive deltas for both width and height
            const widthScale = (originalWidth + deltaX) / originalWidth
            const heightScale = (originalHeight + deltaY) / originalHeight
            scaleFactor = Math.max(widthScale, heightScale)

            newWidth = Math.max(50, originalWidth * scaleFactor)
            newHeight = Math.max(20, originalHeight * scaleFactor)
          } else if (resizeDirection === "sw") {
            // Southwest corner - negative delta for width, positive for height
            const widthScale = (originalWidth - deltaX) / originalWidth
            const heightScale = (originalHeight + deltaY) / originalHeight
            scaleFactor = Math.max(widthScale, heightScale)

            newWidth = Math.max(50, originalWidth * scaleFactor)
            newHeight = Math.max(20, originalHeight * scaleFactor)
            newX = element.x + (originalWidth - newWidth)
          } else if (resizeDirection === "ne") {
            // Northeast corner - positive delta for width, negative for height
            const widthScale = (originalWidth + deltaX) / originalWidth
            const heightScale = (originalHeight - deltaY) / originalHeight
            scaleFactor = Math.max(widthScale, heightScale)

            newWidth = Math.max(50, originalWidth * scaleFactor)
            newHeight = Math.max(20, originalHeight * scaleFactor)
            newY = element.y + (originalHeight - newHeight)
          } else if (resizeDirection === "nw") {
            // Northwest corner - negative deltas for both width and height
            const widthScale = (originalWidth - deltaX) / originalWidth
            const heightScale = (originalHeight - deltaY) / originalHeight
            scaleFactor = Math.max(widthScale, heightScale)

            newWidth = Math.max(50, originalWidth * scaleFactor)
            newHeight = Math.max(20, originalHeight * scaleFactor)
            newX = element.x + (originalWidth - newWidth)
            newY = element.y + (originalHeight - newHeight)
          }

          // Scale the font size proportionally for text elements
          if (element.type === "text" && element.fontSize) {
            newFontSize = Math.max(8, Math.round(originalFontSize * scaleFactor))
          }
        } else {
          // For edge handles, allow non-uniform scaling
          if (resizeDirection.includes("e")) {
            newWidth = Math.max(50, element.width + deltaX)
          }
          if (resizeDirection.includes("w")) {
            newWidth = Math.max(50, element.width - deltaX)
            newX = element.x + deltaX
          }
          if (resizeDirection.includes("s")) {
            newHeight = Math.max(20, element.height + deltaY)
          }
          if (resizeDirection.includes("n")) {
            newHeight = Math.max(20, element.height - deltaY)
            newY = element.y + deltaY
          }

          // For edge handles, only scale font size based on width changes for text elements
          if (element.type === "text" && element.fontSize && (resizeDirection === "e" || resizeDirection === "w")) {
            const scaleFactor = newWidth / originalWidth
            newFontSize = Math.max(8, Math.round(originalFontSize * scaleFactor))
          }
        }

        // Update element with new dimensions and font size
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

  // Render the appropriate element based on type
  const renderElement = () => {
    switch (element.type) {
      case "text":
        return (
          <TextEditor
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
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={elementRef}
      className={`absolute ${isSelected ? "outline outline-2 outline-blue-500" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onClick={handleSelect}
      onMouseDown={handleDragStart}
    >
      {renderElement()}

      {isSelected && (
        <>
          {/* Resize handles */}
          <div
            className="absolute -top-1 -left-1 h-2 w-2 cursor-nwse-resize bg-blue-500"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="absolute -top-1 -right-1 h-2 w-2 cursor-nesw-resize bg-blue-500"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute -bottom-1 -left-1 h-2 w-2 cursor-nesw-resize bg-blue-500"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute -bottom-1 -right-1 h-2 w-2 cursor-nwse-resize bg-blue-500"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 cursor-ns-resize bg-blue-500"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 cursor-ns-resize bg-blue-500"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 cursor-ew-resize bg-blue-500"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 cursor-ew-resize bg-blue-500"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}
    </div>
  )
}
