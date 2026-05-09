import Image from "next/image";

import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-accent-light text-sm font-semibold text-accent-hover",
        className,
      )}
    >
      {src ? (
        <Image fill sizes="40px" src={src} alt={alt} className="object-cover" />
      ) : (
        <span>{fallback.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}
