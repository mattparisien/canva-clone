"use client"

import EditorNavbar from "@/components/layout/navbar"
import { CanvasProvider } from "@lib/context/canvas-context"
import { EditorProvider } from "@lib/context/editor-context"
import * as Popover from "@radix-ui/react-popover"
import EditorSidebar from "./components/Sidebar"
import './styles/Editor.css'; // Import editor-specific styles


export default function EditorLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {

    return (
        <EditorProvider>
            <CanvasProvider>
                <Popover.Root>
                    <div className={"flex h-screen flex-col"}>
                        <Popover.Anchor>
                            <EditorNavbar />
                        </Popover.Anchor>
                        <EditorSidebar />
                        {children}
                    </div>
                </Popover.Root>
            </CanvasProvider>
        </EditorProvider >
    )
}