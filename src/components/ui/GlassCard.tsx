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
          "relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 backdrop-blur-xl shadow-xl transition-all duration-300",
          variant === "hover" && "hover:bg-zinc-800/60 hover:border-white/10 hover:shadow-2xl hover:-translate-y-1 cursor-pointer",
          className
        )}
        {...props}
      >
        {/* Inner shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">{props.children}</div>
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
