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
    const isPopoverOpen = useEditorStore((state) => state.popover.isOpen);
    const closePopover = useEditorStore((state) => state.closePopover);
    const { handleTextColorChange } = useCanvas();

    return (
        <Popover.Root 
            open={isPopoverOpen} 
            onOpenChange={(open) => {
                if (!open) {
                    closePopover();
                }
            }}
        >
            <div className={"flex h-screen flex-col"}>
                <Popover.Anchor>
                    <EditorNavbar />
                </Popover.Anchor>
                <EditorSidebar onTextColorChange={handleTextColorChange} />
                {children}
            </div>
        </Popover.Root>
    );
}