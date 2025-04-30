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
    <div className="flex h-14 items-center px-4 shadow bg-gradient-to-r from-[#2ec4e6] via-[#5e60ce] to-[#7c3aed] border-b border-[#e0e7ef]">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="ml-4 flex items-center">
          <img src="/abstract-logo.png" alt="Logo" className="h-9 w-9 rounded shadow-md bg-white" />
        </div>
      </div>
      <div className="ml-6 flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="h-10 rounded-lg border-none bg-white/80 px-4 text-lg font-semibold text-gray-900 shadow focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all"
          />
        </div>
        <div className="h-6 w-px bg-white/30 mx-4"></div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${canUndo ? "text-white" : "text-white/50"} hover:bg-white/10 rounded-full`}
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
                className={`${canRedo ? "text-white" : "text-white/50"} hover:bg-white/10 rounded-full`}
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
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
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
        <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full">
          <Download className="mr-2 h-4 w-4" />
          <span>Download</span>
        </Button>

        <Button className="bg-white/20 hover:bg-white/30 text-white rounded-full">
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </Button>

        <div className="ml-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <Settings className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <Avatar className="h-8 w-8 border border-white/30">
            <AvatarImage src="/abstract-geometric-shapes.png" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
