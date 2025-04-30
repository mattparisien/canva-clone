"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

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
  fontSize = 36,
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
  const [localContent, setLocalContent] = useState(content)

  // Update local content when prop changes
  useEffect(() => {
    setLocalContent(content)
  }, [content])

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

    // We'll select all text when the editor is focused in the useEffect
  }

  // Handle content changes
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerText
      setLocalContent(newContent)
      onChange(newContent)
    }
  }

  // Focus the editor when entering edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      // Set content explicitly
      editorRef.current.innerText = localContent

      // Focus the editor
      editorRef.current.focus()

      // Select all text when entering edit mode
      const range = document.createRange()
      const selection = window.getSelection()

      // Select all content
      range.selectNodeContents(editorRef.current)

      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [isEditing, localContent])

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
      {isEditing ? (
        <div
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning
          onInput={handleContentChange}
          onBlur={() => setIsEditing(false)}
          className="h-full w-full outline-none text-center"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily,
            cursor: "text",
            userSelect: "text",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: "1.2",
            wordBreak: "break-word",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            padding: "0", // Remove padding
            boxSizing: "border-box",
            direction: "ltr",
            transform: "none",
            textAlign: "center",
          }}
        />
      ) : (
        <div
          className="h-full w-full outline-none text-center"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily,
            cursor: "grab",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: "1.2",
            wordBreak: "break-word",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            padding: "0", // Remove padding
            boxSizing: "border-box",
            direction: "ltr",
            transform: "none",
            textAlign: "center",
          }}
          onDoubleClick={handleDoubleClick}
        >
          {localContent}
        </div>
      )}
    </div>
  )
}
