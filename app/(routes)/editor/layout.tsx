"use client"

import { Sidebar } from "@/app/components/sidebar"
import { Navbar } from "@/app/components/navbar"
import { CanvasProvider } from "@/app/lib/context/canvas-context"
import { EditorProvider } from "@/app/lib/context/editor-context"

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