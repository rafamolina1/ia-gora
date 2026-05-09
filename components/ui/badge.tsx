import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "accent";
}

export function Badge({ children, className, tone = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        tone === "accent"
          ? "border-accent bg-accent text-white"
          : "border-border bg-bg-elevated text-text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}
