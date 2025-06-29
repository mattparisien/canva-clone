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
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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
  /** Propagates content changes to the parent */
  onChange: (content: string) => void;
  /** Sends the actual pixel height of the node to the parent */
  onHeightChange?: (height: number) => void;
  textAlign?: TextAlignment;
  /** Text formatting options */
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
  isStrikethrough?: boolean;
  /** Text color */
  textColor?: string;
  /** Whether the editor is in editable mode */
  isEditable: boolean;
  /** Notifies the parent when editing should end */
  onEditingEnd?: () => void;
}

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */
export function TextEditor({
  content,
  fontSize = DEFAULT_FONT_SIZE,
  fontFamily = "Inter",
  isSelected,
  onChange,
  onHeightChange,
  textAlign = DEFAULT_TEXT_ALIGN,
  isBold = false,
  isItalic = false,
  isUnderlined = false,
  isStrikethrough = false,
  textColor = "#000000",
  isEditable = false,
  onEditingEnd,
}: TextEditorProps) {
  /* ----------------------------------------------------------------
     Local state & refs
     ---------------------------------------------------------------- */
  const [localContent, setLocalContent] = useState<string>(content);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Debounced callbacks for performance
  const debouncedOnChange = useRef<NodeJS.Timeout | null>(null);
  const debouncedHeightChange = useRef<NodeJS.Timeout | null>(null);

  /* ----------------------------------------------------------------
     Sync incoming `content` prop → local state when not editing
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isEditable) {
      setLocalContent(content);
    }
  }, [content, isEditable]);

  // Remove commented out code
  
  /* ----------------------------------------------------------------
     Debounced functions for performance
     ---------------------------------------------------------------- */
  const updateContentDebounced = useCallback((newValue: string) => {
    if (debouncedOnChange.current) {
      clearTimeout(debouncedOnChange.current);
    }
    debouncedOnChange.current = setTimeout(() => {
      onChange(newValue);
    }, 150);
  }, [onChange]);

  const updateHeightDebounced = useCallback(() => {
    if (!onHeightChange) return;
    
    if (debouncedHeightChange.current) {
      clearTimeout(debouncedHeightChange.current);
    }
    debouncedHeightChange.current = setTimeout(() => {
      if (!editorRef.current) return;
      const newHeight = editorRef.current.scrollHeight;
      onHeightChange(newHeight);
    }, 100);
  }, [onHeightChange]);

  /* ----------------------------------------------------------------
     Handle user typing inside the contentEditable div
     ---------------------------------------------------------------- */
  const handleInput: React.FormEventHandler<HTMLDivElement> = useCallback(() => {
    if (!editorRef.current) return;

    // Update local content immediately for responsive UI
    const newValue = editorRef.current.innerText;
    setLocalContent(newValue);
    
    // Debounce the expensive operations
    updateContentDebounced(newValue);
    updateHeightDebounced();
  }, [updateContentDebounced, updateHeightDebounced]);

  /* ----------------------------------------------------------------
     Focus the editor when switching to edit mode
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isEditable || !editorRef.current) return;

    // Push the latest localContent into the DOM (once) before focus
    editorRef.current.innerText = localContent;
    editorRef.current.focus();

    // Select all text only on the very first focus event
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [isEditable]);

  /* ----------------------------------------------------------------
     Recalculate and report height on style changes (not during editing)
     ---------------------------------------------------------------- */
  useLayoutEffect(() => {
    // Skip height calculation during editing to avoid performance issues
    if (isEditable || !editorRef.current || !onHeightChange) return;
    
    const newHeight = editorRef.current.scrollHeight;
    onHeightChange(newHeight);
  }, [fontSize, fontFamily, textAlign, isBold, isItalic, isUnderlined, isStrikethrough, textColor, isEditable, onHeightChange]);

  /* ----------------------------------------------------------------
     Common style object shared by read-only and edit states
     ---------------------------------------------------------------- */
  const baseStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily,
    whiteSpace: "normal",
    lineHeight: 1.2,
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
    color: textColor,
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
    color: textColor,
    padding: "4px", // Add padding to match the measuring function
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    position: "relative",
    zIndex: 0,
  } as const;

  /* ----------------------------------------------------------------
     Handle ending edit mode
     ---------------------------------------------------------------- */
  const handleBlur = useCallback(() => {
    if (onEditingEnd) {
      onEditingEnd();
    }
  }, [onEditingEnd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape" && onEditingEnd) {
      e.preventDefault();
      onEditingEnd();
    }
  }, [onEditingEnd]);

  /* ----------------------------------------------------------------
     Cleanup timeouts on unmount
     ---------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (debouncedOnChange.current) {
        clearTimeout(debouncedOnChange.current);
      }
      if (debouncedHeightChange.current) {
        clearTimeout(debouncedHeightChange.current);
      }
    };
  }, []);

  /* ----------------------------------------------------------------
     Render
     ---------------------------------------------------------------- */
  return (
    <div className="flex w-full items-center justify-center">
      {isEditable ? (
        <div
          ref={editorRef}
          className="w-full outline-none"
          style={editorStyles}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div
          className="w-full select-none outline-none"
          style={baseStyle}
        >
          {localContent}
        </div>
      )}
    </div>
  );
}
