import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold",
  {
    variants: {
      variant: {
        open: "bg-green-100 text-green-700",
        closed: "bg-red-100 text-red-600",
        info: "bg-blue-100 text-blue-700",
        warning: "bg-yellow-100 text-yellow-700",
        neutral: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
export { badgeVariants };
