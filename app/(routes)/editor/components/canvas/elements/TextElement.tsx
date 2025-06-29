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

// Calculate text width based on content and font size
const calculateTextWidth = (content: string, fontSize: number, fontFamily: string = 'Arial'): number => {
  // Create a temporary canvas element to measure text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return content.length * fontSize * 0.6; // Fallback calculation
  
  // Set font properties
  context.font = `${fontSize}px ${fontFamily}`;
  
  // Split content by lines and measure the widest line
  const lines = content.split('\n');
  let maxWidth = 0;
  
  lines.forEach(line => {
    const metrics = context.measureText(line);
    maxWidth = Math.max(maxWidth, metrics.width);
  });
  
  // Add some padding and ensure minimum width
  const calculatedWidth = Math.max(maxWidth + 20, 100);
  
  // Cleanup
  canvas.remove();
  
  return Math.round(calculatedWidth);
};

export const TextElement = ({
  element,
  isSelected,
  textEditorKey,
  updateElement,
  handleHeightChange,
  isEditMode
}: TextElementProps) => {
  
  const handleContentChange = (content: string) => {
    // Check if element has autofit width mode (default behavior)
    const shouldAutoFit = true;
    
    if (shouldAutoFit && element.kind === 'text') {
      // Calculate new width based on content and font size
      const newWidth = calculateTextWidth(
        content, 
        element.fontSize || 16, 
        element.fontFamily || 'Arial'
      );
      
      // Update both content and width
      updateElement(element.id, { 
        content, 
        width: newWidth 
      });
    } else {
      // Just update content for fixed width mode
      updateElement(element.id, { content });
    }
  };

  return (
    <div className="w-full h-full text-element">
      <TextEditor
        key={textEditorKey}
        content={element.content || ""}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        isSelected={isSelected}
        onChange={handleContentChange}
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
};