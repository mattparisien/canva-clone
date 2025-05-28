"use client"

import React, { useState } from "react";

import useCanvasStore from "@lib/stores/useCanvasStore";
import { Element as EditorCanvasElement } from "@lib/types/canvas.types"; // Change Element import to CanvasElement
import { useCallback, useRef } from "react";
import { useTextMeasurement } from "../../hooks";
// import { ElementControls } from "./controls/ElementControls";
import { calculateViewportRect } from "@lib/utils/canvas-utils";
import ElementRenderer from "./renderers/ElementRenderer";


interface CanvasElementProps {
  element: EditorCanvasElement // Change Element to CanvasElement
  isSelected: boolean
  scale: number
  canvasRef: React.RefObject<HTMLDivElement>
  allElements: EditorCanvasElement[] // Change Element[] to CanvasElement[]
  canvasWidth: number
  canvasHeight: number
  isEditMode: boolean // Add isEditMode prop
}

export function CanvasElement({
  element,
  isSelected,
  scale,
  canvasRef,
  isEditMode, // Accept the new prop
}: CanvasElementProps) {
  // Get Zustand store methods
  const updateElement = useCanvasStore(state => state.updateElement)
  const selectElement = useCanvasStore(state => state.selectElement)
  const clearNewElementFlag = useCanvasStore(state => state.clearNewElementFlag)

  // Element ref and text editor key for rerendering
  const elementRef = useRef<HTMLDivElement>(null)
  const [textEditorKey, setTextEditorKey] = useState(0)

  // Initialize our custom hooks
  // const { isResizing, resizeDirection, startResize, endResize, calculateResize } = useCanvasElementResize()
  const { renderMeasurer } = useTextMeasurement()

  // Helper function to update element with viewport rect
  const updateElementWithRect = useCallback((updates: Partial<EditorCanvasElement>) => {
    const newRect = calculateViewportRect(
      { ...element, ...updates },
      canvasRef,
      scale
    );

    updateElement(element.id, {
      ...updates,
      rect: newRect
    });
  }, [element, canvasRef, scale, updateElement]);

  // Simple click handler for selection only
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;

    e.stopPropagation();
    selectElement(element.id, e.shiftKey);
  }, [element.id, isEditMode, selectElement]);



  // Handle text height change
  const handleHeightChange = useCallback((newHeight: number) => {
    if (element.type === "text") {
      updateElementWithRect({ height: newHeight })
    }
  }, [element, updateElementWithRect])

  // Handle text alignment change
  const handleTextAlignChange = useCallback((align: "left" | "center" | "right" | "justify") => {
    if (element.type !== "text") return
    updateElement(element.id, { textAlign: align })
  }, [element, updateElement])

  return (
    <>
      {/* Hidden measurer for text height calculation */}
      {element.type === 'text' && renderMeasurer()}

      {/* Main element container */}
      <div
        ref={elementRef}
        className={"absolute"}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          cursor: isEditMode ? (element.locked ? "default" : "grab") : "default",
          transform: "none",
          borderRadius: "2px",
          // Fixed stacking order based only on element type
          zIndex: element.type === "text" ? 1 : 0,
        }}
        onClick={handleClick}
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
      </div>
    </>
  )
}
