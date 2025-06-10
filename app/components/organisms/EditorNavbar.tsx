"use client"

import AvatarWithFallback from "@/components/atoms/avatar-with-fallback"
import { Button } from "@components/atoms/button"
import { ArrowLeft, ArrowRight, ChevronDown, Save, Share2, Edit, Eye } from "lucide-react"
import useEditorStore from "@lib/stores/useEditorStore"
import { Popover, PopoverContent, PopoverTrigger } from "@components/atoms/popover"
import { useCallback, useState, KeyboardEvent, useRef, useEffect } from "react"

export default function EditorNavbar() {
  const saveDesign = useEditorStore(state => state.saveDesign)
  const isDesignSaved = useEditorStore(state => state.isDesignSaved)
  const isSaving = useEditorStore(state => state.isSaving)
  const toggleEditMode = useEditorStore(state => state.toggleEditMode)
  const isEditMode = useEditorStore(state => state.isEditMode)
  const designName = useEditorStore(state => state.designName)
  const renameDesign = useEditorStore(state => state.renameDesign)
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
    <div className="flex h-header z-header sticky items-center px-4 shadow bg-gradient-to-r from-brand-blue via-brand-blue/90 to-brand-teal border-b border-[rgba(255,255,255,0.1)]" data-navbar>
      {/* Left Section */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-medium rounded-lg">
          File
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 active:bg-white/20 font-medium flex items-center gap-1 rounded-lg"
        >
          <span>Resize</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 font-medium flex items-center gap-1 rounded-lg"
              aria-haspopup="true"
              aria-expanded={isPopoverOpen}
            >
              {isEditMode ? (
                <Edit className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Eye className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>{isEditMode ? "Editing" : "Viewing"}</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-0 shadow-lg rounded-lg border border-gray-100"
            align="start"
            alignOffset={0}
            role="menu"
            sideOffset={5}
          >
            <div className="py-1.5">
              <button 
                className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                  isEditMode ? 'bg-brand-blue-light/10' : 'hover:bg-gray-50'
                }`}
                onClick={setEditingMode}
                role="menuitem"
                aria-selected={isEditMode}
              >
                <div className={`p-1.5 rounded-full ${
                  isEditMode ? 'bg-brand-blue-light text-brand-blue' : 'bg-gray-100 text-gray-500'
                } flex-shrink-0`}>
                  <Edit className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isEditMode ? 'text-brand-blue' : 'text-gray-700'}`}>Editing</div>
                  <div className="text-xs text-gray-500">Make changes to your design</div>
                </div>
                {isEditMode && <div className="text-brand-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>}
              </button>
              
              <button 
                className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                  !isEditMode ? 'bg-brand-blue-light/10' : 'hover:bg-gray-50'
                }`}
                onClick={setViewingMode}
                role="menuitem"
                aria-selected={!isEditMode}
              >
                <div className={`p-1.5 rounded-full ${
                  !isEditMode ? 'bg-brand-blue-light text-brand-blue' : 'bg-gray-100 text-gray-500'
                } flex-shrink-0`}>
                  <Eye className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${!isEditMode ? 'text-brand-blue' : 'text-gray-700'}`}>Viewing</div>
                  <div className="text-xs text-gray-500">Preview in read-only mode</div>
                </div>
                {!isEditMode && <div className="text-brand-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>}
              </button>
            </div>
          </PopoverContent>
        </Popover>
        <div className="h-5 w-px bg-white/20 mx-1"></div>
        <div className="flex items-center gap-0.5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 h-7 w-7 rounded-lg" 
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 h-7 w-7 rounded-lg" 
            aria-label="Redo"
            title="Redo (Ctrl+Y)"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${isDesignSaved ? "text-white" : "text-yellow-300"} hover:bg-white/10 h-7 w-7 rounded-lg relative`} 
            onClick={saveDesign} 
            title="Save design (Ctrl/⌘+S)" 
            disabled={isSaving} 
            aria-label="Save Design"
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
              </div>
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Center Section - Design Title */}
      <div className="flex-1 flex justify-center">
        {editingName ? (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={saveNameChanges}
              className="px-4 py-1.5 rounded-md bg-white text-gray-800 outline-none border-2 border-brand-blue min-w-[200px] text-center text-sm font-medium shadow-md"
              placeholder="Enter design name"
            />
            <div className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
        ) : (
          <div className="relative">
            <div 
              onClick={startEditing}
              className="px-4 py-1.5 rounded-md bg-white/10 text-white cursor-pointer hover:bg-white/15 transition-all truncate max-w-[150px] md:max-w-[300px] flex items-center gap-2 text-sm font-medium"
            >
              {designName}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-70">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg h-8 flex items-center gap-2 shadow-sm"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="font-medium text-sm">Share</span>
        </Button>
        
        <div className="h-7 w-px bg-white/20 mx-0.5"></div>
        
        <AvatarWithFallback
          name="MP"
          className="h-8 w-8 border border-white/20 bg-brand-blue-dark text-white shadow-sm hover:shadow transition-shadow cursor-pointer"
        />
      </div>
    </div>
  )
}
