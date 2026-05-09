"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

const motionTags = {
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
} as const;

interface TextEffectProps {
  as?: keyof typeof motionTags;
  children: string;
  className?: string;
  per?: "word";
  preset?: "fade-in-blur";
}

export function TextEffect({
  as: Tag = "div",
  children,
  className,
}: TextEffectProps) {
  const words = children.split(" ");
  const MotionTag = motionTags[Tag];

  return (
    <MotionTag
      className={cn("flex flex-wrap gap-x-2 gap-y-1", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
            delayChildren: 0.08,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={{
            hidden: { opacity: 0, filter: "blur(8px)", y: 10 },
            visible: { opacity: 1, filter: "blur(0px)", y: 0 },
          }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  );
}
