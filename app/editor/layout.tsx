"use client"

import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { CanvasProvider } from "@/context/canvas-context"
import { EditorProvider } from "@/context/editor-context"

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