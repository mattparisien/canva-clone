import { Element as CanvasElement } from "@/lib/types/canvas";
import { memo } from "react";

// Fix the import paths - this is likely the source of the error
// Make sure these paths correctly point to where your element components are located
import { ArrowElement } from "../elements/ArrowElement";
import { CircleElement } from "../elements/CircleElement";
import { LineElement } from "../elements/LineElement";
import { RectangleElement } from "../elements/RectangleElement";
import { TextElement } from "../elements/TextElement";

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
    // Optional drag handlers for alignment guides
    onDragStart?: () => void;
    onDrag?: (alignments: { horizontal: number[], vertical: number[] }) => void;
    onDragEnd?: () => void;
    allElements?: CanvasElement[];
    canvasWidth?: number;
    canvasHeight?: number;
}

const ElementRenderer = memo(({
    element,
    isSelected,
    textEditorKey,
    updateElement,
    clearNewElementFlag,
    handleHeightChange,
    handleTextAlignChange,
    isEditMode,
}: ElementRendererProps) => {
    // Use a simple switch to route to the appropriate component
    switch (element.type) {
        case "text":
            return (
                <TextElement
                    element={element}
                    isSelected={isSelected}
                    textEditorKey={textEditorKey}
                    updateElement={updateElement}
                    clearNewElementFlag={clearNewElementFlag}
                    handleHeightChange={handleHeightChange}
                    handleTextAlignChange={handleTextAlignChange}
                    isEditMode={isEditMode}
                />
            );
        case "rectangle":
            return <RectangleElement element={element} />;
        case "circle":
            return <CircleElement element={element} />;
        case "line":
            return <LineElement element={element} />;
        case "arrow":
            return <ArrowElement element={element} />;
        default:
            return null;
    }
});

ElementRenderer.displayName = 'ElementRenderer';
export default ElementRenderer;