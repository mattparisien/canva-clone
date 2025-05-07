import type { Metadata } from "next"
import "@styles/globals.css"
import { Providers } from "@/components/providers"
import { RouteGuard } from "@/components/route-guard"
import { Header } from "@/components/layout/header"

export const metadata: Metadata = {
  title: "Canvas - Create stunning designs",
  description: "Create beautiful presentations, social media graphics, and more with Canvas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <RouteGuard>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
              <div className="flex-1 px-4 md:px-6 pb-8">{children}</div>
              <footer className="py-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
                  <div className="mb-4 md:mb-0">© 2025 Canvas. All rights reserved.</div>
                  <div className="flex gap-6">
                    <a href="#" className="hover:text-primary transition-colors">Help</a>
                    <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms</a>
                  </div>
                </div>
              </footer>
            </div>
          </RouteGuard>
        </Providers>
      </body>
    </html>
  )
}