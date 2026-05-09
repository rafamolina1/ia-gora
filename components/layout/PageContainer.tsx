import { cn } from "@/lib/utils/cn";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "content" | "reading" | "wide";
}

const sizeClassMap = {
  content: "max-w-content",
  reading: "max-w-reading",
  wide: "max-w-wide",
} as const;

export function PageContainer({
  children,
  className,
  size = "content",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 pb-28 pt-6 sm:px-5 md:px-6 md:pb-16 md:pt-8 lg:px-7",
        sizeClassMap[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
