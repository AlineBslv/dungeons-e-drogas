"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

/**
 * Dialog Arcano - Modal com tema medieval sombrio
 */
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => onOpenChange(false)}
            />
            {children}
          </>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
}

export function DialogContent({ children, className }: DialogContentProps) {
  const { onOpenChange } = React.useContext(DialogContext);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(2px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-gold-500/40 bg-dark-300 p-6 shadow-arcane rounded-lg",
        className
      )}
    >
      {children}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:text-gold-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Fechar</span>
      </button>
    </motion.div>
  );
}

export function DialogHeader({ children, className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogTitle({ children, className, ...props }: DialogTitleProps) {
  return (
    <h2
      className={cn("text-lg font-semibold font-medieval text-gold-500", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className, ...props }: DialogDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-text-secondary font-lore", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function DialogFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
