import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/app/components/theme-provider"
import { AuthProvider } from "@/app/lib/context/auth-context"

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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}