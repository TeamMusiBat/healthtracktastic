
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform active:scale-95 shadow-lg hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:translate-y-[-2px] shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:translate-y-[-2px] shadow-[0_4px_12px_rgba(220,38,38,0.25)]",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:translate-y-[-2px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:translate-y-[-2px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:translate-y-[-2px]",
        link: "text-primary underline-offset-4 hover:underline",
        "3d": "bg-primary text-primary-foreground border-b-4 border-primary-foreground/20 hover:translate-y-[-2px] shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_15px_rgba(0,0,0,0.25)] active:border-b-2 active:translate-y-[2px]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
