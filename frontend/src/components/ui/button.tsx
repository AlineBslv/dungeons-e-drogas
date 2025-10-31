import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium font-ui transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 active:shadow",
        drogon:
          "bg-primary text-primary-foreground font-semibold shadow-md hover:shadow-glow-intense hover:-translate-y-1 active:translate-y-0 active:shadow-md [background:linear-gradient(135deg,#C5A75B_0%,#B89E58_100%)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-dark-500/80 hover:border-gold-300 border border-border active:bg-dark-500 active:scale-95",
        destructive:
          "bg-ruby text-text-primary shadow-sm hover:bg-ruby/90 hover:shadow-[0_0_10px_rgba(118,43,40,0.5)] active:bg-ruby/80 active:scale-95",
        outline:
          "border border-border bg-transparent shadow-sm hover:bg-primary/10 hover:border-primary hover:text-primary active:bg-primary/5 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-95",
        link: "text-gold-500 underline-offset-4 hover:underline hover:text-gold-300 active:text-gold-400",
        arcane:
          "bg-arcane text-text-primary shadow-arcane hover:shadow-[0_0_20px_rgba(58,74,99,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-arcane",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
