"use client"

import React from "react";

import { HANDLE_BASE_SIZE } from "@/lib/constants/editor";
import useCanvasStore from "@lib/stores/useCanvasStore";
import { Element as EditorCanvasElement } from "@lib/types/canvas.types"; // Change Element import to CanvasElement
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { TextEditor } from "../TextEditor";
import { useCanvasElementInteraction, useCanvasElementResize, useSnapping, useTextMeasurement } from "../../hooks";
import classNames from "classnames";
import { ElementControls } from "./controls/ElementControls";
import ElementRenderer from "./renderers/ElementRenderer";


interface CanvasElementProps {
  element: EditorCanvasElement // Change Element to CanvasElement
  isSelected: boolean
  scale: number
  canvasRef: React.RefObject<HTMLDivElement>
  allElements: EditorCanvasElement[] // Change Element[] to CanvasElement[]
  canvasWidth: number
  canvasHeight: number
  onDragStart: (element: EditorCanvasElement) => void // Change Element to CanvasElement
  onDrag: (element: EditorCanvasElement, x: number, y: number, alignments: { horizontal: number[]; vertical: number[] }, isMultiSelectionDrag: boolean) => void // Change Element to CanvasElement
  onDragEnd: () => void
  onHover: (id: string | null) => void
  isEditMode: boolean // Add isEditMode prop
}

