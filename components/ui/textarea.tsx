import * as React from "react";

import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[112px] w-full rounded-lg border border-border bg-bg-surface px-4 py-3 text-[15px] text-text-primary shadow-[inset_0_1px_0_rgba(15,23,42,0.02)] placeholder:text-text-tertiary transition-all duration-150 focus:border-border-focus focus:shadow-focus",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
