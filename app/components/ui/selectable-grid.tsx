import React, { Children, ReactElement, cloneElement, useState, useEffect } from 'react';
import { Check, Trash, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface SelectableGridItemProps<T> {
    item: T;
    isSelected?: boolean;
    onSelect?: () => void;
    onClick?: (item: T) => void;
    children: React.ReactNode;
}

interface SelectionPopoverProps<T> {
    selectedItems: T[];
    onClearSelection: () => void;
    onDelete: () => void;
}

export function SelectionPopoverContent<T>({
    selectedItems,
    onClearSelection,
    onDelete
}: SelectionPopoverProps<T>) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2">
                <span className="font-medium">{selectedItems.length} selected</span>
                <button
                    onClick={onClearSelection}
                    className="p-1 rounded-full hover:bg-gray-100"
                    aria-label="Clear selection"
                >
                    <X size={18} className="text-gray-500" />
                </button>
            </div>
            <div className="h-6 w-[1px] bg-gray-200 mx-1" />
            <button
                onClick={onDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md flex items-center gap-1"
                aria-label="Delete selected items"
            >
                <Trash size={18} />
            </button>
        </div>
    );
}

export function SelectableGrid<T>({
    children,
    onSelect,
    initialSelectedItems = [],
    onDelete,
}: {
    children: React.ReactNode;
    onSelect?: (item: T) => void;
    initialSelectedItems?: T[];
    onDelete?: (items: T[]) => void;
}) {
    const [selectedItems, setSelectedItems] = useState<T[]>(initialSelectedItems);
    const [open, setOpen] = useState(false);

    // Update the popover visibility when selection changes
    useEffect(() => {
        setOpen(selectedItems.length > 0);
    }, [selectedItems.length]);

    const handleSelect = (item: T) => {
        setSelectedItems(prev => {
            const isSelected = prev.includes(item);
            const newSelectedItems = isSelected
                ? prev.filter(i => i !== item)
                : [...prev, item];

            // Call external onSelect handler if provided
            if (onSelect) {
                onSelect(item);
            }

            return newSelectedItems;
        });
    };

    const handleClearSelection = () => {
        setSelectedItems([]);
    };

    const handleDelete = () => {
        onDelete?.(selectedItems);
        setSelectedItems([]);
    };

    useEffect(() => {
        console.log(selectedItems, 'selectedItems');
    }, [selectedItems]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        // Type assertion for child props
                        const childProps = child.props as { item?: T };

                        if (childProps.item) {
                            const item = childProps.item;
                            const isSelected = selectedItems.includes(item);

                            return cloneElement(
                                child as ReactElement<SelectableGridItemProps<T>>,
                                {
                                    isSelected,
                                    onSelect: () => handleSelect(item),
                                }
                            );
                        }
                    }
                    return child;
                })}
            </div>

            {/* Using the existing Popover component instead of custom one */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    {/* This is an invisible trigger that is always at the bottom of the screen */}
                    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1" />
                </PopoverTrigger>
                <PopoverContent
                    className="fixed bottom-4 left-1/2 transform -translate-x-1/2 p-2 shadow-lg rounded-lg z-50 flex"
                    align="center"
                    side="top"
                >
                    <SelectionPopoverContent
                        selectedItems={selectedItems}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                    />
                </PopoverContent>
            </Popover>
        </>
    );
}

export function SelectableGridItem<T>({
    item,
    isSelected,
    onClick,
    onSelect,
    children,
}: SelectableGridItemProps<T>) {
    const [isHovered, setIsHovered] = useState(false);
    const [isCheckmarkHovering, setIsCheckmarkHovering] = useState(false);

    return (
        <div
            onClick={e => {
                e.stopPropagation();
                onClick && onClick(item);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative border-2 ${isSelected
                ? 'border-primary bg-blue-50'
                : 'border-transparent hover:bg-gray-50'
                } p-1 transition-all duration-200 rounded-xl cursor-pointer`}
        >
            <div className="relative w-full h-full">
                <div
                    className={`absolute left-0 top-0 z-10 transition-opacity ${isSelected || isHovered ? 'opacity-100' : 'opacity-0'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect?.();
                    }}
                >
                    <div className={`h-6 w-6 rounded-md flex items-center justify-center ${isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white border border-gray-400'}`}
                        onMouseEnter={() => setIsCheckmarkHovering(true)}
                        onMouseLeave={() => setIsCheckmarkHovering(false)}
                    >
                        {(isSelected || isCheckmarkHovering) && (
                            <CheckmarkIcon state={!isSelected ? "hovered" : "selected"} />
                        )}
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}

function CheckmarkIcon({ state = "hovered" }: { state?: "hovered" | "selected" }) {
    return <Check width="100%" height="100%" fill="none" strokeWidth="1.2px" className={`${state === "hovered" ? "text-gray-300" : "text-white"}`} />
}