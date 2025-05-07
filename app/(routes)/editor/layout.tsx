"use client"

import { Sidebar } from "@components/layout/sidebar"
import { Navbar } from "@components/layout/navbar"
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
                    <Navbar />
                    <div className="flex flex-1 overflow-hidden bg-[#EDF1F5]">
                        <Sidebar />
                        {children}
                    </div>
                </div>
            </CanvasProvider>
        </EditorProvider>
    )
}