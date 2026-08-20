import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs";

    const variants = {
      default: "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:scale-102",
      outline: "border border-white/20 bg-white/5 text-white hover:bg-white/15 hover:border-cyan-400/50",
      ghost: "text-slate-300 hover:text-white hover:bg-white/10",
      link: "text-cyan-400 underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizes = {
      default: "h-11 px-5 py-2.5",
      sm: "h-9 px-3.5 text-[11px]",
      lg: "h-13 px-7 text-sm",
      icon: "size-10",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
