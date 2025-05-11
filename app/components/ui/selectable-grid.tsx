import React, { Children, ReactElement, cloneElement, useState } from 'react';
import { Check } from 'lucide-react';

interface SelectableGridItemProps<T> {
    item: T;
    isSelected?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

export function SelectableGrid<T>({
    children,
    onSelect,
    initialSelectedItems = [],
}: {
    children: React.ReactNode;
    onSelect?: (item: T) => void;
    initialSelectedItems?: T[];
}) {
    const [selectedItems, setSelectedItems] = useState<T[]>(initialSelectedItems);

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

    return (
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
                                onClick: () => handleSelect(item),
                            }
                        );
                    }
                }
                return child;
            })}
        </div>
    );
}

export function SelectableGridItem<T>({
    item,
    isSelected,
    onClick,
    children,
}: SelectableGridItemProps<T>) {
    const [isHovered, setIsHovered] = useState(false);
    const [isCheckmarkHovering, setIsCheckmarkHovering] = useState(false);

    return (
        <div
            onClick={onClick}
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
                        onClick && onClick();
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