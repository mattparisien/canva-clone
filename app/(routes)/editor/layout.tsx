"use client"

import EditorNavbar from "@/components/layout/navbar"
import { CanvasProvider, useCanvas } from "@lib/context/canvas-context"
import { EditorProvider } from "@lib/context/editor-context"
import * as Popover from "@radix-ui/react-popover"
import EditorSidebar from "./components/Sidebar"
import './styles/Editor.css'; // Import editor-specific styles
import useEditorStore from "@/lib/stores/useEditorStore"


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
    const { handleTextColorChange, handleBackgroundColorChange } = useCanvas();

    return (
        <Popover.Root
            open={isPanelOpen}
            onOpenChange={(open) => {
                if (!open) {
                    closeSidebarPanel();
                }
            }}
        >
            <div className={"flex h-screen flex-col select-none"}>
                <Popover.Anchor>
                    <EditorNavbar />
                </Popover.Anchor>
                <EditorSidebar 
                    onTextColorChange={handleTextColorChange} 
                    onBackgroundColorChange={handleBackgroundColorChange} 
                />
                {children}
            </div>
        </Popover.Root>
    );
}