export function CanvasElement({
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
}: CanvasElementProps) {
  // Get Zustand store methods
  const updateElement = useCanvasStore(state => state.updateElement)
  const selectElement = useCanvasStore(state => state.selectElement)
  const clearNewElementFlag = useCanvasStore(state => state.clearNewElementFlag)
  const deleteElement = useCanvasStore(state => state.deleteElement)
  const selectedElementIds = useCanvasStore(state => state.selectedElementIds)

  // Element ref and text editor key for rerendering
  const elementRef = useRef<HTMLDivElement>(null)
  const [textEditorKey, setTextEditorKey] = useState(0)

  // Initialize our custom hooks
  const { getSnappedPosition } = useSnapping()
  const { isResizing, resizeDirection, startResize, endResize, calculateResize } = useCanvasElementResize()
  const { measurerRef, measureElementHeight, renderMeasurer } = useTextMeasurement()
  const {
    isDragging,
    isAltKeyPressed,
    isHovering,
    leftBorderHover,
    rightBorderHover,
    setLeftBorderHover,
    setRightBorderHover,
    handleHover,
    dragStart,
    setDragStart,
    startDrag,
    endDrag,
    handleMouseEnter,
    handleMouseLeave,
    setJustFinishedResizing,
    getHandleBg,
    setHandleHoverState,
  } = useCanvasElementInteraction()

  // Handle element dragging
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return

    startDrag(
      e,
      element,
      onDragStart,
      selectElement,
      clearNewElementFlag
    )
  }, [element, onDragStart, selectElement, clearNewElementFlag, isEditMode, startDrag])

  // Handle element deletion
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElement(element.id)
  }, [deleteElement, element.id])

  // Enhanced mouse enter/leave handlers
  const handleElementMouseEnter = useCallback(() => {
    handleMouseEnter(element.id, onHover, isEditMode)
  }, [element.id, onHover, isEditMode, handleMouseEnter])

  const handleElementMouseLeave = useCallback(() => {
    handleMouseLeave(onHover)
  }, [onHover, handleMouseLeave])

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
    if (!isEditMode) return

    e.stopPropagation()

    startResize(
      element,
      direction,
      e.clientX,
      e.clientY,
      (elementId: string) => clearNewElementFlag(elementId)
    )
  }, [element, clearNewElementFlag, isEditMode, startResize])

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    if (!isDragging && !isResizing) return;
    
    // Performance optimization: Use requestAnimationFrame for smoother rendering
    let animationFrameId: number | null = null;
    let lastEvent: MouseEvent | null = null;
    
    const processDragOrResize = () => {
      if (!lastEvent || !canvasRef.current) return;
      
      const e = lastEvent;
      
      if (isDragging) {
        // Calculate the delta movement adjusted for scale
        const deltaX = (e.clientX - dragStart.x) / scale;
        const deltaY = (e.clientY - dragStart.y) / scale;

        // Calculate new position
        const newX = element.x + deltaX;
        const newY = element.y + deltaY;

        // Get snapped position and alignment guides
        const {
          x: snappedX,
          y: snappedY,
          alignments: newAlignments,
        } = getSnappedPosition(
          element,
          newX,
          newY,
          allElements.filter((el) => el.id !== element.id),
          canvasWidth,
          canvasHeight,
          isDragging,
          isSelected
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
      } else if (isResizing) {
        // Calculate new dimensions and position
        const resizeResult = calculateResize(
          element,
          e.clientX,
          e.clientY,
          scale,
          isAltKeyPressed,
          allElements, // Pass all elements for snapping
          canvasWidth,
          canvasHeight
        );

        const { 
          width: newWidth, 
          height: newHeight, 
          x: newX, 
          y: newY, 
          fontSize: newFontSize, 
          widthChanged,
          alignments: resizeAlignments = { horizontal: [], vertical: [] } 
        } = resizeResult;

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
          const measuredHeight = measureElementHeight(element);

          if (measuredHeight && measuredHeight !== newHeight) {
            updateElement(element.id, { height: measuredHeight });
          }

          // Force TextEditor re-render to recalculate height
          setTextEditorKey((k) => k + 1);
        }

        // Pass alignment guides for visualization, similar to drag operation
        if (resizeAlignments) {
          onDrag(
            element, 
            newX, 
            newY, 
            resizeAlignments, 
            false
          );
        }

        // Update drag start position for next move
        setDragStart({
          x: e.clientX,
          y: e.clientY,
        });
      }
      
      lastEvent = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Store only the most recent event and process in the next animation frame
      lastEvent = e;

      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => {
          processDragOrResize();
          animationFrameId = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        endDrag(onDragEnd);
      }

      if (isResizing) {
        endResize();
        // Only call when ending a resize operation, with false to not toggle selection
        selectElement(element.id, false);
        // Set the flag to prevent immediate deselect
        setJustFinishedResizing(true);
      }

      // Cancel any pending animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Ensure we clean up any pending animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    isDragging,
    isResizing,
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
    isSelected,
    getSnappedPosition,
    calculateResize,
    isAltKeyPressed,
    endDrag,
    endResize,
    selectElement,
    setDragStart,
    setJustFinishedResizing,
    measureElementHeight,
  ])

  // Track width and fontSize for text elements to trigger height recalculation
  useEffect(() => {
    if (element.type === "text") {
      setTextEditorKey((k) => k + 1)
    }
  }, [element.width, element.fontSize, element.type])

  // Update height when fontSize changes
  useEffect(() => {
    if (element.type === "text" && element.content && element.fontSize) {
      const measuredHeight = measureElementHeight(element)

      if (measuredHeight && measuredHeight !== element.height) {
        updateElement(element.id, { height: measuredHeight })
      }
    }
  }, [element, updateElement, measureElementHeight])

  // Calculate if the element is too small to show all corner handles
  const handleSize = HANDLE_BASE_SIZE / scale
  const isTooSmallForAllHandles = element.width < handleSize * 3.5 || element.height < handleSize * 3.5

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
              onTextAlignChange={handleTextAlignChange}
              isBold={element.isBold}
              isItalic={element.isItalic}
              isUnderlined={element.isUnderlined}
              isStrikethrough={element.isStrikethrough}
              isEditMode={isEditMode}
            />
          </div>
        )
      case "rectangle":
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.backgroundColor || "transparent",
              borderColor: element.borderColor || "transparent",
              borderWidth: element.borderWidth || 0,
              borderStyle: element.borderStyle || "solid",
              transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
            }}
          />
        )
      case "circle":
        return (
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: element.backgroundColor || "transparent",
              borderColor: element.borderColor || "transparent",
              borderWidth: element.borderWidth || 0,
              borderStyle: element.borderStyle || "solid",
              transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
            }}
          />
        )
      case "line":
        return (
          <div className="w-full h-full flex items-center">
            <div
              className="w-full"
              style={{
                height: "0px",
                borderTopColor: element.borderColor || "#000000",
                borderTopWidth: element.borderWidth || 2,
                borderTopStyle: element.borderStyle || "solid",
                transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
              }}
            />
          </div>
        )
      case "arrow":
        return (
          <div className="w-full h-full flex items-center relative">
            <div
              className="w-full"
              style={{
                height: "0px",
                borderTopColor: element.borderColor || "#000000",
                borderTopWidth: element.borderWidth || 2,
                borderTopStyle: element.borderStyle || "solid",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "0",
                width: "10px",
                height: "10px",
                borderRight: `${element.borderWidth || 2}px solid ${element.borderColor || "#000000"}`,
                borderTop: `${element.borderWidth || 2}px solid ${element.borderColor || "#000000"}`,
                transform: "rotate(45deg) translateY(-50%)",
              }}
            />
          </div>
        )
      default:
        return null
    }
  }, [
    element,
    isSelected,
    textEditorKey,
    updateElement,
    clearNewElementFlag,
    handleHeightChange,
    handleTextAlignChange,
    isEditMode
  ])

  return (
    <>
      {/* Hidden measurer for text height calculation */}
      {element.type === 'text' && renderMeasurer()}

      {/* Main element container */}
      <div
        ref={elementRef}
        className={classNames("absolute", {
          "is-highlighted": (isSelected && isEditMode) || (isHovering && isEditMode),
        })}
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
        onMouseEnter={handleElementMouseEnter}
        onMouseLeave={handleElementMouseLeave}
      >
        <ElementRenderer
          element={element}
          isSelected={isSelected}
          textEditorKey={textEditorKey}
          updateElement={updateElement}
          clearNewElementFlag={clearNewElementFlag}
          handleHeightChange={handleHeightChange}
          handleTextAlignChange={handleTextAlignChange}
          isEditMode={isEditMode}
        />

        {isSelected && isEditMode && (
          <ElementControls
            element={element}
            scale={scale}
            isResizing={isResizing}
            resizeDirection={resizeDirection as string}
            handleResizeStart={handleResizeStart}
            getHandleBg={getHandleBg}
            setHandleHoverState={setHandleHoverState}
            leftBorderHover={leftBorderHover}
            rightBorderHover={rightBorderHover}
            setLeftBorderHover={setLeftBorderHover}
            setRightBorderHover={setRightBorderHover}
            isDragging={isDragging}
          />
        )}
      </div>
    </>
  )
}
