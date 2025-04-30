/* --------------------------------------------------------------
   TextEditor.tsx
   A lightweight, fully‑controlled content‑editable text editor.
   -------------------------------------------------------------- */
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */
interface TextEditorProps {
  /** The source of truth for the text shown in the editor */
  content: string;
  /** Font‑size in px (default: 36) */
  fontSize?: number;
  /** Font‑family for the text (default: Inter) */
  fontFamily?: string;
  /** Whether the surrounding element is currently selected */
  isSelected: boolean;
  /** If true the editor starts in editing mode */
  isNew?: boolean;
  /** Propagates content changes to the parent */
  onChange: (content: string) => void;
  /** Propagates font‑size changes to the parent */
  onFontSizeChange: (fontSize: number) => void;
  /** Propagates font‑family changes to the parent */
  onFontFamilyChange: (fontFamily: string) => void;
  /** Notifies the parent the user began editing */
  onEditingStart?: () => void;
}

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */
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

  /* ----------------------------------------------------------------
     Enter editing mode on double‑click
     ---------------------------------------------------------------- */
  const startEditing = () => {
    if (onEditingStart) onEditingStart();
    setIsEditing(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startEditing();
  };

  /* ----------------------------------------------------------------
     Handle user typing inside the contentEditable div
     ---------------------------------------------------------------- */
  const handleInput: React.FormEventHandler<HTMLDivElement> = () => {
    if (!editorRef.current) return;
    const newValue = editorRef.current.innerText;
    setLocalContent(newValue);
    onChange(newValue);
  };

  /* ----------------------------------------------------------------
     Focus the editor the moment we switch to editing mode.
     We *do not* select all text again after every keystroke.
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
     Exit editing when clicking anywhere outside the editor
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
     Common style object shared by read‑only and edit states
     ---------------------------------------------------------------- */
  const baseStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily,
    whiteSpace: "normal",
    lineHeight: 1.2,
    wordBreak: "break-word",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    padding: 0,
    boxSizing: "border-box",
    direction: "ltr",
    textAlign: "center",
  };

  /* ----------------------------------------------------------------
     Render
     ---------------------------------------------------------------- */
  return (
    <div className="flex h-full w-full items-center justify-center">
      {isEditing ? (
        <div
          ref={editorRef}
          className="h-full w-full outline-none text-center"
          style={{ ...baseStyle, cursor: "text" }}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <div
          className="h-full w-full outline-none text-center"
          style={{ ...baseStyle, cursor: "grab", userSelect: "none" }}
          onDoubleClick={handleDoubleClick}
        >
          {localContent}
        </div>
      )}
    </div>
  );
}
