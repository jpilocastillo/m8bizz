import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "M8 Business Suite",
  description: "Marketing and Business Management Dashboard",
  icons: {
    icon: [
      { url: "/placeholder-logo.png", type: "image/png" },
      { url: "/placeholder-logo.svg", type: "image/svg+xml" }
    ],
    shortcut: ["/placeholder-logo.png"],
    apple: [
      { url: "/placeholder-logo.png", type: "image/png" }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-m8bs-bg`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
