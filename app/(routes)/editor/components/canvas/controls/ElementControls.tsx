"use client"

import React from "react"
import { Element as CanvasElement } from "@lib/types/canvas.types"

interface ElementControlsProps {
  element: CanvasElement
  scale: number
  isResizing: boolean
  resizeDirection: string
  handleResizeStart: (e: React.MouseEvent, direction: string) => void
  getHandleBg: (direction: string, resizeDirection: string, isResizing: boolean) => string
  setHandleHoverState: (direction: string, isHovering: boolean) => void
  leftBorderHover: boolean
  rightBorderHover: boolean
  setLeftBorderHover: (isHovering: boolean) => void
  setRightBorderHover: (isHovering: boolean) => void
  isDragging: boolean
}

/**
 * Determine if an element should show top/bottom handles 
 * (shapes should, text elements shouldn't)
 */
const shouldShowTopBottomHandles = (element: CanvasElement): boolean => {
  return element.type !== "text"; // Only show for non-text elements
};

// Use React.memo to prevent unnecessary rerenders
export const ElementControls = React.memo(({
  element,
  scale,
  isResizing,
  resizeDirection,
  handleResizeStart,
  getHandleBg,
  setHandleHoverState,
  leftBorderHover,
  rightBorderHover,
  setLeftBorderHover,
  setRightBorderHover,
  isDragging,
}: ElementControlsProps) => {
  // Don't render controls when dragging for performance
  if (isDragging) return null;
  
  // Don't render resize controls when element is locked
  if (element.locked) {
    // Only render the selection border to indicate selection
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: '2px solid rgba(30, 136, 229, 0.8)',
          borderRadius: '2px',
          background: 'transparent'
        }}
      />
    );
  }
  
  // Calculate handle sizes
  const handleSize = 18 / scale; // Using constant HANDLE_BASE_SIZE = 18
  const isTooSmallForAllHandles = element.width < handleSize * 3.5 || element.height < handleSize * 3.5;
  
  // Check if this element type should have top/bottom handles
  const showTopBottomHandles = shouldShowTopBottomHandles(element);

  return (
    <>
      {/* Top-left corner handle */}
      {(!isResizing || resizeDirection === "nw") && (
        <div
          className="absolute cursor-nwse-resize z-editor-overlay"
          style={{
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            borderRadius: "50%",
            boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
            border: "1px solid var(--handle-border)",
            top: 0,
            left: 0,
            transform: `translate(-50%, -50%) scale(${1})`,
            background: getHandleBg("nw", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
          }}
          onMouseDown={(e) => handleResizeStart(e, "nw")}
          onMouseEnter={() => setHandleHoverState("nw", true)}
          onMouseLeave={() => setHandleHoverState("nw", false)}
        />
      )}

      {/* Top handle - only for shape elements */}
      {showTopBottomHandles && !isTooSmallForAllHandles && (!isResizing || resizeDirection === "n") && (
        <div
          className="absolute cursor-ns-resize"
          style={{
            width: `${handleSize * 2.2}px`,
            height: `${handleSize * 0.7}px`,
            borderRadius: `${handleSize * 0.35}px`,
            boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
            border: "1px solid var(--handle-border)",
            zIndex: 10,
            top: 0,
            left: "50%",
            transform: `translate(-50%, -50%) scale(${1})`,
            background: getHandleBg("n", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
          }}
          onMouseDown={(e) => handleResizeStart(e, "n")}
          onMouseEnter={() => setHandleHoverState("n", true)}
          onMouseLeave={() => setHandleHoverState("n", false)}
        />
      )}

      {/* These corner handles only show when element is big enough */}
      {!isTooSmallForAllHandles && (
        <>
          {/* Northeast corner handle */}
          {(!isResizing || resizeDirection === "ne") && (
            <div
              className="absolute cursor-nesw-resize"
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
                background: getHandleBg("ne", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
              }}
              onMouseDown={(e) => handleResizeStart(e, "ne")}
              onMouseEnter={() => setHandleHoverState("ne", true)}
              onMouseLeave={() => setHandleHoverState("ne", false)}
            />
          )}

          {/* Southwest corner handle */}
          {(!isResizing || resizeDirection === "sw") && (
            <div
              className="absolute cursor-nesw-resize"
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
                background: getHandleBg("sw", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
              }}
              onMouseDown={(e) => handleResizeStart(e, "sw")}
              onMouseEnter={() => setHandleHoverState("sw", true)}
              onMouseLeave={() => setHandleHoverState("sw", false)}
            />
          )}
        </>
      )}

      {/* Southeast corner handle */}
      {(!isResizing || resizeDirection === "se") && (
        <div
          className="absolute cursor-nwse-resize"
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
            background: getHandleBg("se", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
          }}
          onMouseDown={(e) => handleResizeStart(e, "se")}
          onMouseEnter={() => setHandleHoverState("se", true)}
          onMouseLeave={() => setHandleHoverState("se", false)}
        />
      )}

      {/* Bottom handle - only for shape elements */}
      {showTopBottomHandles && !isTooSmallForAllHandles && (!isResizing || resizeDirection === "s") && (
        <div
          className="absolute cursor-ns-resize"
          style={{
            width: `${handleSize * 2.2}px`,
            height: `${handleSize * 0.7}px`,
            borderRadius: `${handleSize * 0.35}px`,
            boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
            border: "1px solid var(--handle-border)",
            zIndex: 10,
            bottom: 0,
            left: "50%",
            transform: `translate(-50%, 50%) scale(${1})`,
            background: getHandleBg("s", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
          }}
          onMouseDown={(e) => handleResizeStart(e, "s")}
          onMouseEnter={() => setHandleHoverState("s", true)}
          onMouseLeave={() => setHandleHoverState("s", false)}
        />
      )}

      {/* Right handle with enhanced styling */}
      {(!isResizing || resizeDirection === "e") && (
        <div
          className="absolute cursor-ew-resize"
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
            background: (rightBorderHover || getHandleBg("e", resizeDirection, isResizing) === "var(--handle-hover)") ? "#1E88E5" : "#ffffff",
          }}
          onMouseDown={(e) => handleResizeStart(e, "e")}
          onMouseEnter={() => setHandleHoverState("e", true)}
          onMouseLeave={() => setHandleHoverState("e", false)}
        />
      )}

      {/* Left handle with enhanced styling */}
      {!isTooSmallForAllHandles && (!isResizing || resizeDirection === "w") && (
        <div
          className="absolute cursor-ew-resize"
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
            background: (leftBorderHover || getHandleBg("w", resizeDirection, isResizing) === "var(--handle-hover)") ? "#1E88E5" : "#ffffff",
          }}
          onMouseDown={(e) => handleResizeStart(e, "w")}
          onMouseEnter={() => setHandleHoverState("w", true)}
          onMouseLeave={() => setHandleHoverState("w", false)}
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
  )
});

ElementControls.displayName = 'ElementControls';