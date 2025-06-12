import Image from "next/image";
import classNames from "classnames";
import { ReactNode } from "react";
import { getAspectRatioClass, getAspectRatioStyle, type Dimensions } from "@/lib/utils/aspectRatio";

interface CardMediaProps {
    image?: {
        src: string;
        alt: string;
    };
    selected: boolean;
    children?: ReactNode;
    dimensions?: Dimensions;
}

export function CardMedia({ image, selected, children, dimensions }: CardMediaProps) {
    const aspectRatioClass = getAspectRatioClass(dimensions);
    const aspectRatioStyle = getAspectRatioStyle(dimensions);
    
    return (
        <div 
            className={classNames("relative bg-gray-100 overflow-hidden rounded-lg group-hover:bg-gray-200 transition-colors duration-200 border-2", aspectRatioClass, {
                'border-gray-100 hover:border-gray-200': !selected,
                'border-primary': selected,
            })}
            style={aspectRatioStyle}
        >
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
            {children}
        </div>
    );
}