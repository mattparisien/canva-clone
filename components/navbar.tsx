"use client"

import { useState } from "react"
import { ChevronDown, Undo, Redo, Save, Menu, Share2, LayoutGrid } from "lucide-react"
import { useCanvas } from "@/context/canvas-context"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { canvasSize } = useCanvas()
  const [documentName, setDocumentName] = useState("Untitled Design")

  return (
    <div className="flex h-14 items-center border-b bg-gradient-to-r from-cyan-500 to-indigo-500 px-4">
      <Button variant="ghost" size="icon" className="text-white">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="ml-4 flex items-center">
        <span className="text-white">File</span>
      </div>

      <div className="ml-6 flex items-center">
        <Button variant="ghost" className="flex items-center gap-1 text-white">
          <span>Resize</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-2 flex items-center">
        <Button variant="ghost" className="flex items-center gap-1 text-white">
          <span>Editing</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-white">
          <Undo className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white">
          <Redo className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white">
          <Save className="h-5 w-5" />
        </Button>
      </div>

      <div className="mx-auto flex-1 text-center">
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          className="bg-transparent text-center text-white outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-white">
          <LayoutGrid className="mr-2 h-4 w-4" />
          <span>Publish as Brand Template</span>
        </Button>

        <Button className="bg-white text-blue-600 hover:bg-gray-100">
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  )
}
