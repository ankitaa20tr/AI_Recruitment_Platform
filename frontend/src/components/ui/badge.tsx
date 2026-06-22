import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent-soft text-accent ring-1 ring-inset ring-accent/25",
        secondary: "bg-elevated text-muted ring-1 ring-inset ring-line",
        success: "bg-success-soft text-success ring-1 ring-inset ring-success/25",
        warning: "bg-warn-soft text-warn ring-1 ring-inset ring-warn/25",
        accent: "bg-gem-soft text-gem ring-1 ring-inset ring-gem/25",
        gem: "bg-gem-soft text-gem ring-1 ring-inset ring-gem/30",
        outline: "border border-line bg-transparent text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
