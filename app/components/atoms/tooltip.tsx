"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@utils/utils"

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip         = TooltipPrimitive.Root
export const TooltipTrigger  = TooltipPrimitive.Trigger

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}           // tooltip above trigger ⇒ arrow on bottom
      className={cn(
        // removed `overflow-hidden` so the arrow isn’t clipped during animation
        "z-50 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white shadow-md",
        "animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    >
      {children}
      {/* Arrow inherits transform/opacity from the parent, so it fades & scales in sync */}
      <TooltipPrimitive.Arrow
        width={10}
        height={5}
        className="fill-gray-800 drop-shadow-sm" // stroke gives same 1-px border
      />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName
