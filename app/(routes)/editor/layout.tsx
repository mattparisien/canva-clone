"use client"

import EditorNavbar from "@/components/layout/navbar"
import { createArrowElement, createCircleElement, createLineElement, createRectangleElement } from "@/lib/factories/element-factories"
import useCanvasStore, { useCurrentCanvasSize } from "@/lib/stores/useCanvasStore"
import useEditorStore from "@/lib/stores/useEditorStore"
import { CanvasProvider, useCanvas } from "@lib/context/canvas-context"
import { EditorProvider } from "@lib/context/editor-context"
import * as Popover from "@radix-ui/react-popover"
import { useCallback } from "react"
import EditorSidebar from "./components/Sidebar/Sidebar"
import EditorSidebarPanel from "./components/Sidebar/SidebarPanel"
import {
    BackgroundColorPanelContent,
    DefaultPanelContent,
    ElementsPanelContent,
    TextColorPanelContent,
    TextPanelContent
} from "./components/Sidebar/SidebarPanelContent"
import './styles/Editor.css'; // Import editor-specific styles


export default function EditorLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {

    return (
        <EditorProvider>
            <CanvasProvider>
                <EditorLayoutContent>
                    {children}
                </EditorLayoutContent>
            </CanvasProvider>
        </EditorProvider >
    )
}

function EditorLayoutContent({ children }: { children: React.ReactNode }) {
    const isPanelOpen = useEditorStore((state) => state.sidebarPanel.isOpen);
    const closeSidebarPanel = useEditorStore((state) => state.closeSidebarPanel);
    const isSidebarPanelOpen = useEditorStore((state) => state.sidebarPanel.isOpen);
    const { handleTextColorChange, handleBackgroundColorChange } = useCanvas();
    const activeItemId = useEditorStore((state) => state.sidebarPanel.activeItemId);
    const canvasSize = useCurrentCanvasSize();
    const selectedElement = useCanvasStore(state => state.selectedElement);
    const addElement = useCanvasStore(state => state.addElement);


    const onTextColorChange = handleTextColorChange;
    const onBackgroundColorChange = handleBackgroundColorChange;

    // Function to create different shapes
    const handleAddShape = useCallback((shapeType: "rectangle" | "circle" | "line" | "arrow") => {
        switch (shapeType) {
            case "rectangle":
                addElement(createRectangleElement({
                    backgroundColor: "#333333", // Dark gray
                }, canvasSize.width, canvasSize.height));
                break;
            case "circle":
                addElement(createCircleElement({
                    backgroundColor: "#333333", // Dark gray
                }, canvasSize.width, canvasSize.height));
                break;
            case "line":
                addElement(createLineElement({
                    borderWidth: 2,
                    borderColor: "#333333", // Dark gray
                }, canvasSize.width, canvasSize.height));
                break;
            case "arrow":
                addElement(createArrowElement({
                    borderWidth: 2,
                    borderColor: "#333333", // Dark gray
                }, canvasSize.width, canvasSize.height));
                break;
            default:
                break;
        }

        // Optional: Close the panel after adding a shape
        // openSidebarPanel("");
    }, [addElement, canvasSize.width, canvasSize.height]);

    // Render appropriate content based on active item
    const renderPanelContent = useCallback(() => {
        switch (activeItemId) {
            case "elements":
                return <ElementsPanelContent handleAddShape={handleAddShape} />;
            case "text":
                return <TextPanelContent />;
            case "text-color":
                return <TextColorPanelContent onTextColorChange={onTextColorChange} />;
            case "background-color":
                return <BackgroundColorPanelContent onBackgroundColorChange={onBackgroundColorChange} />;
            default:
                return <DefaultPanelContent activeItemId={activeItemId || ""} />;
        }
    }, [activeItemId, handleAddShape, onTextColorChange, onBackgroundColorChange]);


    return (
        <Popover.Root
            open={isPanelOpen}
        >
            <div className={"flex h-screen flex-col select-none popover-root-custom"}>
                <Popover.Anchor>
                    <EditorNavbar />
                </Popover.Anchor>
                <EditorSidebar
                    onTextColorChange={handleTextColorChange}
                    onBackgroundColorChange={handleBackgroundColorChange}
                />
                {isSidebarPanelOpen &&
                    <EditorSidebarPanel 
                        topOffset={isPanelOpen && selectedElement ? "var(--editor-sidebarPanel-topOffset)" : "0.5rem"}
                        height={selectedElement ? "var(--editor-sidebarPanel-height)" : "calc(100vh - var(--header-height) - var(--editor-bottomBar-height) - 0.5rem)"}
                    >
                        {renderPanelContent()}
                    </EditorSidebarPanel>}
                {children}
            </div>
        </Popover.Root>
    );
}