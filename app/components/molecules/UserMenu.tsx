"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@components/atoms/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@components/atoms/dropdown-menu"
import Link from "next/link"
import React from "react"

export interface UserMenuProps {
  user?: {
    name?: string
    email?: string
    image?: string
  }
  onLogout?: () => void
  menuItems?: Array<{
    label: string
    href?: string
    onClick?: () => void
  }>
  avatarSize?: string
  className?: string
}

export function UserMenu({
  user,
  onLogout,
  menuItems = [
    { label: "Profile", href: "/profile" },
    { label: "Settings" },
    { label: "Billing" },
    { label: "Templates" },
  ],
  avatarSize = "h-9 w-9",
  className = ""
}: UserMenuProps) {
  const getInitials = (name?: string) => {
    return name?.split(' ').map(n => n[0]).join('') || 'U'
  }

  return (
    <div className={`flex items-center ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className={`${avatarSize} cursor-pointer overflow-visible ring-offset-1 ring-offset-white`}>
            <div className="absolute inset-0 rounded-full ring-1 ring-gray-200 hover:ring-gray-300 transition-colors duration-200"></div>
            <AvatarImage
              src={user?.image || "/placeholder-user.jpg"}
              alt={user?.name || "User"}
              className="rounded-full"
            />
            <AvatarFallback className="bg-gray-100 text-gray-600">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 rounded-xl">
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage
                src={user?.image || "/placeholder-user.jpg"}
                alt={user?.name || "User"}
              />
              <AvatarFallback className="bg-gray-100 text-gray-600 border border-gray-200">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                {...(item.href ? { asChild: true } : { onClick: item.onClick })}
              >
                {item.href ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
          
          {onLogout && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={onLogout}
              >
                Log out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
