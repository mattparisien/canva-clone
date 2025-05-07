"use client"

import { Canvas } from "@/app/components/features/editor/canvas"
import { TextToolbar } from "@/app/components/features/editor/text-toolbar"
import { Slider } from "@/app/components/ui/slider"
import { useCanvas } from "@/app/lib/context/canvas-context"
import { useEditor } from "@/app/lib/context/editor-context"
import { MAX_ZOOM, MIN_ZOOM } from "@/app/lib/constants/editor"
import { HelpCircle, LayoutGrid, Maximize, PenLine, Plus } from "lucide-react"
import { useCallback, useRef, useState } from "react"

/**
 * Editor component serves as the main wrapper for the canvas editing experience.
 * It focuses exclusively on the canvas area and related editing functionality.
 */
export function Editor() {
    // Reference for the editor container
    const editorContainerRef = useRef<HTMLDivElement>(null)
    const [zoom, setZoom] = useState(100) // 25 – 200 %

    // Get editor-level state (pages, navigation)
    const {
        pages,
        currentPageIndex,
        currentPageId,
        goToPage,
        addPage
    } = useEditor();

    // Get canvas-level state (elements, selection)
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

            {/* Page Navigation Controls */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 py-2">
                <div className="flex items-center gap-2">
                    {pages.map((page, index) => (
                        <div key={page.id} className="group relative">
                            <div
                                className={`relative rounded-md overflow-hidden border-2 ${currentPageId === page.id
                                    ? 'border-[#8344e1] shadow-sm'
                                    : 'border-[#e5e5e5] hover:border-[#d0d0d0]'
                                    } transition-all cursor-pointer`}
                                style={{ width: '100px', height: '56px' }}
                                onClick={() => goToPage(page.id)}
                            >
                                <div className="absolute inset-0 bg-white flex items-center justify-center">
                                    <div className="text-[0.6rem] text-gray-600 absolute top-1 right-1 flex items-center">
                                        <span>{index + 1}</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-[0.6rem] text-gray-500">Your paragraph text</div>
                                        <img src="/abstract-geometric-shapes.png" alt="Placeholder" className="mt-0.5 w-4 h-4 opacity-30" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div
                        className="rounded-md flex items-center justify-center bg-[#e2e2e2] hover:bg-[#d0d0d0] transition-colors cursor-pointer"
                        style={{ width: '100px', height: '56px' }}
                        onClick={() => addPage()}
                    >
                        <Plus className="h-5 w-5 text-gray-700" strokeWidth={1.2} />
                    </div>
                </div>
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
                    <span className="text-sm text-gray-700">{currentPageIndex + 1} / {pages.length}</span>

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