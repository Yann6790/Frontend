import { Loader2 } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin text-muted-foreground",
  {
    variants: {
      size: {
        default: "h-4 w-4",
        sm: "h-3 w-3",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-purple-600",
        white: "text-white",
        slate: "text-slate-500",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export function Spinner({ className, size, variant, ...props }) {
  return (
    <Loader2
      className={cn(spinnerVariants({ size, variant, className }))}
      {...props}
    />
  );
}
