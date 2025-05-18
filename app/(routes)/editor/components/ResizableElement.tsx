"use client"

import type React from "react"

import { TextEditor } from "./TextEditor"
import { Element as CanvasElement } from "@lib/types/canvas.types" // Change Element import to CanvasElement
import { HANDLE_BASE_SIZE, SNAP_THRESHOLD } from "@/lib/constants/editor"
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react"
import useCanvasStore from "@lib/stores/useCanvasStore"
import classNames from "classnames"

interface ResizableElementProps {
  element: CanvasElement // Change Element to CanvasElement
  isSelected: boolean
  scale: number
  canvasRef: React.RefObject<HTMLDivElement>
  allElements: CanvasElement[] // Change Element[] to CanvasElement[]
  canvasWidth: number
  canvasHeight: number
  onDragStart: (element: CanvasElement) => void // Change Element to CanvasElement
  onDrag: (element: CanvasElement, x: number, y: number, alignments: { horizontal: number[]; vertical: number[] }, isMultiSelectionDrag: boolean) => void // Change Element to CanvasElement
  onDragEnd: () => void
  onHover: (id: string | null) => void
  isEditMode: boolean // Add isEditMode prop
}

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
  isEditMode, // Accept the new prop
}: ResizableElementProps) {
  const updateElement = useCanvasStore(state => state.updateElement)
  const selectElement = useCanvasStore(state => state.selectElement)
  const clearNewElementFlag = useCanvasStore(state => state.clearNewElementFlag)
  const deleteElement = useCanvasStore(state => state.deleteElement)
  const selectedElementIds = useCanvasStore(state => state.selectedElementIds)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  // Track when we just finished resizing to prevent immediate deselect
  const justFinishedResizing = useRef(false)
  const resizeEndTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track hover state for left/right borders to highlight the handle
  const [leftBorderHover, setLeftBorderHover] = useState(false)
  const [rightBorderHover, setRightBorderHover] = useState(false)

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
  const [isAltKeyPressed, setIsAltKeyPressed] = useState(false) // Track Alt/Option key state

  // Ref for hidden measurer div
  const measurerRef = useRef<HTMLDivElement>(null);

  // Helper to measure text height given current width and styles
  const measureTextHeight = (content: string, width: number) => {
    if (!measurerRef.current) return 0;

    // Configure the measurer with all the styles from the element
    measurerRef.current.style.width = width + 'px';
    measurerRef.current.style.fontSize = `${element.fontSize || 36}px`;
    measurerRef.current.style.fontFamily = element.fontFamily || 'Inter';
    measurerRef.current.style.fontWeight = element.isBold ? 'bold' : 'normal';
    measurerRef.current.style.fontStyle = element.isItalic ? 'italic' : 'normal';
    measurerRef.current.style.textDecoration = `${element.isUnderlined ? 'underline' : ''} ${element.isStrikethrough ? 'line-through' : ''}`.trim() || 'none';
    measurerRef.current.style.textAlign = element.textAlign || 'center';
    measurerRef.current.style.lineHeight = '1.5'; // Increased line height for better readability
    measurerRef.current.style.padding = '4px'; // Add padding to ensure text has room to breathe

    // Set content and measure
    measurerRef.current.innerText = content;

    // Add extra padding to ensure text isn't cut off
    return measurerRef.current.scrollHeight + 12; // Add extra padding for safety
  };

  // Add state for handle hover
  const [handleHover, setHandleHover] = useState({
    nw: false,
    ne: false,
    se: false,
    sw: false,
    e: false,
    w: false,
  });

  // Helper to get handle background
  const getHandleBg = (dir: string) => {
    return (handleHover[dir as keyof typeof handleHover] || (resizeDirection === dir && isResizing)) ? "var(--handle-hover)" : "#fff";
  };

  // Handle element dragging
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    // If in view mode, do nothing
    if (!isEditMode) return;

    e.stopPropagation()

    // Clear isNew flag on any interaction
    if (element.isNew) {
      clearNewElementFlag(element.id)
    }

    // Check if shift key is pressed for multi-selection
    const isShiftPressed = e.shiftKey

    selectElement(element.id, isShiftPressed) // Select on mouse down, pass addToSelection flag
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
    onDragStart(element)
  }, [element, selectElement, onDragStart, clearNewElementFlag, isEditMode])

  // Handle element deletion
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElement(element.id)
  }, [deleteElement, element.id])

  // Handle mouse enter/leave
  const handleMouseEnter = useCallback(() => {
    // Only show hover effects in edit mode
    if (isEditMode) {
      setIsHovering(true)
      onHover(element.id)
    }
  }, [onHover, element.id, isEditMode])

  const handleMouseLeave = useCallback(() => {
    if (justFinishedResizing.current) {
      // If we just finished resizing, prevent immediate deselect
      setIsHovering(false)
      return
    }
    setIsHovering(false)
    onHover(null)
  }, [onHover])

  // Handle text height change
  const handleHeightChange = useCallback((newHeight: number) => {
    if (element.type === "text") {
      updateElement(element.id, { height: newHeight })
    }
  }, [element, updateElement])

  // Handle text alignment change
  const handleTextAlignChange = useCallback((align: "left" | "center" | "right" | "justify") => {
    if (element.type !== "text") return
    updateElement(element.id, { textAlign: align })
  }, [element, updateElement])

  // Handle element resizing
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    // If in view mode, do nothing
    if (!isEditMode) return;

    e.stopPropagation()
    // Clear isNew flag on any interaction
    if (element.isNew) {
      clearNewElementFlag(element.id)
    }
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
  }, [element, clearNewElementFlag, isEditMode])


  // Find the closest snap point if within threshold
  const getSnappedPosition = (currentX: number, currentY: number, otherElements: CanvasElement[]) => {
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
    // Track Alt/Option key state
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.key === 'Option') {
        setIsAltKeyPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.key === 'Option') {
        setIsAltKeyPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Use requestAnimationFrame to throttle UI updates for smooth rendering
    let animationFrameId: number | null = null;
    let lastPosition = { x: element.x, y: element.y };
    let pendingUpdate = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      if (isDragging) {
        // Calculate the delta movement adjusted for scale
        const deltaX = (e.clientX - dragStart.x) / scale;
        const deltaY = (e.clientY - dragStart.y) / scale;

        // Calculate new position
        const newX = element.x + deltaX;
        const newY = element.y + deltaY;

        // Only proceed if the position has changed significantly
        if (
          Math.abs(newX - lastPosition.x) < 0.1 &&
          Math.abs(newY - lastPosition.y) < 0.1 &&
          pendingUpdate
        ) {
          return;
        }

        // Store the current position for the next comparison
        lastPosition = { x: newX, y: newY };
        pendingUpdate = true;

        // Cancel any previous animation frame
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }

        // Use requestAnimationFrame to batch UI updates
        animationFrameId = requestAnimationFrame(() => {
          // Get snapped position and alignment guides
          const {
            x: snappedX,
            y: snappedY,
            alignments: newAlignments,
          } = getSnappedPosition(
            newX,
            newY,
            allElements.filter((el) => el.id !== element.id),
          );

          // Update element position
          updateElement(element.id, {
            x: snappedX,
            y: snappedY,
          });

          // Check if this is a multi-selection drag
          const isMultiSelectionDrag = selectedElementIds.length > 1 && selectedElementIds.includes(element.id);

          // Notify parent component
          onDrag(element, snappedX, snappedY, newAlignments, isMultiSelectionDrag);

          // Update drag start position for next move
          setDragStart({
            x: e.clientX,
            y: e.clientY,
          });

          pendingUpdate = false;
        });
      } else if (isResizing && resizeDirection) {
        // Cancel any previous animation frame
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }

        // Use requestAnimationFrame for resize operations too
        animationFrameId = requestAnimationFrame(() => {
          // Get original values from ref
          const {
            width: origWidth,
            height: origHeight,
            x: origX,
            y: origY,
            aspectRatio,
            fontSize: origFontSize,
          } = originalState.current;

          // Calculate the total delta from the initial mouse position
          // This approach provides smoother resizing by avoiding accumulated errors
          const totalDeltaX = (e.clientX - initialMousePos.current.x) / scale;
          const totalDeltaY = (e.clientY - initialMousePos.current.y) / scale;

          let newWidth = origWidth;
          let newHeight = origHeight;
          let newX = origX;
          let newY = origY;
          let newFontSize = origFontSize;
          let widthChanged = false;

          // Check if we're resizing from a corner (which requires maintaining aspect ratio)
          const isCornerResize = resizeDirection.length > 1;

          if (isCornerResize) {
            // Calculate potential dimensions based on the resize direction
            switch (resizeDirection) {
              case "se": // Southeast
                const potentialWidthSE = Math.max(50, origWidth + totalDeltaX);
                const potentialHeightSE = Math.max(20, origHeight + totalDeltaY);

                // Maintain aspect ratio by choosing the dimension that would result in the larger area
                if (potentialWidthSE / origWidth > potentialHeightSE / origHeight) {
                  newWidth = potentialWidthSE;
                  newHeight = newWidth / aspectRatio;
                } else {
                  newHeight = potentialHeightSE;
                  newWidth = newHeight * aspectRatio;
                }

                widthChanged = true;

                // If Alt/Option key is pressed, resize from center
                if (isAltKeyPressed) {
                  newX = origX - (newWidth - origWidth) / 2;
                  newY = origY - (newHeight - origHeight) / 2;
                }
                break;

              case "sw": // Southwest
                const potentialWidthSW = Math.max(50, origWidth - totalDeltaX);
                const potentialHeightSW = Math.max(20, origHeight + totalDeltaY);

                if (potentialWidthSW / origWidth > potentialHeightSW / origHeight) {
                  newWidth = potentialWidthSW;
                  newHeight = newWidth / aspectRatio;
                } else {
                  newHeight = potentialHeightSW;
                  newWidth = newHeight * aspectRatio;
                }

                widthChanged = true;

                if (isAltKeyPressed) {
                  const widthDelta = origWidth - newWidth;
                  const heightDelta = origHeight - newHeight;
                  newX = origX + widthDelta / 2;
                  newY = origY - heightDelta / 2;
                } else {
                  newX = origX + (origWidth - newWidth);
                }
                break;

              case "ne": // Northeast
                const potentialWidthNE = Math.max(50, origWidth + totalDeltaX);
                const potentialHeightNE = Math.max(20, origHeight - totalDeltaY);

                if (potentialWidthNE / origWidth > potentialHeightNE / origHeight) {
                  newWidth = potentialWidthNE;
                  newHeight = newWidth / aspectRatio;
                } else {
                  newHeight = potentialHeightNE;
                  newWidth = newHeight * aspectRatio;
                }

                widthChanged = true;

                if (isAltKeyPressed) {
                  newX = origX - (newWidth - origWidth) / 2;
                  const heightDelta = origHeight - newHeight;
                  newY = origY + heightDelta / 2;
                } else {
                  newY = origY + (origHeight - newHeight);
                }
                break;

              case "nw": // Northwest
                const potentialWidthNW = Math.max(50, origWidth - totalDeltaX);
                const potentialHeightNW = Math.max(20, origHeight - totalDeltaY);

                if (potentialWidthNW / origWidth > potentialHeightNW / origHeight) {
                  newWidth = potentialWidthNW;
                  newHeight = newWidth / aspectRatio;
                } else {
                  newHeight = potentialHeightNW;
                  newWidth = newHeight * aspectRatio;
                }

                widthChanged = true;

                if (isAltKeyPressed) {
                  const widthDelta = origWidth - newWidth;
                  const heightDelta = origHeight - newHeight;
                  newX = origX + widthDelta / 2;
                  newY = origY + heightDelta / 2;
                } else {
                  newX = origX + (origWidth - newWidth);
                  newY = origY + (origHeight - newHeight);
                }
                break;
            }

            // Scale the font size proportionally for text elements when using corner handles
            if (element.type === "text" && element.fontSize) {
              const scaleFactor = newWidth / origWidth;
              newFontSize = Math.max(8, Math.round(origFontSize * scaleFactor));
            }
          } else {
            // Handle edge resizing (non-uniform scaling)
            if (resizeDirection.includes("e")) {
              newWidth = Math.max(50, origWidth + totalDeltaX);
              widthChanged = true;

              // If Alt/Option key is pressed, make the opposite side resize equally
              if (isAltKeyPressed) {
                newX = origX - totalDeltaX / 2;
                newWidth = Math.max(50, origWidth + totalDeltaX);
              }
            }

            if (resizeDirection.includes("w")) {
              newWidth = Math.max(50, origWidth - totalDeltaX);
              widthChanged = true;

              // If Alt/Option key is pressed, make the opposite side resize equally
              if (isAltKeyPressed) {
                const widthDelta = origWidth - newWidth;
                newX = origX + widthDelta / 2;
                newWidth = Math.max(50, origWidth + widthDelta);
              } else {
                newX = origX + (origWidth - newWidth);
              }
            }

            if (resizeDirection.includes("s")) {
              newHeight = Math.max(20, origHeight + totalDeltaY);

              // If Alt/Option key is pressed, make the opposite side resize equally
              if (isAltKeyPressed) {
                newY = origY - totalDeltaY / 2;
                newHeight = Math.max(20, origHeight + totalDeltaY);
              }
            }

            if (resizeDirection.includes("n")) {
              newHeight = Math.max(20, origHeight - totalDeltaY);

              // If Alt/Option key is pressed, make the opposite side resize equally
              if (isAltKeyPressed) {
                const heightDelta = origHeight - newHeight;
                newY = origY + heightDelta / 2;
                newHeight = Math.max(20, origHeight + heightDelta);
              } else {
                newY = origY + (origHeight - newHeight);
              }
            }
          }

          // Update element with new dimensions, position and font size
          updateElement(element.id, {
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY,
            ...(element.type === "text" ? { fontSize: newFontSize } : {}),
          });

          // If resizing a text element horizontally, measure and update height immediately
          if (element.type === "text" && widthChanged) {
            const measuredHeight = measureTextHeight(
              element.content || '',
              newWidth
            );
            if (measuredHeight && measuredHeight !== newHeight) {
              updateElement(element.id, { height: measuredHeight });
            }
          }

          // If resizing a text element horizontally, force TextEditor re-render to recalc height
          if (element.type === "text" && widthChanged) {
            setTextEditorKey((k) => k + 1);
          }

          // Update drag start position for next move
          setDragStart({
            x: e.clientX,
            y: e.clientY,
          });
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        onDragEnd();
      }

      // We're ending the drag/resize operation but need to keep the element selected
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);

      // Make sure the element stays selected by calling selectElement with true to maintain selection
      if (isResizing) {
        // Only call when ending a resize operation, with false to not toggle selection
        selectElement(element.id, false);
        // Set the flag to prevent immediate deselect
        justFinishedResizing.current = true;
        // Clear the flag after a short delay
        if (resizeEndTimeoutRef.current) {
          clearTimeout(resizeEndTimeoutRef.current);
        }
        resizeEndTimeoutRef.current = setTimeout(() => {
          justFinishedResizing.current = false;
        }, 200);
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      // Clean up any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
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
    selectedElementIds,
  ])

  // Track width and fontSize for text elements to trigger height recalculation
  const [textEditorKey, setTextEditorKey] = useState(0)
  useLayoutEffect(() => {
    if (element.type === "text") {
      setTextEditorKey((k) => k + 1)
    }
    // Only run when width or fontSize changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.width, element.fontSize])

  // Update height when fontSize changes
  useEffect(() => {
    if (element.type === "text" && element.content && element.fontSize) {
      const measuredHeight = measureTextHeight(
        element.content,
        element.width
      );
      if (measuredHeight && measuredHeight !== element.height) {
        updateElement(element.id, { height: measuredHeight });
      }
    }
  }, [element.fontSize, element.width, element.content, element.type, element.id, element.height, updateElement]);

  // Calculate if the element is too small to show all corner handles
  const handleSize = HANDLE_BASE_SIZE / scale;
  // Increase the multiplier so handles disappear sooner (avoid overlap when zoomed out)
  const isTooSmallForAllHandles = element.width < handleSize * 3.5 || element.height < handleSize * 3.5;

  // Render the appropriate element based on type
  const renderElement = useCallback(() => {
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
              onTextAlignChange={(align) => handleTextAlignChange(align)}
              isBold={element.isBold}
              isItalic={element.isItalic}
              isUnderlined={element.isUnderlined}
              isStrikethrough={element.isStrikethrough}
              isEditMode={isEditMode} // Pass edit mode to TextEditor
            />
          </div>
        )
      default:
        return null
    }
  }, [element, isSelected, textEditorKey, updateElement, clearNewElementFlag, handleHeightChange, handleTextAlignChange, isEditMode])

  return (
    <>
      {/* Hidden measurer for text height calculation */}
      {element.type === 'text' && (
        <div
          ref={measurerRef}
          style={{
            position: 'absolute',
            visibility: 'hidden',
            zIndex: -1,
            pointerEvents: 'none',
            whiteSpace: 'normal',
            lineHeight: 1.2,
            wordBreak: 'break-word',
            overflow: 'auto',
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.isBold ? 'bold' : 'normal',
            fontStyle: element.isItalic ? 'italic' : 'normal',
            textDecoration: `${element.isUnderlined ? 'underline' : ''} ${element.isStrikethrough ? 'line-through' : ''}`.trim() || 'none',
            textAlign: element.textAlign || 'center',
            padding: 0,
            boxSizing: 'border-box',
            minHeight: '1em',
            left: 0,
            top: 0,
            width: element.width,
            // Any other styles needed to match TextEditor
          }}
        >
          {element.content}
        </div>
      )}
      <div
        ref={elementRef}
        className={classNames("absolute", {
          "is-highlighted": (isSelected || isHovering) && isEditMode
        })
        }
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          cursor: isEditMode ? (isDragging ? "grabbing" : "grab") : "default",
          transform: "none",
          borderRadius: "2px",
        }}
        onMouseDown={handleDragStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {renderElement()}

        {/* Only show resize handles when selected and in edit mode */}
        {isSelected && isEditMode && (
          <>
            {/* Top-left corner handle with brand styling */}
            {(!isResizing || resizeDirection === "nw") && (
              <div
                className="absolute cursor-nwse-resize group/handle"
                style={{
                  width: `${handleSize}px`,
                  height: `${handleSize}px`,
                  borderRadius: "50%",
                  boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                  border: "1px solid var(--handle-border)",
                  zIndex: 10,
                  top: 0,
                  left: 0,
                  transform: `translate(-50%, -50%) scale(${1})`,
                  background: getHandleBg("nw") === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "nw")}
                onMouseEnter={() => setHandleHover(h => ({ ...h, nw: true }))}
                onMouseLeave={() => setHandleHover(h => ({ ...h, nw: false }))}
              />
            )}

            {/* These corner handles only show when element is big enough */}
            {!isTooSmallForAllHandles && (
              <>
                {(!isResizing || resizeDirection === "ne") && (
                  <div
                    className="absolute cursor-nesw-resize group/handle"
                    style={{
                      width: `${handleSize}px`,
                      height: `${handleSize}px`,
                      borderRadius: "50%",
                      boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                      border: "1px solid var(--handle-border)",
                      zIndex: 10,
                      top: 0,
                      right: 0,
                      transform: `translate(50%, -50%) scale(${1})`,
                      background: getHandleBg("ne") === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                    }}
                    onMouseDown={(e) => handleResizeStart(e, "ne")}
                    onMouseEnter={() => setHandleHover(h => ({ ...h, ne: true }))}
                    onMouseLeave={() => setHandleHover(h => ({ ...h, ne: false }))}
                  />
                )}
                {(!isResizing || resizeDirection === "sw") && (
                  <div
                    className="absolute cursor-nesw-resize group/handle"
                    style={{
                      width: `${handleSize}px`,
                      height: `${handleSize}px`,
                      borderRadius: "50%",
                      boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                      border: "1px solid var(--handle-border)",
                      zIndex: 10,
                      bottom: 0,
                      left: 0,
                      transform: `translate(-50%, 50%) scale(${1})`,
                      background: getHandleBg("sw") === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                    }}
                    onMouseDown={(e) => handleResizeStart(e, "sw")}
                    onMouseEnter={() => setHandleHover(h => ({ ...h, sw: true }))}
                    onMouseLeave={() => setHandleHover(h => ({ ...h, sw: false }))}
                  />
                )}
                {(!isResizing || resizeDirection === "se") && (
                  <div
                    className="absolute cursor-nwse-resize group/handle"
                    style={{
                      width: `${handleSize}px`,
                      height: `${handleSize}px`,
                      borderRadius: "50%",
                      boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                      border: "1px solid var(--handle-border)",
                      zIndex: 10,
                      bottom: 0,
                      right: 0,
                      transform: `translate(50%, 50%) scale(${1})`,
                      background: getHandleBg("se") === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                    }}
                    onMouseDown={(e) => handleResizeStart(e, "se")}
                    onMouseEnter={() => setHandleHover(h => ({ ...h, se: true }))}
                    onMouseLeave={() => setHandleHover(h => ({ ...h, se: false }))}
                  />
                )}
              </>
            )}

            {/* Right handle with enhanced styling */}
            {(!isResizing || resizeDirection === "e") && (
              <div
                className="absolute cursor-ew-resize group/handle"
                style={{
                  width: `${handleSize * 0.7}px`,
                  height: `${Math.min(handleSize * 2.2, element.height * 0.6)}px`,
                  borderRadius: `${handleSize * 0.35}px`,
                  boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                  border: "1px solid var(--handle-border)",
                  zIndex: 10,
                  right: 0,
                  top: `calc(50% + ${(element.height < handleSize * 2.2 ? (element.height - handleSize * 2.2) / 2 : 0)}px)`,
                  transform: `translate(50%, -50%) scale(${1})`,
                  background: (rightBorderHover || getHandleBg("e") === "var(--handle-hover)") ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "e")}
                onMouseEnter={() => setHandleHover(h => ({ ...h, e: true }))}
                onMouseLeave={() => setHandleHover(h => ({ ...h, e: false }))}
              />
            )}

            {/* Left handle with enhanced styling */}
            {!isTooSmallForAllHandles && (!isResizing || resizeDirection === "w") && (
              <div
                className="absolute cursor-ew-resize group/handle"
                style={{
                  width: `${handleSize * 0.7}px`,
                  height: `${Math.min(handleSize * 2.2, element.height * 0.6)}px`,
                  borderRadius: `${handleSize * 0.35}px`,
                  boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                  border: "1px solid var(--handle-border)",
                  zIndex: 10,
                  left: 0,
                  top: `calc(50% + ${(element.height < handleSize * 2.2 ? (element.height - handleSize * 2.2) / 2 : 0)}px)`,
                  transform: `translate(-50%, -50%) scale(${1})`,
                  background: (leftBorderHover || getHandleBg("w") === "var(--handle-hover)") ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "w")}
                onMouseEnter={() => setHandleHover(h => ({ ...h, w: true }))}
                onMouseLeave={() => setHandleHover(h => ({ ...h, w: false }))}
              />
            )}

            {/* Selection indicator that shows which element is selected with a subtle gradient border */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                border: '2px solid rgba(30, 136, 229, 0.8)',
                borderRadius: '2px',
                background: 'transparent'
              }}
            />

            {/* Wide invisible resize zones */}
            <div
              className="absolute top-0 left-0 -translate-x-1/2 h-full"
              style={{
                width: 40,
                cursor: "ew-resize",
                zIndex: 5,
                background: "transparent"
              }}
              onMouseDown={(e) => handleResizeStart(e, "w")}
              onMouseEnter={() => {
                if (!isResizing && !leftBorderHover) {
                  setLeftBorderHover(true)
                }
              }}
              onMouseLeave={() => {
                if (!isResizing && leftBorderHover) {
                  setLeftBorderHover(false)
                }
              }}
            />
            <div
              className="absolute top-0 right-0 translate-x-1/2 h-full"
              style={{
                width: 40,
                cursor: "ew-resize",
                zIndex: 5,
                background: "transparent"
              }}
              onMouseDown={(e) => handleResizeStart(e, "e")}
              onMouseEnter={() => {
                if (!isResizing && !rightBorderHover) {
                  setRightBorderHover(true)
                }
              }}
              onMouseLeave={() => {
                if (!isResizing && rightBorderHover) {
                  setRightBorderHover(false)
                }
              }}
            />
          </>
        )}
      </div>
    </>
  )
}
