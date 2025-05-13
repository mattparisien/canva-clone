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
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <Providers>
          <RouteGuard>
            {children}
          </RouteGuard>
        </Providers>
      </body>
    </html>
  )
}