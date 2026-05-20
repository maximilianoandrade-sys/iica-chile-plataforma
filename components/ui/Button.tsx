"use client";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-[var(--iica-yellow)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-[var(--iica-secondary)] text-white rounded-xl shadow-lg hover:brightness-110 min-h-[56px] px-6 py-4",
        secondary: "bg-white text-[var(--iica-blue)] border-2 border-[var(--iica-blue)] rounded-xl hover:bg-blue-50 min-h-[56px] px-6 py-4",
        default: "bg-[var(--iica-navy)] text-white rounded hover:translate-y-[-1px] min-h-[48px] px-6 py-3",
        ghost: "bg-transparent hover:bg-gray-100 rounded-lg min-h-[44px] px-4 py-2",
        destructive: "bg-red-600 text-white rounded-lg hover:bg-red-700 min-h-[44px] px-4 py-2",
      },
      size: {
        sm: "text-xs min-h-[36px] px-3 py-1.5",
        md: "",
        lg: "text-base min-h-[56px] px-8 py-4",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
export { buttonVariants };
