"use client"

import { Canvas } from "@components/features/editor/canvas"
import { TextToolbar } from "@components/features/editor/text-toolbar"
import { Slider } from "@components/ui/slider"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { useCanvas } from "@lib/context/canvas-context"
import { useEditor } from "@lib/context/editor-context"
import { MAX_ZOOM, MIN_ZOOM } from "@lib/constants/editor"
import { HelpCircle, LayoutGrid, Maximize, Minus, PenLine, Plus, ZoomIn } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import BottomBar from "./bottom-bar"
import PageNavigation from "./page-navigation"

/**
 * Editor component serves as the main wrapper for the canvas editing experience.
 * It focuses exclusively on the canvas area and related editing functionality.
 */
export function Editor() {
    // Reference for the editor container
    const editorContainerRef = useRef<HTMLDivElement>(null)
    const [zoom, setZoom] = useState(100) // 25 – 200 %
    const [isFullscreen, setIsFullscreen] = useState(false)
    // Track which page thumbnail is selected (for delete functionality)
    const [selectedPageThumbnail, setSelectedPageThumbnail] = useState<string | null>(null)

    // Get editor-level state (pages, navigation)
    const {
        pages,
        currentPageIndex,
        currentPageId,
        goToPage,
        addPage,
        deletePage
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

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(MAX_ZOOM, prev + 10));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(MIN_ZOOM, prev - 10));
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    }, []);

    // Listen for fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Listen for keyboard events for page deletion
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the target is an input or textarea or contentEditable
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            // If Delete key is pressed and a page thumbnail is selected
            if ((e.key === "Delete" || e.key === "Backspace") && selectedPageThumbnail) {
                e.preventDefault(); // Prevent browser's back navigation on Backspace
                e.stopPropagation(); // Stop event propagation

                // Don't delete if it's the only page
                if (pages.length <= 1) {
                    return;
                }

                console.log(`Deleting page with ID: ${selectedPageThumbnail}`);
                deletePage(selectedPageThumbnail);
                setSelectedPageThumbnail(null);
            }

            // Deselect with Escape key
            if (e.key === "Escape" && selectedPageThumbnail) {
                setSelectedPageThumbnail(null);
            }
        };

        // Add event listener directly to the document
        document.addEventListener("keydown", handleKeyDown, { capture: true });

        // Clicking elsewhere should deselect the page thumbnail
        const handleClickOutside = (e: MouseEvent) => {
            const pageThumbnails = document.querySelector('.page-thumbnails-container');
            if (pageThumbnails && !pageThumbnails.contains(e.target as Node) && selectedPageThumbnail) {
                setSelectedPageThumbnail(null);
            }
        };

        window.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("keydown", handleKeyDown, { capture: true });
            window.removeEventListener("click", handleClickOutside);
        };
    }, [deletePage, pages.length, selectedPageThumbnail]);

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
        <div
            className="flex flex-1 overflow-hidden flex-col relative bg-slate-50"
            ref={editorContainerRef}
            onClick={handleEditorClick}
        >
            {/* Main canvas area with wheel handler */}
            <div
                className="flex-1 overflow-hidden relative"
                onWheel={e => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const zoomDelta = e.deltaY * 0.25;
                        const next = Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom - zoomDelta)));
                        setZoom(next);
                    }
                }}
            >
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

            {/* Page Navigation Controls with refined styling */}
            <PageNavigation
                pages={pages}
                currentPageId={currentPageId}
                goToPage={goToPage}
                addPage={addPage}
                deletePage={deletePage}
                selectedPageThumbnail={selectedPageThumbnail}
                setSelectedPageThumbnail={setSelectedPageThumbnail}
            />

            {/* Bottom Bar with gradient styling */}
            <BottomBar
                zoom={zoom}
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                setZoom={setZoom}
                currentPageIndex={currentPageIndex}
                pages={pages}
            />
        </div>
    )
}