import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/[0.07] bg-zinc-950/80 shadow-[0_1px_1px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-200",
          variant === "hover" &&
            "hover:bg-zinc-900/90 hover:border-white/[0.13] hover:shadow-[0_1px_1px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.4)] hover:-translate-y-px active:scale-[0.99] active:translate-y-0 cursor-pointer select-none",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
