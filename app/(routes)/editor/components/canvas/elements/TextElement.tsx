import { Element as CanvasElement } from "@/lib/types/canvas";
import { TextEditor } from "../../TextEditor";

interface TextElementProps {
  element: CanvasElement;
  isSelected: boolean;
  textEditorKey: number;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  clearNewElementFlag: (id: string) => void;
  handleHeightChange: (newHeight: number) => void;
  handleTextAlignChange: (align: "left" | "center" | "right") => void;
  isEditMode: boolean;
}

export const TextElement = ({
  element,
  isSelected,
  textEditorKey,
  updateElement,
  handleHeightChange,
  isEditMode
}: TextElementProps) => (
  <div className="w-full h-full text-element">
    <TextEditor
      key={textEditorKey}
      content={element.content || ""}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily}
      isSelected={isSelected}
      onChange={(content) => updateElement(element.id, { content })}
      onHeightChange={handleHeightChange}
      textAlign={element.textAlign || "center"}
      isBold={element.bold}
      isItalic={element.italic}
      isUnderlined={element.underline}
      isStrikethrough={element.isStrikethrough}
      textColor={element.color}
      isEditable={element.isEditable || false}
      onEditingEnd={() => updateElement(element.id, { isEditable: false })}
    />
  </div>
);