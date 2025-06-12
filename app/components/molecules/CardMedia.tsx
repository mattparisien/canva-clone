import { getAspectRatioClass, getScaleForAspectRatio } from "@/lib/utils/aspectRatio";
import { Dimensions } from "@canva-clone/shared-types/dist/design/hierarchical";
import classNames from "classnames";
import Image from "next/image";
import { ReactNode } from "react";

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



    // Always use aspect-video for the container regardless of dimensions
    return (
        <div
            className={classNames("relative bg-gray-100 overflow-hidden rounded-lg group-hover:bg-gray-200 transition-colors duration-200 border-2 aspect-video", {
                'border-gray-100 hover:border-gray-200': !selected,
                'border-primary': selected,
            })}
        >
            {image && (
                <div className="w-full h-full absolute flex items-center justify-center">
                    <div className={`${getAspectRatioClass(dimensions)} ${getScaleForAspectRatio(dimensions)} relative shadow-md`}>
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}