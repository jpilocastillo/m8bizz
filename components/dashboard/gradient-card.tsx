import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

const gradientVariants = cva("relative overflow-hidden", {
  variants: {
    variant: {
      blue: "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-blue-500/20 before:to-purple-500/5 before:opacity-40",
      green:
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-green-500/20 before:to-emerald-500/5 before:opacity-40",
      purple:
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-500/20 before:to-pink-500/5 before:opacity-40",
      orange:
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-orange-500/20 before:to-red-500/5 before:opacity-40",
      default: "",
    },
    glow: {
      true: "after:absolute after:inset-0 after:rounded-lg after:opacity-40 after:blur-2xl after:bg-gradient-to-br",
      false: "",
    },
    glowColor: {
      blue: "after:from-blue-500/10 after:to-purple-500/5",
      green: "after:from-green-500/10 after:to-emerald-500/5",
      purple: "after:from-purple-500/10 after:to-pink-500/5",
      orange: "after:from-orange-500/10 after:to-red-500/5",
      default: "",
    },
    border: {
      true: "border-none",
      false: "border-none",
    },
  },
  defaultVariants: {
    variant: "default",
    glow: false,
    border: true,
    glowColor: "default",
  },
})

interface GradientCardProps extends React.ComponentProps<typeof Card> {
  variant?: "blue" | "green" | "purple" | "orange" | "default"
  glow?: boolean
  glowColor?: "blue" | "green" | "purple" | "orange" | "default"
  border?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  headerClassName?: string
  contentClassName?: string
}

export function GradientCard({
  variant = "default",
  glow = true,
  glowColor = "default",
  border = true,
  title,
  description,
  icon,
  className,
  headerClassName,
  contentClassName,
  children,
  ...props
}: GradientCardProps) {
  return (
    <Card
      className={cn(
        "bg-m8bs-card",
        gradientVariants({ variant, glow, glowColor, border }),
        "shadow-sm",
        className,
      )}
      {...props}
    >
      {(title || description || icon) && (
        <CardHeader
          className={cn(
            "relative z-10 flex flex-row items-center justify-between bg-m8bs-card border-b border-m8bs-border",
            headerClassName,
          )}
        >
          <div>
            {title && (typeof title === "string" ? <CardTitle className="text-white">{title}</CardTitle> : title)}
            {description && (
              <CardDescription className="mt-1.5 text-m8bs-muted">
                {typeof description === "string" ? description : description}
              </CardDescription>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "text-m8bs-cyan p-2 rounded-full",
                variant === "blue"
                  ? "bg-gray-500/10"
                  : variant === "green"
                    ? "bg-green-500/10"
                    : variant === "purple"
                      ? "bg-purple-500/10"
                      : variant === "orange"
                        ? "bg-orange-500/10"
                        : "bg-gray-500/10",
              )}
            >
              {icon}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("relative z-10 p-6", contentClassName)}>{children}</CardContent>
    </Card>
  )
}
