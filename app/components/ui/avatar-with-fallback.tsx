"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils/utils"

interface AvatarWithFallbackProps {
  name: string
  src?: string
  className?: string
}

export function AvatarWithFallback({ name, src, className }: AvatarWithFallbackProps) {
  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="bg-gradient-to-br from-brand-blue-light to-brand-teal-light text-white">
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

export default AvatarWithFallback
