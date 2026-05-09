import * as React from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "small";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] hover:bg-accent-hover active:scale-[0.98] disabled:bg-text-tertiary disabled:text-white disabled:opacity-70 disabled:shadow-none",
  secondary:
    "border border-border-strong bg-bg-surface text-text-primary shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-bg-elevated active:scale-[0.98]",
  ghost: "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-12 px-5 text-[15px] font-medium",
  small: "h-10 px-4 text-sm font-medium",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-150 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
