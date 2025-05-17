"use client"

import EditorNavbar from "@/components/layout/navbar"
import { NavigationSidebar } from "@/components/layout/navigation-sidebar"
import { EDITOR_NAVIGATION_ITEMS } from "@/lib/constants/navigation"
import { CanvasProvider } from "@lib/context/canvas-context"
import { EditorProvider } from "@lib/context/editor-context"

export default function EditorLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <EditorProvider>
            <CanvasProvider>
                <div className="flex h-screen flex-col bg-white">
                    <EditorNavbar />
                    <div className="flex flex-1 overflow-hidden">
                        <NavigationSidebar items={EDITOR_NAVIGATION_ITEMS} variant="editor" />
                        {children}
                    </div>
                </div>
            </CanvasProvider>
        </EditorProvider>
    )
}