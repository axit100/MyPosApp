import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          // Variants
          variant === "default" && "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
          variant === "outline" && "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
          // Sizes
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
