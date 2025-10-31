import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-amber-700/50 bg-gradient-to-br from-amber-900/40 to-amber-950/60 text-amber-200 shadow-sm shadow-amber-900/20 hover:from-amber-800/50 hover:to-amber-900/70 hover:border-amber-600/60 hover:shadow-amber-800/30",
        secondary:
          "border-stone-700/50 bg-gradient-to-br from-stone-800/40 to-stone-900/60 text-stone-300 hover:from-stone-700/50 hover:to-stone-800/70 hover:border-stone-600/60",
        destructive:
          "border-red-900/50 bg-gradient-to-br from-red-950/40 to-red-900/60 text-red-200 shadow-sm shadow-red-950/20 hover:from-red-900/50 hover:to-red-800/70 hover:border-red-800/60",
        outline: "border-amber-800/40 text-amber-300/90 hover:bg-amber-950/30 hover:text-amber-200 hover:border-amber-700/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
