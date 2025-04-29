"use client"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { Canvas } from "@/components/canvas"
import { CanvasProvider } from "@/context/canvas-context"

export default function CanvaEditor() {
  return (
    <CanvasProvider>
      <div className="flex h-screen flex-col bg-white">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Canvas />
        </div>
      </div>
    </CanvasProvider>
  )
}
