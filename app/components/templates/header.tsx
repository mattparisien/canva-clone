"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@components/atoms/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@components/atoms/dropdown-menu";
import { getImageUrlWithSize } from "@lib/api"; // Fixed import path
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define thumbnail size constant for the header
const HEADER_AVATAR_SIZE = {
  thumbnail: { width: 48, height: 48 }
};

export function Header() {
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
            <div className="w-10 h-10 mr-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-teal flex items-center justify-center shadow-md shadow-brand-blue/20 group-hover:shadow-lg group-hover:shadow-brand-blue/30 transition-all duration-300">
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
            <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">Droip</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6 ml-6">
          <a href="#" className="text-brand-blue font-medium">Home</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Templates</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Recent</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Shared</a>
        </nav>

        {/* Spacer to replace the search area */}
        <div className="flex-1"></div>

        {/* User menu */}
        <div className="ml-auto flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer overflow-visible ring-offset-1 ring-offset-white">
                <div className="absolute inset-0 rounded-full ring-1 ring-gray-200 hover:ring-gray-300 transition-colors duration-200"></div>
                <AvatarImage
                  src={getImageUrlWithSize(
                    user?.image || "/placeholder-user.jpg",
                    HEADER_AVATAR_SIZE.thumbnail.width,
                    HEADER_AVATAR_SIZE.thumbnail.height
                  )}
                  alt={user?.name || "User"}
                  className="rounded-full"
                />
                <AvatarFallback className="bg-gray-100 text-gray-600">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'MP'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-xl">
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage
                    src={getImageUrlWithSize(
                      user?.image || "/placeholder-user.jpg",
                      HEADER_AVATAR_SIZE.thumbnail.width,
                      HEADER_AVATAR_SIZE.thumbnail.height
                    )}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-600 border border-gray-200">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'MP'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || 'Matt Parisien'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'matt@example.com'}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100 hover:text-gray-900">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 hover:text-gray-900">Settings</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 hover:text-gray-900">Billing</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 hover:text-gray-900">Templates</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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