"use client";

import { motion } from "framer-motion";

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGroup({ children, className }: AnimatedGroupProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
