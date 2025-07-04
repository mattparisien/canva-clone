"use client"

import { ElementPropertyBar } from "@/(routes)/editor/components/ElementPropertyBar";
import { addToRefArrayOfObjects } from "@/lib/utils/utils";
import { MAX_ZOOM, MIN_ZOOM } from "@lib/constants/editor";
import { useCanvas } from "@lib/context/canvas-context";
import useCanvasStore, { useCurrentCanvasSize } from "@lib/stores/useCanvasStore";
import useEditorStore from "@lib/stores/useEditorStore";
import { useCallback, useEffect, useRef, useState } from "react";
import useElementActionBar from "../hooks/useElementActionBar";
import BottomBar from "./BottomBar";
import Canvas from "./canvas/Canvas";
import ElementControls from "./canvas/controls/ElementControls";
import { ElementActionBar } from "./canvas/ElementActionBar";
import PageNavigation from "./PageNavigation";


/**
 * Editor component serves as the main wrapper for the canvas editing experience.
 * It focuses exclusively on the canvas area and related editing functionality.
 */
export default function Editor() {
    // Reference for the editor container
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const elementPropertyBarRef = useRef<HTMLDivElement>(null);
    const elementActionBarRef = useRef<HTMLDivElement>(null);
    const elementRefs = useRef<Array<{ id: string; node: HTMLDivElement }>>([]);



    const [zoom, setZoom] = useState(30) // 25 – 200 %
    const [isFullscreen, setIsFullscreen] = useState(false)
    // Track which page thumbnail is selected (for delete functionality)
    const [selectedPageThumbnail, setSelectedPageThumbnail] = useState<string | null>(null)

    // Use Zustand stores directly
    const currentPageId = useEditorStore(state => state.currentPageId)
    const pages = useEditorStore(state => state.pages)
    const currentPageIndex = useEditorStore(state => state.currentPageIndex)
    const addPage = useEditorStore(state => state.addPage)
    const goToPage = useEditorStore(state => state.goToPage)
    const deletePage = useEditorStore(state => state.deletePage)
    const isEditMode = useEditorStore(state => state.isEditMode)


    // Canvas store selectors
    const canvasSize = useCurrentCanvasSize()
    const selectedElementIds = useCanvasStore(state => state.selectedElementIds)
    const selectedElement = useCanvasStore(state => state.selectedElement)
    const elements = useEditorStore(state => state.pages[currentPageIndex]?.elements || [])
    const updateElement = useCanvasStore(state => state.updateElement)
    const clearSelection = useCanvasStore(state => state.clearSelection)
    const deleteSelectedElements = useCanvasStore(state => state.deleteSelectedElements)
    const selectElement = useCanvasStore(state => state.selectElement)
    const deselectElement = useCanvasStore(state => state.deselectElement);
    const selectCanvas = useCanvasStore(state => state.selectCanvas);
    const isCanvasSelected = useCanvasStore(state => state.isCanvasSelected);
    const isSidebarPanelOpen = useEditorStore(state => state.sidebarPanel.isOpen);
    const closeSidebarPanel = useEditorStore(state => state.closeSidebarPanel);

    // Canvas context functions
    const { handleTextColorChange, handleBackgroundColorChange } = useCanvas();

    // Hooks
    const { position, placement } = useElementActionBar(selectedElement, elementActionBarRef, elementPropertyBarRef);

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
        if (selectedElement && selectedElement.kind === "text") {
            updateElement(selectedElement.id, { fontSize: size })
        }
    }, [selectedElement, updateElement]);

    // Add a keyboard event handler for element deletion
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the target is an input or textarea or contentEditable
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            // If Delete or Backspace key is pressed and we have selected elements
            if ((e.key === "Delete" || e.key === "Backspace") && selectedElementIds.length > 0) {
                e.preventDefault();
                // Delete all selected elements
                deleteSelectedElements();
            }
        };

        // Add event listener to document
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedElementIds, deleteSelectedElements]);

    const handleFontFamilyChange = useCallback((family: string) => {
        if (selectedElement && selectedElement.kind === "text") {
            updateElement(selectedElement.id, { fontFamily: family })
        }
    }, [selectedElement, updateElement]);

    const handleTextAlignChange = useCallback((align: "left" | "center" | "right") => {
        if (selectedElement && selectedElement.kind === "text") {
            updateElement(selectedElement.id, { textAlign: align })
        }
    }, [selectedElement, updateElement]);

    const handleFormatChange = useCallback((format: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }) => {
        if (selectedElement && selectedElement.kind === "text") {
            const updates: any = {};
            if (format.bold !== undefined) updates.bold = format.bold;
            if (format.italic !== undefined) updates.italic = format.italic;
            if (format.underline !== undefined) updates.underline = format.underline;
            if (format.strikethrough !== undefined) updates.isStrikethrough = format.strikethrough;
            updateElement(selectedElement.id, updates);
        }
    }, [selectedElement, updateElement]);

    const handlePositionChange = useCallback((position: { x?: number, y?: number }) => {
        if (selectedElement) {
            updateElement(selectedElement.id, position);
        }
    }, [selectedElement, updateElement]);

    useEffect(() => {
        // Add non-passive wheel event listener to prevent the error
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const zoomDelta = e.deltaY * 0.25;
                const next = Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom - zoomDelta)));
                setZoom(next);
            }
        };

        // Get the element where the wheel event should be captured
        const editorElement = editorContainerRef.current;
        if (editorElement) {
            editorElement.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (editorElement) {
                editorElement.removeEventListener('wheel', handleWheel);
            }
        };
    }, [zoom]);

    // Add keyboard shortcut for creating text elements with 'T' key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the target is an input or textarea or contentEditable
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            // Create text element when 'T' key is pressed
            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();

                // Get addElement from store
                const addElement = useCanvasStore.getState().addElement;

                // Create a new text element at the center of the canvas
                const newTextElement = {
                    kind: "text" as const,
                    x: (canvasSize.width - 300) / 2, // Center horizontally with default width
                    y: (canvasSize.height - 100) / 2, // Center vertically with default height
                    width: 300, // Default width
                    height: 100, // Default height
                    rect: { // Add viewport-relative rect
                        x: (canvasSize.width - 300) / 2,
                        y: (canvasSize.height - 100) / 2,
                        width: 300,
                        height: 100
                    },
                    content: "Add your text here",
                    fontSize: 36, // Default font size
                    fontFamily: "Inter", // Default font
                    textAlign: "center" as const,
                    isNew: true, // Flag as new for immediate editing
                    bold: false,
                    italic: false,
                    underline: false,
                    isStrikethrough: false,
                    isEditable: true // Start in editable mode
                };

                // Add the element to the canvas
                addElement(newTextElement);
            }
        };

        // Add event listener to document
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [canvasSize.width, canvasSize.height]);

    useEffect(() => {
        const handleOutsideClick = (e: globalThis.MouseEvent) => {
            // Only process if we're in edit mode
            if (!isEditMode) return;


            const target = e.target as HTMLElement;

            // Use data attributes to identify clickable areas
            const isClickOnInteractiveElement = target.closest('[data-editor-interactive]');

            // If click is on an interactive element, don't clear selection
            if (isClickOnInteractiveElement) {
                return;
            }

            // Close sidebar panel if open
            if (isSidebarPanelOpen) {
                closeSidebarPanel();
            }

            // Clear selections and exit text editing mode
            elementRefs.current.forEach(ref => {
                deselectElement(ref.id);
            });

            // Exit text editing mode for all elements when clicking outside
            elements.forEach(element => {
                if (element.kind === "text" && element.isEditable) {
                    updateElement(element.id, { isEditable: false });
                }
            });

            if (selectedElementIds.length > 0 || selectedElement !== null) {
                selectElement(null);
            }

            if (isCanvasSelected) {
                selectCanvas(false);
            }
        };

        window.addEventListener("mousedown", handleOutsideClick);
        return () => window.removeEventListener("mousedown", handleOutsideClick);
    }, [isEditMode, selectedElementIds, selectedElement, isCanvasSelected, isSidebarPanelOpen, selectElement, selectCanvas, closeSidebarPanel]);
    return (
        <div
            className="flex flex-1 overflow-hidden flex-col relative bg-editor pl-sidebar"
            ref={editorContainerRef}
        >
            {/* Main canvas area with wheel handler - removing inline wheel handler */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-editor">

                {/* Element Action Bar */}
                {selectedElement && (
                    <ElementActionBar
                        placement={placement}
                        position={position}
                        element={selectedElement}
                        ref={elementActionBarRef}
                        onDelete={() => {
                            if (selectedElement) {
                                // Delete the element and clear selection
                                deleteSelectedElements();
                                clearSelection();
                            }
                        }}
                        onLock={() => {
                            if (selectedElement) {
                                // Toggle the locked state
                                const newLockedState = !selectedElement.locked;
                                console.log(`Setting element ${selectedElement.id} locked: ${newLockedState}`);
                                updateElement(selectedElement.id, { locked: newLockedState });
                            }
                        }}
                        onDuplicate={() => {
                            if (selectedElement) {
                                // Use the duplicateElement method from the Canvas Store
                                const duplicateElement = useCanvasStore.getState().duplicateElement;
                                duplicateElement(selectedElement.id);
                            }
                        }}
                    />
                )}

                {/* ElementPropertyBar moved here */}
                {selectedElement && (
                    <ElementPropertyBar
                        selectedElement={selectedElement}
                        onFontSizeChange={handleFontSizeChange}
                        onFontFamilyChange={handleFontFamilyChange}
                        onTextAlignChange={handleTextAlignChange}
                        onFormatChange={handleFormatChange}
                        onPositionChange={handlePositionChange}
                        isHovering={false}
                        elementId={selectedElement?.id || null}
                        canvasWidth={canvasSize.width}
                        ref={elementPropertyBarRef}
                    />
                )}
                <Canvas
                    zoom={zoom}
                    setZoom={handleZoomChange}
                    ref={canvasRef}
                />
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

                {elements.map(element => (
                    <ElementControls
                        key={element.id}
                        element={element}
                        scale={zoom / 100}
                        isEditMode={isEditMode}
                        ref={(el: HTMLDivElement | null) => {
                            if (el) addToRefArrayOfObjects({
                                id: element.id,
                                node: el
                            }, elementRefs.current);
                        }}
                    />
                ))}


            </div>


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