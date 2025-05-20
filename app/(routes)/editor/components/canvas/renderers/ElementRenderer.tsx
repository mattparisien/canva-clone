import { Element as CanvasElement } from "@/lib/types/canvas.types";
import { memo } from "react";
import { TextEditor } from "../../TextEditor";

// Define interface for ElementRenderer props
interface ElementRendererProps {
    element: CanvasElement;
    isSelected: boolean;
    textEditorKey: number;
    updateElement: (id: string, updates: Partial<CanvasElement>) => void;
    clearNewElementFlag: (id: string) => void;
    handleHeightChange: (newHeight: number) => void;
    handleTextAlignChange: (align: "left" | "center" | "right" | "justify") => void;
    isEditMode: boolean;
}

const ElementRenderer = memo(({
    element,
    isSelected,
    textEditorKey,
    updateElement,
    clearNewElementFlag,
    handleHeightChange,
    handleTextAlignChange,
    isEditMode
}: ElementRendererProps) => {
    switch (element.type) {
        case "text":
            return (
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
                        isEditMode={isEditMode}
                    />
                </div>
            )
        case "rectangle":
            return (
                <div
                    className="w-full h-full"
                    style={{
                        backgroundColor: element.backgroundColor || "transparent",
                        borderColor: element.borderColor || "transparent",
                        borderWidth: element.borderWidth || 0,
                        borderStyle: element.borderStyle || "solid",
                        transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                    }}
                />
            )
        case "circle":
            return (
                <div
                    className="w-full h-full rounded-full"
                    style={{
                        backgroundColor: element.backgroundColor || "transparent",
                        borderColor: element.borderColor || "transparent",
                        borderWidth: element.borderWidth || 0,
                        borderStyle: element.borderStyle || "solid",
                        transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                    }}
                />
            )
        case "line":
            return (
                <div className="w-full h-full flex items-center">
                    <div
                        className="w-full"
                        style={{
                            height: "0px",
                            borderTopColor: element.borderColor || "#000000",
                            borderTopWidth: element.borderWidth || 2,
                            borderTopStyle: element.borderStyle || "solid",
                            transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                        }}
                    />
                </div>
            )
        case "arrow":
            return (
                <div className="w-full h-full flex items-center relative">
                    <div
                        className="w-full"
                        style={{
                            height: "0px",
                            borderTopColor: element.borderColor || "#000000",
                            borderTopWidth: element.borderWidth || 2,
                            borderTopStyle: element.borderStyle || "solid",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            right: "0",
                            width: "10px",
                            height: "10px",
                            borderRight: `${element.borderWidth || 2}px solid ${element.borderColor || "#000000"}`,
                            borderTop: `${element.borderWidth || 2}px solid ${element.borderColor || "#000000"}`,
                            transform: "rotate(45deg) translateY(-50%)",
                        }}
                    />
                </div>
            )
        default:
            return null
    }
});
ElementRenderer.displayName = 'ElementRenderer';
export default ElementRenderer; 