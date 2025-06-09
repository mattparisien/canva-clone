import { cn } from "@/lib/utils/utils";
import * as React from "react";

export interface TextStyleCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TextStyleCard({ className, ...props }: TextStyleCardProps) {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 ease-in-out hover:border-brand-blue/30 hover:shadow-[0_2px_12px_rgba(30,136,229,0.1)]",
        className
      )}
      {...props}
    />
  );
}
