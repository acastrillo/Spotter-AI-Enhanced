import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "text-white",
      outline: "border border-border bg-background hover:bg-surface",
      ghost: "hover:bg-surface hover:text-text-primary",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    const style: React.CSSProperties = {
      backgroundColor: variant === "default" ? 'var(--primary)' : undefined,
      color: variant === "default" ? 'var(--primary-foreground)' : variant === "outline" ? 'var(--text-primary)' : 'var(--text-secondary)',
      borderColor: variant === "outline" ? 'var(--border)' : undefined,
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        style={style}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }