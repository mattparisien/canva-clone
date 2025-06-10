import React from "react";
import Image from "next/image";
import { cn } from "@utils/utils";

interface HeroProps {
  /**
   * Main heading text to display
   */
  heading: string;
  /**
   * Path to the background image
   */
  backgroundImage?: string;
  /**
   * Path to the graphic/icon image
   */
  graphicImage?: string;
  /**
   * Additional custom className
   */
  className?: string;
  /**
   * Additional styles for the container
   */
  style?: React.CSSProperties;
}

export function Hero({
  heading,
  backgroundImage = "/images/backgrounds/hero-bg.jpg",
  graphicImage = "/images/graphics/folder.svg",
  className,
  style,
}: HeroProps) {
  return (
    <div 
      className={cn(
        "w-full h-[190px] relative rounded-lg overflow-hidden flex items-end",
        className
      )}
      style={style}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-8 flex w-full items-center justify-between mb-8">
        <h1 className="text-white text-3xl font-bold">{heading}</h1>
        
   
      </div>
    </div>
  );
}