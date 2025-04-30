/* --------------------------------------------------------------
   TextEditor.tsx
   A lightweight, fully-controlled content-editable text editor
   with automatic height that *shrinks and grows* with its content.
   -------------------------------------------------------------- */
   "use client";

   import type React from "react";
   import { useState, useEffect, useRef, useLayoutEffect } from "react";
   
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
     textAlign?: "left" | "center" | "right" | "justify";
     onTextAlignChange?: (align: "left" | "center" | "right" | "justify") => void;
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
     onHeightChange,
     textAlign = "center", // default to center
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
        Enter editing mode on double-click
        ---------------------------------------------------------------- */
     const startEditing = () => {
       onEditingStart?.();
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
     }, [localContent, fontSize, fontFamily, textAlign]);
   
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
       cursor: isEditing ? "text" : "grab",
     };
   
     /* ----------------------------------------------------------------
        Render
        ---------------------------------------------------------------- */
     return (
       <div className="flex w-full items-center justify-center">
         {isEditing ? (
           <div
             ref={editorRef}
             className="w-full outline-none"
             style={baseStyle}
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
