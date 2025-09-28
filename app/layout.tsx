import "./globals.css"
import { ReactNode } from "react"
import { ThemeProvider } from "@/contexts/ThemeContext"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#f3f4f6" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111827" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var root = document.documentElement;
                  
                  // Clear any existing theme classes
                  root.classList.remove('light', 'dark');
                  
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    root.classList.add('dark');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.add('light');
                    root.style.colorScheme = 'light';
                  }
                } catch (e) {
                  // Fallback to light mode if anything goes wrong
                  document.documentElement.classList.add('light');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overscroll-behavior-none">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
