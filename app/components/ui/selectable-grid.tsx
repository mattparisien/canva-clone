import React, { Children, ReactElement, cloneElement, useState } from 'react';

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

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative border-2 ${isSelected 
                ? 'border-primary bg-blue-50' 
                : 'border-transparent hover:bg-gray-50'
            } p-4 transition-all duration-200 rounded-xl cursor-pointer`}
        >
            <div 
                className={`absolute left-3 top-3 z-10 transition-opacity ${isSelected || isHovered ? 'opacity-100' : 'opacity-0'}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick && onClick();
                }}
            >
                <div className={`h-5 w-5 rounded-md flex items-center justify-center ${isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-white border border-gray-200'}`}
                >
                    {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}