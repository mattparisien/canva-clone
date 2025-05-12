import { Button } from "./button";
import { Card } from "./card";
import { useState } from "react";
import CheckmarkIcon from "./checkmark-icon";
import classNames from "classnames";
import { useSelection } from "@lib/context/selection-context";
import Image from "next/image";

interface SelectableCardProps {
    id: string; // Add id prop for identification
    image: {
        src: string;
        alt: string;
    } | undefined,
    title: string;
    subtitleLeft?: string;
    subtitleRight?: string;
    onClick: () => void;
    onSelect?: (id: string, isSelected: boolean) => void; // Updated callback
}

export function SelectableCard({
    id,
    image,
    title,
    subtitleLeft,
    subtitleRight,
    onClick,
    onSelect,
}: SelectableCardProps) {
    const { isSelected, toggleSelection } = useSelection();
    const [isHovered, setIsHovered] = useState(false);
    const [isCheckmarkHovering, setIsCheckmarkHovering] = useState(false);

    const selected = isSelected(id);

    return (
        <Card
            className="cursor-pointer overflow-hidden group transition-all h-full"
            onClick={() => {
                onClick?.()
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
                <h3 className="font-medium text-gray-900 truncate transition-colors duration-200">
                    {title}
                </h3>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{subtitleLeft}</span>
                    <span className="text-xs text-gray-500">
                        {subtitleRight}
                    </span>
                </div>
            </div>
        </Card >
    )
}