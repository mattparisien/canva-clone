import { useState } from "react";
import CheckmarkIcon from "@components/ui/checkmark-icon";

interface SelectionCheckboxProps {
    id: string;
    selected: boolean;
    visible: boolean;
    onSelect: (checked: boolean) => void;
}

export function SelectionCheckbox({ id, selected, visible, onSelect }: SelectionCheckboxProps) {
    const [isHovering, setIsHovering] = useState(false);
    
    return (
        <div
            className={`absolute left-2 top-2 z-10 transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(!selected);
            }}
        >
            <div className={`h-6 w-6 flex items-center justify-center rounded-md ${selected
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/80 border border-gray-400 shadow-sm'}`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {(selected || isHovering) && (
                    <CheckmarkIcon state={!selected ? "hovered" : "selected"} />
                )}
            </div>
        </div>
    );
}