/* --------------------------------------------------------------
   TextEditor.tsx
   A lightweight, fully-controlled content-editable text editor
   with automatic height that *shrinks and grows* with its content.
   -------------------------------------------------------------- */
"use client";

import {
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGN,
  type TextAlignment
} from "@/lib/constants/editor";
import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */
interface TextEditorProps {
  /** The source of truth for the text shown in the editor */
  content: string;
  /** Font-size in px (default: 36) */
  fontSize?: number;
  /** Font-family for the text (default: Inter) */
  fontFamily?: string;
  /** Whether the surrounding element is currently selected */
  isSelected: boolean;
  /** If true the editor starts in editing mode */
  isNew?: boolean;
  /** Propagates content changes to the parent */
  onChange: (content: string) => void;
  /** Propagates font-size changes to the parent */
  onFontSizeChange: (fontSize: number) => void;
  /** Propagates font-family changes to the parent */
  onFontFamilyChange: (fontFamily: string) => void;
  /** Notifies the parent the user began editing */
  onEditingStart?: () => void;
  /** Sends the actual pixel height of the node to the parent */
  onHeightChange?: (height: number) => void;
  textAlign?: TextAlignment;
  onTextAlignChange?: (align: TextAlignment) => void;
  /** Text formatting options */
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
  isStrikethrough?: boolean;
  /** Edit mode flag */
  isEditMode?: boolean;
}

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */
export function TextEditor({
  content,
  fontSize = DEFAULT_FONT_SIZE,
  fontFamily = "Inter",
  isSelected,
  isNew = false,
  onChange,
  onFontSizeChange,
  onFontFamilyChange,
  onEditingStart,
  onHeightChange,
  textAlign = DEFAULT_TEXT_ALIGN,
  isBold = false,
  isItalic = false,
  isUnderlined = false,
  isStrikethrough = false,
  onTextAlignChange,
  isEditMode = true, // Default to edit mode if not provided
}: TextEditorProps) {
  /* ----------------------------------------------------------------
     Local state & refs
     ---------------------------------------------------------------- */
  const [isEditing, setIsEditing] = useState<boolean>(isNew);
  const [localContent, setLocalContent] = useState<string>(content);
  const editorRef = useRef<HTMLDivElement>(null);

  /* ----------------------------------------------------------------
     Sync incoming `content` prop → local state when not editing
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isEditing) {
      setLocalContent(content);
    }
  }, [content, isEditing]);

  // Exit editing mode when switching to view mode
  useEffect(() => {
    if (!isEditMode && isEditing) {
      setIsEditing(false);
    }
  }, [isEditMode, isEditing]);

  /* ----------------------------------------------------------------
     Enter editing mode on double-click
     ---------------------------------------------------------------- */
  const startEditing = () => {
    // Only allow editing in edit mode
    if (!isEditMode) return;
    
    onEditingStart?.();
    setIsEditing(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only allow editing in edit mode
    if (!isEditMode) return;
    
    e.stopPropagation();
    startEditing();
  };

  /* ----------------------------------------------------------------
     Handle user typing inside the contentEditable div
     ---------------------------------------------------------------- */
  const handleInput: React.FormEventHandler<HTMLDivElement> = () => {
    if (!editorRef.current) return;

    // 1. Update content refs/state
    const newValue = editorRef.current.innerText;
    setLocalContent(newValue);
    onChange(newValue);

    // 2. Measure height *after* the DOM paints
    if (onHeightChange) {
      requestAnimationFrame(() => {
        if (!editorRef.current) return;
        // Reset height to auto to allow shrinking, then read scrollHeight
        editorRef.current.style.height = "auto";
        const newHeight = editorRef.current.scrollHeight;
        onHeightChange(newHeight);
      });
    }
  };

  /* ----------------------------------------------------------------
     Focus the editor when switching to edit mode
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isEditing || !editorRef.current) return;

    // Push the latest localContent into the DOM (once) before focus
    editorRef.current.innerText = localContent;
    editorRef.current.focus();

    // Select all text only on the very first focus event
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [isEditing]);

  /* ----------------------------------------------------------------
     Exit editing when clicking outside the editor
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isEditing) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isEditing]);


  /* ----------------------------------------------------------------
     Recalculate and report height on content or width change
     ---------------------------------------------------------------- */
  useLayoutEffect(() => {
    if (!editorRef.current || !onHeightChange) return;
    // Reset height to auto to allow shrinking, then read scrollHeight
    editorRef.current.style.height = "auto";
    const newHeight = editorRef.current.scrollHeight;
    onHeightChange(newHeight);
  }, [localContent, fontSize, fontFamily, textAlign, isBold, isItalic, isUnderlined, isStrikethrough]);

  /* ----------------------------------------------------------------
     Common style object shared by read-only and edit states
     ---------------------------------------------------------------- */
  const baseStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily,
    whiteSpace: "normal",
    lineHeight: 1.2,
    wordBreak: "break-word",
    overflow: "hidden",
    width: "100%",
    minHeight: "1em",
    padding: 0,
    boxSizing: "border-box",
    direction: "ltr",
    textAlign: textAlign,
    fontWeight: isBold ? "bold" : "normal",
    fontStyle: isItalic ? "italic" : "normal",
    textDecoration: `${isUnderlined ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.trim() || "none",
  };

  // Styles for the editor
  const editorStyles = {
    width: "100%",
    height: "100%",
    outline: "none",
    lineHeight: 1.5, // Increased line height to match the measuring function
    fontSize: `${fontSize}px`,
    fontFamily,
    fontWeight: isBold ? "bold" : "normal",
    fontStyle: isItalic ? "italic" : "normal",
    textDecoration: `${isUnderlined ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.trim() || "none",
    textAlign,
    padding: "4px", // Add padding to match the measuring function
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    position: "relative",
    zIndex: 0,
  } as const;

  /* ----------------------------------------------------------------
     Render
     ---------------------------------------------------------------- */
  return (
    <div className="flex w-full items-center justify-center">
      {isEditing ? (
        <div
          ref={editorRef}
          className="w-full outline-none"
          style={editorStyles}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <div
          className="w-full select-none outline-none"
          style={baseStyle}
          onDoubleClick={handleDoubleClick}
        >
          {localContent}
        </div>
      )}
    </div>
  );
}
