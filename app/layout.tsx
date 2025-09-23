import "./globals.css"
import { ReactNode } from "react"
import { ThemeProvider } from "@/contexts/ThemeContext"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-900 transition-colors">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
