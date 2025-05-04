"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, ChevronDown, Share2 } from "lucide-react"

export function Navbar() {
  return (
    <div className="flex h-14 items-center px-4 shadow bg-gradient-to-r from-[#2ec4e6] via-[#5e60ce] to-[#7c3aed] border-b border-[#e0e7ef]">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-medium">
          File
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-medium flex items-center gap-1">
          <span>Resize</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-medium flex items-center gap-1">
          <span>Editing</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <div className="flex items-center ml-2 gap-1">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex-1 flex justify-center">
        <div className="px-4 py-1.5 rounded-md bg-white/10 text-white">
          Your paragraph text
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 bg-red-500 text-white">
          <AvatarFallback>MP</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 10V7M12 10V5M16 10V3M5 21L19 21C20.1046 21 21 20.1046 21 19L21 5C21 3.89543 20.1046 3 19 3L5 3C3.89543 3 3 3.89543 3 5L3 19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12H16M8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <Button variant="ghost" size="sm" className="text-white border border-white/30 hover:bg-white/10">
          Present
        </Button>
        <Button variant="ghost" size="sm" className="text-white border border-white/30 hover:bg-white/10 flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  )
}
