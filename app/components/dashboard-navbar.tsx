"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Button } from "@/app/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { useAuth } from "@/app/lib/context/auth-context"
import { Bell, HelpCircle, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function DashboardNavbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/signin'); // Redirect to sign-in page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <div className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center mr-6 group">
          <div className="flex items-center">
            <div className="w-10 h-10 mr-3 rounded-xl bg-gradient-to-r from-[#2ec4e6] to-[#7c3aed] flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <svg
                width="22"
                height="22"
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
            <span className="font-bold text-xl tracking-tight">Canvas</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6 ml-6">
          <a href="#" className="text-primary font-medium">Home</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Templates</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Recent</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Shared</a>
        </nav>

        {/* Center search */}
        <div className={`flex-1 flex justify-center transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className={`h-4 w-4 transition-colors duration-300 ${isSearchFocused ? 'text-primary' : 'text-gray-400'}`} />
            </div>
            <input
              type="search"
              placeholder="Search presentations..."
              className="w-full pl-10 py-2 px-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        {/* User menu */}
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-primary hover:bg-gray-100">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex rounded-full border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors">
            <span className="text-sm font-medium">Upgrade</span>
            <span className="ml-1 bg-gradient-to-r from-[#2ec4e6] to-[#7c3aed] text-transparent bg-clip-text font-semibold">Pro</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-white hover:ring-primary transition-all">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="bg-gradient-to-r from-[#2ec4e6] to-[#7c3aed] text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'MP'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback className="bg-gradient-to-r from-[#2ec4e6] to-[#7c3aed] text-white">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'MP'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name || 'Matt Parisien'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'matt@example.com'}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-md">Settings</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-md">Billing</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-md">Templates</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer rounded-md"
                onClick={handleLogout}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}