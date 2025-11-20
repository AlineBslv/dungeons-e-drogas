"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-stone-950/95 group-[.toaster]:text-amber-50 group-[.toaster]:border group-[.toaster]:border-amber-900/40 group-[.toaster]:shadow-xl group-[.toaster]:shadow-black/40 group-[.toaster]:backdrop-blur-md group-[.toaster]:rounded-lg group-[.toaster]:font-lore",
          description: "group-[.toast]:text-stone-300",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-amber-600 group-[.toast]:to-amber-700 group-[.toast]:text-stone-950 group-[.toast]:font-medieval group-[.toast]:hover:from-amber-500 group-[.toast]:hover:to-amber-600 group-[.toast]:transition-all",
          cancelButton:
            "group-[.toast]:bg-stone-800/80 group-[.toast]:text-stone-300 group-[.toast]:hover:bg-stone-700/80 group-[.toast]:transition-all",
          success:
            "group-[.toaster]:border-emerald-800/50 group-[.toaster]:bg-emerald-950/40",
          error:
            "group-[.toaster]:border-red-900/50 group-[.toaster]:bg-red-950/40",
          warning:
            "group-[.toaster]:border-amber-700/50 group-[.toaster]:bg-amber-950/40",
          info:
            "group-[.toaster]:border-blue-800/50 group-[.toaster]:bg-blue-950/40",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
