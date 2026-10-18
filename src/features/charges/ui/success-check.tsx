"use client";

import { motion, useReducedMotion } from "motion/react";

const DRAW = { duration: 0.5, ease: [0.65, 0, 0.45, 1] } as const;

/** An animated check: the circle draws itself, then the tick, then a small pop. */
export function SuccessCheck() {
  const reduce = useReducedMotion();
  const drawn = reduce ? { pathLength: 1 } : { pathLength: 0 };

  return (
    <motion.svg
      viewBox="0 0 52 52"
      aria-hidden="true"
      className="size-14 text-success"
      initial={reduce ? false : { scale: 1 }}
      animate={reduce ? {} : { scale: [1, 1.12, 1] }}
      transition={{ delay: 0.8, duration: 0.35, ease: "easeOut" }}
    >
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        className="fill-success/12 stroke-current"
        strokeWidth="3"
        initial={drawn}
        animate={{ pathLength: 1 }}
        transition={DRAW}
      />
      <motion.path
        d="M15 27 l7.5 7.5 L37 19"
        fill="none"
        className="stroke-current"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={drawn}
        animate={{ pathLength: 1 }}
        transition={{ ...DRAW, duration: 0.3, delay: 0.5 }}
      />
    </motion.svg>
  );
}
