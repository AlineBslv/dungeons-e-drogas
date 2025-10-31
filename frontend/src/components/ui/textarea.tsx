import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded border font-lore",
        "border-amber-900/40 bg-stone-950/40 backdrop-blur-sm",
        "px-3 py-2 text-sm text-amber-50/90",
        "placeholder:text-stone-500 placeholder:italic placeholder:font-ui",
        "shadow-inner shadow-black/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:border-amber-700/60",
        "focus-visible:bg-stone-950/60",
        "hover:border-amber-800/50 hover:bg-stone-950/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all duration-200",
        "resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
