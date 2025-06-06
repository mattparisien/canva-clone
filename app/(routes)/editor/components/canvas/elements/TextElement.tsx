import { TextEditor } from "../../TextEditor";
import { Element as CanvasElement } from "@/lib/types/canvas.types";

interface TextElementProps {
  element: CanvasElement;
  isSelected: boolean;
  textEditorKey: number;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  clearNewElementFlag: (id: string) => void;
  handleHeightChange: (newHeight: number) => void;
  handleTextAlignChange: (align: "left" | "center" | "right" | "justify") => void;
  isEditMode: boolean;
}

export const TextElement = ({
  element,
  isSelected,
  textEditorKey,
  updateElement,
  clearNewElementFlag,
  handleHeightChange,
  handleTextAlignChange,
  isEditMode
}: TextElementProps) => (
  <div className="w-full h-full text-element">
    <TextEditor
      key={textEditorKey}
      content={element.content || ""}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily}
      isSelected={isSelected}
      isNew={element.isNew}
      onChange={(content) => updateElement(element.id, { content })}
      onFontSizeChange={(fontSize) => updateElement(element.id, { fontSize })}
      onFontFamilyChange={(fontFamily) => updateElement(element.id, { fontFamily })}
      onEditingStart={() => {
        if (element.isNew) {
          clearNewElementFlag(element.id)
        }
      }}
      onHeightChange={handleHeightChange}
      textAlign={element.textAlign || "center"}
      onTextAlignChange={handleTextAlignChange}
      isBold={element.isBold}
      isItalic={element.isItalic}
      isUnderlined={element.isUnderlined}
      isStrikethrough={element.isStrikethrough}
      textColor={element.textColor}
      isEditMode={isEditMode}
      isEditable={element.isEditable || false}
      onEditingEnd={() => updateElement(element.id, { isEditable: false })}
    />
  </div>
);