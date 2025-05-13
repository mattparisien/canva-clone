import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

interface EditableTitleProps {
    id: string;
    title: string;
    onTitleChange?: (id: string, newTitle: string) => void;
}

export function EditableTitle({ id, title, onTitleChange }: EditableTitleProps) {
    const [isTitleHovered, setIsTitleHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    // Add local title state to display optimistically
    const [localTitle, setLocalTitle] = useState(title);
    const [editedTitle, setEditedTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [titleWidth, setTitleWidth] = useState<number | null>(null);

    // Measure title element width to match input width
    useEffect(() => {
        if (titleRef.current && !isEditing) {
            setTitleWidth(titleRef.current.clientWidth);
        }
    }, [localTitle, isEditing]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Update edited title and local title if the original title changes from props
    useEffect(() => {
        setEditedTitle(title);
        setLocalTitle(title);
    }, [title]);

    const handleTitleClick = (e: React.MouseEvent) => {
        if (onTitleChange) {
            e.stopPropagation();
            setIsEditing(true);
        }
    };

    const handleTitleSubmit = () => {
        if (editedTitle.trim() !== "") {
            // Update local title immediately for better UX
            setLocalTitle(editedTitle);
            
            // Only call the API if the title actually changed
            if (editedTitle !== title) {
                onTitleChange?.(id, editedTitle);
            }
        } else {
            // If empty, revert to the original title
            setEditedTitle(localTitle);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleSubmit();
        } else if (e.key === "Escape") {
            setEditedTitle(localTitle); // Reset to current local title
            setIsEditing(false);
        }
    };

    // Handle clicks outside of the editing area
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isEditing && inputRef.current && !inputRef.current.contains(e.target as Node)) {
                handleTitleSubmit();
            }
        };

        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing, editedTitle, localTitle]);

    return (
        <div 
            className="relative flex items-center min-h-[1.5rem]"
            onMouseEnter={() => setIsTitleHovered(true)}
            onMouseLeave={() => setIsTitleHovered(false)}
        >
            <div className="flex items-center justify-between w-full">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleTitleSubmit}
                        style={{ 
                            width: titleWidth ? `${titleWidth + 4}px` : '100%',
                            minWidth: '80%' 
                        }}
                        className="font-medium text-gray-900 outline-none border-b border-primary px-0 py-0 m-0 h-[1.5rem] focus:ring-0 box-border transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <h3 
                        ref={titleRef}
                        className="font-medium text-gray-900 truncate transition-colors duration-200 flex-1 cursor-pointer h-[1.5rem] py-0 m-0 box-border"
                        onClick={handleTitleClick}
                    >
                        {localTitle}
                    </h3>
                )}
                
                {onTitleChange && isTitleHovered && !isEditing && (
                    <button 
                        onClick={handleTitleClick}
                        className="ml-2 text-gray-600 hover:text-black transition-colors flex-shrink-0"
                        aria-label="Edit title"
                    >
                        <Pencil size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}