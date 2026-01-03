import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Mantido apenas para compatibilidade com código gerado pelo v0.
   * NÃO é repassado ao DOM.
   */
  asChild?: boolean

  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
}

export function Button({
  className,
  variant = "default",
  size = "md",
  asChild, // intencionalmente ignorado
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",

        // VARIANTS
        variant === "default" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",

        variant === "outline" &&
          "border border-input bg-background hover:bg-muted",

        variant === "ghost" &&
          "hover:bg-muted bg-transparent",

        variant === "destructive" &&
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        // SIZES
        size === "sm" && "h-9 px-3",
        size === "md" && "h-10 px-4",
        size === "lg" && "h-11 px-6",

        className
      )}
      {...props}
    />
  )
}
