"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface InViewProps {
  children: React.ReactNode;
  className?: string;
}

export function InView({ children, className }: InViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
