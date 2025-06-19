"use client"

import { BrandLogo, UserMenu, NavigationMenu } from "@components/molecules"
import { useAuth } from "@lib/context/auth-context"
import { useRouter } from "next/navigation"

// Define thumbnail size constant for the header
const HEADER_AVATAR_SIZE = {
  thumbnail: { width: 48, height: 48 }
}

export function Header() {
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/signin') // Redirect to sign-in page after logout
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const menuItems = [
    { label: "Profile", href: "/profile" },
    { label: "Settings" },
    { label: "Billing" },
    { label: "Templates" },
  ]

  const navigationItems = [
    { label: "Home", href: "#", isActive: true },
    { label: "Templates", href: "#" },
    { label: "Recent", href: "#" },
    { label: "Shared", href: "#" },
  ]

  return (
    <div className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <BrandLogo href="/" className="mr-6" />

        {/* Navigation Links */}
        <NavigationMenu 
          items={navigationItems}
          className="hidden md:flex ml-6"
          spacing="lg"
        />

        {/* Spacer to replace the search area */}
        <div className="flex-1"></div>

        {/* User menu */}
        <div className="ml-auto">
          <UserMenu
            user={user || undefined}
            onLogout={handleLogout}
            menuItems={menuItems}
          />
        </div>
      </div>
    </div>
  )
}