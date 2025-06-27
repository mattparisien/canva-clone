import Image from "next/image";
import classNames from "classnames";
import { ReactNode } from "react";

interface CardMediaProps {
    image?: {
        src: string;
        alt: string;
    };
    selected: boolean;
    children?: ReactNode;
}

export function CardMedia({ image, selected, children }: CardMediaProps) {
    return (
        <div className={classNames("relative aspect-video p-4 bg-gray-100 overflow-hidden rounded-lg group-hover:bg-gray-200 transition-colors duration-200 border-2", {
            'border-gray-100 hover:border-gray-200': !selected,
            'border-primary': selected,
        })}>
            {image && (
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="w-full h-full object-contain shadow-md p-4"
                    />
            )}
            {children}
        </div>
    );
}