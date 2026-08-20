import React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-[11px] font-bold uppercase tracking-wider text-slate-300 select-none",
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";
