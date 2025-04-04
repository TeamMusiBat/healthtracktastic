
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

// Create a new button variant for 3D buttons
const button3dVariants = cva(
  "button-3d inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-b-4 border-primary-700 hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground border-b-4 border-destructive-700 hover:bg-destructive/90",
        outline: "border border-input bg-background border-b-4 hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground border-b-4 border-secondary-700 hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-500 text-white border-b-4 border-green-700 hover:bg-green-600",
        warning: "bg-yellow-500 text-white border-b-4 border-yellow-700 hover:bg-yellow-600",
        info: "bg-blue-500 text-white border-b-4 border-blue-700 hover:bg-blue-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Extend button props with 3D variant props
export interface Button3dProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button3dVariants> {}

// Create 3D Button component
const Button3d = React.forwardRef<HTMLButtonElement, Button3dProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(button3dVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button3d.displayName = "Button3d";

// Export both the component and the variants
export { Button3d, button3dVariants };
