import * as React from "react"
import { cn } from "@/app/utils/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
    size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
            secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
            danger: "bg-danger text-danger-foreground shadow-sm hover:bg-danger/90",
        }

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-9 px-4 py-2 text-sm",
            lg: "h-10 px-8 text-base",
            icon: "h-9 w-9",
        }

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }
))
Button.displayName = "Button"

export { Button }
