import * as React from "react";

import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-lg border border-border bg-bg-surface px-4 text-[15px] text-text-primary shadow-[inset_0_1px_0_rgba(15,23,42,0.02)] placeholder:text-text-tertiary transition-all duration-150 focus:border-border-focus focus:shadow-focus",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
