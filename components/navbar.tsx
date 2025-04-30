"use client"

import { useState } from "react"
import { Undo, Redo, Save, Menu, Share2, Download, Settings, HelpCircle } from "lucide-react"
import { useCanvas } from "@/context/canvas-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Navbar() {
  const { canvasSize, canUndo, canRedo, undo, redo } = useCanvas()
  const [documentName, setDocumentName] = useState("Untitled Design")

  return (
    <div className="flex h-16 items-center border-b border-gray-100 bg-white px-4 shadow-sm">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary hover:bg-primary-50">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="ml-4 flex items-center">
          <img src="/abstract-logo.png" alt="Logo" className="h-8 w-8 rounded" />
        </div>
      </div>

      <div className="ml-6 flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${canUndo ? "text-gray-700" : "text-gray-300"} hover:text-primary hover:bg-primary-50`}
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${canRedo ? "text-gray-700" : "text-gray-300"} hover:text-primary hover:bg-primary-50`}
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary hover:bg-primary-50">
                <Save className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" className="text-gray-600 hover:text-primary hover:bg-primary-50">
          <Download className="mr-2 h-4 w-4" />
          <span>Download</span>
        </Button>

        <Button className="bg-primary hover:bg-primary-700 text-white">
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </Button>

        <div className="ml-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary hover:bg-primary-50">
            <Settings className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary hover:bg-primary-50">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <Avatar className="h-8 w-8 border border-gray-200">
            <AvatarImage src="/abstract-geometric-shapes.png" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
