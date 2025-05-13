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
    const [editedTitle, setEditedTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Update edited title if the original title changes
    useEffect(() => {
        setEditedTitle(title);
    }, [title]);

    const handleTitleClick = (e: React.MouseEvent) => {
        if (onTitleChange) {
            e.stopPropagation();
            setIsEditing(true);
        }
    };

    const handleTitleSubmit = () => {
        if (editedTitle.trim() !== "" && editedTitle !== title) {
            onTitleChange?.(id, editedTitle);
        } else {
            setEditedTitle(title); // Reset to original if empty
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleSubmit();
        } else if (e.key === "Escape") {
            setEditedTitle(title); // Reset to original
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
    }, [isEditing, editedTitle, title]);

    return (
        <div 
            className="relative flex items-center"
            onMouseEnter={() => setIsTitleHovered(true)}
            onMouseLeave={() => setIsTitleHovered(false)}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleTitleSubmit}
                    className="w-full font-medium text-gray-900 border-b border-primary outline-none px-1 py-0.5 focus:ring-0"
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <div className="flex items-center justify-between w-full">
                    <h3 
                        className="font-medium text-gray-900 truncate transition-colors duration-200 flex-1"
                        onClick={handleTitleClick}
                    >
                        {title}
                    </h3>
                    {onTitleChange && isTitleHovered && (
                        <button 
                            onClick={handleTitleClick}
                            className="ml-2 text-gray-400 hover:text-primary transition-colors"
                            aria-label="Edit title"
                        >
                            <Pencil size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}