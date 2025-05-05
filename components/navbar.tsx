"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, ChevronDown, Save, Share2, Edit, Eye } from "lucide-react"
import { useEditor } from "@/context/editor-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCallback, useState, KeyboardEvent, useRef, useEffect } from "react"

export function Navbar() {
  const { saveDesign, isDesignSaved, isSaving, toggleEditMode, isEditMode, designName, renameDesign } = useEditor()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(designName)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Create mode switching functions
  const setViewingMode = useCallback(() => {
    if (isEditMode) toggleEditMode()
    setIsPopoverOpen(false) // Close the popover
  }, [isEditMode, toggleEditMode])
  
  const setEditingMode = useCallback(() => {
    if (!isEditMode) toggleEditMode()
    setIsPopoverOpen(false) // Close the popover
  }, [isEditMode, toggleEditMode])

  // Handle title editing
  const startEditing = useCallback(() => {
    setEditingName(true)
    setNameValue(designName)
    // Focus the input in the next tick after it's rendered
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }, [designName])

  const saveNameChanges = useCallback(() => {
    if (nameValue.trim() !== '') {
      renameDesign(nameValue)
    } else {
      setNameValue(designName) // Reset to previous name if empty
    }
    setEditingName(false)
  }, [nameValue, designName, renameDesign])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveNameChanges()
    } else if (e.key === 'Escape') {
      setNameValue(designName)
      setEditingName(false)
    }
  }, [saveNameChanges, designName])

  // Update local state when designName changes in context
  useEffect(() => {
    if (!editingName) {
      setNameValue(designName)
    }
  }, [designName, editingName])

  // Handle click outside to save changes
  useEffect(() => {
    if (!editingName) return

    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        saveNameChanges()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingName, saveNameChanges])
  
  return (
    <div className="flex h-14 items-center px-4 shadow bg-gradient-to-r from-[#2ec4e6] via-[#5e60ce] to-[#7c3aed] border-b border-[#e0e7ef]">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-medium">
          File
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 active:bg-white/20 font-medium flex items-center gap-1"
        >
          <span>Resize</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 font-medium flex items-center gap-1"
              aria-haspopup="true"
              aria-expanded={isPopoverOpen}
            >
              <Edit className="h-4 w-4 mr-1" />
              <span>{isEditMode ? "Editing" : "Viewing"}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-0 shadow-lg"
            align="start"
            alignOffset={0}
            role="menu"
          >
            <div className="py-2">
              <button 
                className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                onClick={setEditingMode}
                role="menuitem"
                aria-selected={isEditMode}
              >
                <div className="text-gray-800 p-1.5 rounded-full bg-gray-100 flex-shrink-0">
                  <Edit className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Editing</div>
                  <div className="text-sm text-gray-500">Make changes</div>
                </div>
                {isEditMode && <div className="text-blue-600"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg></div>}
              </button>
              
              <button 
                className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                onClick={setViewingMode}
                role="menuitem"
                aria-selected={!isEditMode}
              >
                <div className="text-gray-800 p-1.5 rounded-full bg-gray-100 flex-shrink-0">
                  <Eye className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Viewing</div>
                  <div className="text-sm text-gray-500">Read-only</div>
                </div>
                {!isEditMode && <div className="text-blue-600"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg></div>}
              </button>
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex items-center ml-2 gap-1">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8" aria-label="Undo">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8" aria-label="Redo">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${isDesignSaved ? "text-white" : "text-yellow-300"} hover:bg-white/10 h-8 w-8 relative`} 
            onClick={saveDesign} 
            title="Save design (Ctrl/⌘+S)" 
            disabled={isSaving} 
            aria-label="Save Design"
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
              </div>
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex-1 flex justify-center">
        {editingName ? (
          <input
            ref={inputRef}
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveNameChanges}
            className="px-4 py-1.5 rounded-md bg-white text-gray-800 outline-none border-2 border-blue-400 min-w-[200px] text-center"
            placeholder="Enter design name"
          />
        ) : (
          <div 
            onClick={startEditing}
            className="px-4 py-1.5 rounded-md bg-white/10 text-white cursor-pointer hover:bg-white/15 transition-colors truncate max-w-[150px] md:max-w-[300px]"
          >
            {designName}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 bg-red-500 text-white">
          <AvatarFallback>MP</AvatarFallback>
        </Avatar>
        {/* <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
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
        </Button> */}
        <Button variant="ghost" size="sm" className="text-white border border-white/30 hover:bg-white/10 flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  )
}
