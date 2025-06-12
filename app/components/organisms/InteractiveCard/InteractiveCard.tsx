import { Card } from "@components/atoms/card";
import { useState } from "react";
import { useSelection } from "@lib/context/selection-context";
import { SelectionCheckbox, CardMedia } from "@components/molecules";
import { EditableTitle } from "./EditableTitle";
import type { Dimensions } from "@/lib/utils/aspectRatio";

interface InteractiveCardProps {
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
    onTitleChange?: (id: string, newTitle: string) => void;
    children?: React.ReactNode;
    dimensions?: Dimensions;
}

export default function InteractiveCard({
    id,
    image,
    title,
    subtitleLeft,
    subtitleRight,
    onClick,
    onSelect,
    onTitleChange,
    children,
    dimensions,
}: InteractiveCardProps) {


    console.log(dimensions)

    const { isSelected, toggleSelection } = useSelection();
    const [isHovered, setIsHovered] = useState(false);
    const selected = isSelected(id);


    const handleCardClick = () => {
        onClick?.();
    };

    return (
        <Card
            className="relative cursor-pointer overflow-hidden group transition-all h-full"
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardMedia
                image={children ? undefined : image}
                selected={selected}
                dimensions={dimensions}
            >
                {children}
            </CardMedia>

            <div className="py-4 px-1">
                <EditableTitle
                    id={id}
                    title={title}
                    onTitleChange={onTitleChange}
                />
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{subtitleLeft}</span>
                    <span className="text-xs text-gray-500">{subtitleRight}</span>
                </div>
            </div>
            <SelectionCheckbox
                id={id}
                selected={selected}
                visible={selected || isHovered}
                onSelect={(checked) => {
                    toggleSelection(id);
                    onSelect?.(id, checked);
                }}
            />
        </Card>
    );
}
