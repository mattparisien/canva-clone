"use client"

import { Canvas } from "@/components/canvas"
import { Plus, PenLine, LayoutGrid, Maximize, HelpCircle } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { MIN_ZOOM, MAX_ZOOM } from "@/lib/constants/editor"
import { useState, useRef, useCallback } from "react"
import { useCanvas } from "@/context/canvas-context"
import { TextToolbar } from "@/components/text-toolbar"

/**
 * Editor component serves as the main wrapper for the canvas editing experience.
 * It focuses exclusively on the canvas area and related editing functionality.
 */
export function Editor() {
    // Reference for the editor container
    const editorContainerRef = useRef<HTMLDivElement>(null)
    const [zoom, setZoom] = useState(100) // 25 – 200 %
    const { 
        canvasSize, 
        selectedElement, 
        updateElement, 
        selectElement, 
        clearSelection, 
        selectCanvas 
    } = useCanvas();

    // Handle clicks outside the canvas to deselect everything
    const handleEditorClick = useCallback((e: React.MouseEvent) => {
        // Check if the click target is not the canvas or any of its children
        const canvasElement = document.querySelector('.canvas-wrapper')
        if (canvasElement && !canvasElement.contains(e.target as Node)) {
            // Clear all selections - elements and canvas
            clearSelection();
        }
    }, [clearSelection]);

    // Zoom handler that will be passed to Canvas
    const handleZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
    }, []);

    // Text editing handlers
    const handleFontSizeChange = useCallback((size: number) => {
        if (selectedElement && selectedElement.type === "text") {
            updateElement(selectedElement.id, { fontSize: size })
        }
    }, [selectedElement, updateElement]);

    const handleFontFamilyChange = useCallback((family: string) => {
        if (selectedElement && selectedElement.type === "text") {
            updateElement(selectedElement.id, { fontFamily: family })
        }
    }, [selectedElement, updateElement]);

    const handleTextAlignChange = useCallback((align: "left" | "center" | "right" | "justify") => {
        if (selectedElement && selectedElement.type === "text") {
            updateElement(selectedElement.id, { textAlign: align })
        }
    }, [selectedElement, updateElement]);

    const handleFormatChange = useCallback((format: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }) => {
        if (selectedElement && selectedElement.type === "text") {
            const updates: any = {};
            if (format.bold !== undefined) updates.isBold = format.bold;
            if (format.italic !== undefined) updates.isItalic = format.italic;
            if (format.underline !== undefined) updates.isUnderlined = format.underline;
            if (format.strikethrough !== undefined) updates.isStrikethrough = format.strikethrough;
            updateElement(selectedElement.id, updates);
        }
    }, [selectedElement, updateElement]);

    const handlePositionChange = useCallback((position: { x?: number, y?: number }) => {
        if (selectedElement) {
            updateElement(selectedElement.id, position);
        }
    }, [selectedElement, updateElement]);

    return (
        <div className="flex flex-1 overflow-hidden flex-col relative" ref={editorContainerRef} onClick={handleEditorClick}>
            {/* Main canvas area with wheel handler */}
            <div className="flex-1 overflow-hidden relative" onWheel={e => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const zoomDelta = e.deltaY * 0.25;
                    const next = Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom - zoomDelta)));
                    setZoom(next);
                }
            }}>
                {/* TextToolbar moved here */}
                {selectedElement && selectedElement.type === "text" && (
                    <TextToolbar
                        selectedElement={selectedElement}
                        onFontSizeChange={handleFontSizeChange}
                        onFontFamilyChange={handleFontFamilyChange}
                        onTextAlignChange={handleTextAlignChange}
                        onFormatChange={handleFormatChange}
                        onPositionChange={handlePositionChange}
                        isHovering={false}
                        elementId={selectedElement?.id || null}
                        canvasWidth={canvasSize.width}
                    />
                )}
                <Canvas
                    zoom={zoom}
                    setZoom={handleZoomChange}
                />
            </div>

            {/* Add Page Button - moved from Canvas */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
                <button className="px-6 h-10 flex items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white/80 text-sm text-gray-500 hover:bg-white hover:text-gray-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span>Add page</span>
                </button>
            </div>

            {/* Bottom Bar - moved from Canvas */}
            <div className="h-12 flex items-center justify-between px-4 bg-[#EDF1F5]">
                {/* Left side - Notes button */}
                <div className="flex items-center">
                    <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                        <PenLine className="h-5 w-5" />
                        <span className="font-medium">Notes</span>
                    </button>
                </div>

                {/* Right side - Zoom controls and page info */}
                <div className="flex items-center gap-6">
                    {/* Zoom slider */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-36 flex items-center">
                            <Slider
                                value={[zoom]}
                                min={MIN_ZOOM}
                                max={MAX_ZOOM}
                                step={1}
                                onValueChange={([v]) => setZoom(v)}
                            />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{zoom}%</span>
                    </div>

                    {/* Pages button */}
                    <div className="flex items-center gap-1">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M8 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span className="font-medium">Pages</span>
                        </button>
                    </div>

                    {/* Page counter */}
                    <span className="text-sm text-gray-700">1 / 1</span>

                    {/* Grid view */}
                    <button className="text-gray-700 hover:text-gray-900">
                        <LayoutGrid className="h-5 w-5" />
                    </button>

                    {/* Fullscreen */}
                    <button className="text-gray-700 hover:text-gray-900">
                        <Maximize className="h-5 w-5" />
                    </button>

                    {/* Help */}
                    <button className="text-gray-700 hover:text-gray-900">
                        <HelpCircle className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}