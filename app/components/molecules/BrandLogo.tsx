"use client"

import Link from "next/link"

export interface BrandLogoProps {
  href?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

const sizeClasses = {
  sm: {
    container: "w-8 h-8",
    text: "text-lg",
    svg: "20"
  },
  md: {
    container: "w-10 h-10",
    text: "text-xl",
    svg: "22"
  },
  lg: {
    container: "w-12 h-12",
    text: "text-2xl",
    svg: "24"
  }
}

export function BrandLogo({
  href = "/",
  size = "md",
  showText = true,
  className = ""
}: BrandLogoProps) {
  const sizeConfig = sizeClasses[size]
  
  const logoContent = (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeConfig.container} mr-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-teal flex items-center justify-center shadow-md shadow-brand-blue/20 group-hover:shadow-lg group-hover:shadow-brand-blue/30 transition-all duration-300`}>
        <svg
          width={sizeConfig.svg}
          height={sizeConfig.svg}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:scale-110 transition-transform duration-300"
        >
          <path
            d="M8 14H16M8 10H16M8 6H13M13 18H6C5.46957 18 4.96086 17.7893 4.58579 17.4142C4.21071 17.0391 4 16.5304 4 16V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V12C20 12.5304 19.7893 13.0391 19.4142 13.4142C19.0391 13.7893 18.5304 14 18 14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${sizeConfig.text} tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal`}>
          Droip
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="group">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
