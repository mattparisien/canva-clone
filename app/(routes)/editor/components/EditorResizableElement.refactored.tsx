"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { HANDLE_BASE_SIZE } from "@/lib/constants/editor"
import useCanvasStore from "@lib/stores/useCanvasStore"
import { Element as CanvasElement } from "@lib/types/canvas.types"
import { TextEditor } from "./EditorTextEditor"

// First, let's properly define our imports with specific path resolution
import { useElementInteraction } from "../hooks/useElementInteraction"
import { useElementResize } from "../hooks/useElementResize"
import { useSnapping } from "../hooks/useSnapping"
import { useTextMeasurement } from "../hooks/useTextMeasurement"

// Alternatively, let's also import the hooks this way if the above doesn't work
// import { 
//   useSnapping,
//   useElementResize,
//   useTextMeasurement,
//   useElementInteraction 
// } from "@/app/lib/hooks"

interface ResizableElementProps {
    element: CanvasElement
    isSelected: boolean
    scale: number
    canvasRef: React.RefObject<HTMLDivElement>
    allElements: CanvasElement[]
    canvasWidth: number
    canvasHeight: number
    onDragStart: (element: CanvasElement) => void
    onDrag: (element: CanvasElement, x: number, y: number, alignments: { horizontal: number[]; vertical: number[] }, isMultiSelectionDrag: boolean) => void
    onDragEnd: () => void
    onHover: (id: string | null) => void
    isEditMode: boolean
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
    isEditMode,
}: ResizableElementProps) {
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
    const { isResizing, resizeDirection, startResize, endResize, calculateResize } = useElementResize()
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
    } = useElementInteraction()

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
                    element,
                    newX,
                    newY,
                    allElements.filter((el) => el.id !== element.id),
                    canvasWidth,
                    canvasHeight,
                    isDragging,
                    isSelected
                )

                // Update element position
                updateElement(element.id, {
                    x: snappedX,
                    y: snappedY,
                })

                // Check if this is a multi-selection drag
                const isMultiSelectionDrag = selectedElementIds.length > 1 && selectedElementIds.includes(element.id)

                // Notify parent component
                onDrag(element, snappedX, snappedY, newAlignments, isMultiSelectionDrag)

                // Update drag start position for next move
                setDragStart({
                    x: e.clientX,
                    y: e.clientY,
                })
            } else if (isResizing) {
                // Calculate new dimensions and position
                const resizeResult = calculateResize(
                    element,
                    e.clientX,
                    e.clientY,
                    scale,
                    isAltKeyPressed
                )

                const { width: newWidth, height: newHeight, x: newX, y: newY, fontSize: newFontSize, widthChanged } = resizeResult

                // Update element with new dimensions, position and font size
                updateElement(element.id, {
                    width: newWidth,
                    height: newHeight,
                    x: newX,
                    y: newY,
                    ...(element.type === "text" ? { fontSize: newFontSize } : {}),
                })

                // If resizing a text element horizontally, measure and update height immediately
                if (element.type === "text" && widthChanged) {
                    const measuredHeight = measureElementHeight(element)

                    if (measuredHeight && measuredHeight !== newHeight) {
                        updateElement(element.id, { height: measuredHeight })
                    }

                    // Force TextEditor re-render to recalculate height
                    setTextEditorKey((k) => k + 1)
                }

                // Update drag start position for next move
                setDragStart({
                    x: e.clientX,
                    y: e.clientY,
                })
            }
        }

        const handleMouseUp = () => {
            if (isDragging) {
                endDrag(onDragEnd)
            }

            // We're ending the drag/resize operation but need to keep the element selected
            if (isResizing) {
                endResize()
                // Only call when ending a resize operation, with false to not toggle selection
                selectElement(element.id, false)
                // Set the flag to prevent immediate deselect
                setJustFinishedResizing(true)
            }
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
                className={`absolute${isSelected && isEditMode ? " ring-4 ring-brand-blue ring-opacity-80" : isHovering && isEditMode ? " ring-4 ring-brand-blue ring-opacity-60" : ""}`}
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
                {renderElement()}

                {/* Only show resize handles when selected and in edit mode */}
                {isSelected && isEditMode && (
                    <>
                        {/* Top-left corner handle */}
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
                                    background: getHandleBg("nw", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                                }}
                                onMouseDown={(e) => handleResizeStart(e, "nw")}
                                onMouseEnter={() => setHandleHoverState("nw", true)}
                                onMouseLeave={() => setHandleHoverState("nw", false)}
                            />
                        )}

                        {/* These corner handles only show when element is big enough */}
                        {!isTooSmallForAllHandles && (
                            <>
                                {/* Northeast corner handle */}
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
                                            background: getHandleBg("sw", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                                        }}
                                        onMouseDown={(e) => handleResizeStart(e, "sw")}
                                        onMouseEnter={() => setHandleHoverState("sw", true)}
                                        onMouseLeave={() => setHandleHoverState("sw", false)}
                                    />
                                )}

                                {/* Southeast corner handle */}
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
                                            background: getHandleBg("se", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                                        }}
                                        onMouseDown={(e) => handleResizeStart(e, "se")}
                                        onMouseEnter={() => setHandleHoverState("se", true)}
                                        onMouseLeave={() => setHandleHoverState("se", false)}
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
                )}
            </div>
        </>
    )
}