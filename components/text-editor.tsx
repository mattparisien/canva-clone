"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from "lucide-react"

interface TextEditorProps {
  content: string
  fontSize?: number
  fontFamily?: string
  isSelected: boolean
  isNew?: boolean
  onChange: (content: string) => void
  onFontSizeChange: (fontSize: number) => void
  onFontFamilyChange: (fontFamily: string) => void
  onEditingStart?: () => void
}

export function TextEditor({
  content,
  fontSize = 24,
  fontFamily = "Inter",
  isSelected,
  isNew = false,
  onChange,
  onFontSizeChange,
  onFontFamilyChange,
  onEditingStart,
}: TextEditorProps) {
  const [isEditing, setIsEditing] = useState(isNew)
  const editorRef = useRef<HTMLDivElement>(null)

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72]
  const fontFamilies = [
    "Inter",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
    "Comic Sans MS",
    "Impact",
  ]

  // Handle double click to enter edit mode
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    startEditing()
  }

  // Start editing mode
  const startEditing = () => {
    setIsEditing(true)
    if (onEditingStart) {
      onEditingStart()
    }
  }

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerText)
    }
  }

  // Focus the editor when entering edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus()

      // Set cursor at the end of text
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)

      // Select all text if it's a new element
      if (isNew) {
        range.selectNodeContents(editorRef.current)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }, [isEditing, isNew])

  // Exit edit mode when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setIsEditing(false)
      }
    }

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEditing])

  return (
    <div className="flex h-full w-full items-center justify-center">
      {isSelected && !isEditing && (
        <div className="absolute -top-12 left-0 z-10 flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-medium">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex h-8 items-center gap-1 text-xs font-medium">
                <span>{fontSize}px</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
              {fontSizes.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => onFontSizeChange(size)}
                  className={fontSize === size ? "bg-primary-50 font-medium text-primary-700" : ""}
                >
                  {size}px
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-gray-200" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex h-8 items-center gap-1 text-xs font-medium">
                <span>{fontFamily}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
              {fontFamilies.map((font) => (
                <DropdownMenuItem
                  key={font}
                  onClick={() => onFontFamilyChange(font)}
                  style={{ fontFamily: font }}
                  className={fontFamily === font ? "bg-primary-50 font-medium text-primary-700" : ""}
                >
                  {font}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
              <Underline className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onInput={handleContentChange}
        onBlur={() => setIsEditing(false)}
        className="h-full w-full outline-none text-center"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          cursor: isEditing ? "text" : "inherit",
          userSelect: isEditing ? "text" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: "1.2",
          wordBreak: "break-word",
          overflow: "hidden",
          width: "100%",
          height: "100%",
        }}
      >
        {content}
      </div>
    </div>
  )
}
