import type { Metadata, Viewport } from "next"
import "./globals.css"
import { fontVariables } from "./fonts"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: "راوا | سامانه مدیریت عملکرد",
    template: "%s | راوا",
  },
  description: "سامانه ارزیابی عملکرد و شاخص‌های کلیدی تیم محتوا",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale / userScalable:false — pinch-zoom stays available.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
