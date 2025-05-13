import { Button } from "./button";
import { Card } from "./card";
import { useState, useRef, useEffect } from "react";
import CheckmarkIcon from "./checkmark-icon";
import classNames from "classnames";
import { useSelection } from "@lib/context/selection-context";
import Image from "next/image";
import { Pencil } from "lucide-react";

interface SelectableCardProps {
    id: string;
    image?: {
        src: string;
        alt: string;
    },
    title: string;
    subtitleLeft?: string;
    subtitleRight?: string;
    onClick: () => void;
    onSelect?: (id: string, isSelected: boolean) => void;
    onTitleChange?: (id: string, newTitle: string) => void; // New prop for title changes
}

export function SelectableCard({
    id,
    image,
    title,
    subtitleLeft,
    subtitleRight,
    onClick,
    onSelect,
    onTitleChange,
}: SelectableCardProps) {
    const { isSelected, toggleSelection } = useSelection();
    const [isHovered, setIsHovered] = useState(false);
    const [isCheckmarkHovering, setIsCheckmarkHovering] = useState(false);
    const [isTitleHovered, setIsTitleHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = isSelected(id);

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

    const handleCardClick = () => {
        if (!isEditing) {
            onClick?.();
        }
    };

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
    const handleClickOutside = (e: MouseEvent) => {
        if (isEditing && inputRef.current && !inputRef.current.contains(e.target as Node)) {
            handleTitleSubmit();
        }
    };

    useEffect(() => {
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
        <Card
            className="cursor-pointer overflow-hidden group transition-all h-full"
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsTitleHovered(false);
            }}
        >
            <div className={classNames("relative aspect-video bg-gray-100 overflow-hidden rounded-lg group-hover:bg-gray-200 transition-colors duration-200 border-2", {
                'border-gray-100 hover:border-gray-200': !selected,
                'border-primary': selected,
            })}>
                {image && (
                    <div className="w-full h-full scale-[0.8] shadow-md">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div
                    className={`absolute left-2 top-2 z-10 transition-opacity ${selected || isHovered ? 'opacity-100' : 'opacity-0'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(id);
                        onSelect?.(id, !selected);
                    }}
                >
                    <div className={`h-6 w-6 flex items-center justify-center rounded-md ${selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/80 border border-gray-400 shadow-sm'}`}
                        onMouseEnter={() => setIsCheckmarkHovering(true)}
                        onMouseLeave={() => setIsCheckmarkHovering(false)}
                    >
                        {(selected || isCheckmarkHovering) && (
                            <CheckmarkIcon state={!selected ? "hovered" : "selected"} />
                        )}
                    </div>
                </div>
            </div>

            <div className="py-4 px-1">
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
                            <h3 className="font-medium text-gray-900 truncate transition-colors duration-200 flex-1">
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
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{subtitleLeft}</span>
                    <span className="text-xs text-gray-500">
                        {subtitleRight}
                    </span>
                </div>
            </div>
        </Card>
    );
}