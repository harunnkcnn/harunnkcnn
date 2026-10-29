"use client";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Sayfa geçişi: içerik alttan kalkarken ince bir perde yukarı çekilir. */
export function PageTransition({ children }: { children: ReactNode }) {
  const path = usePathname();
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <>
      <motion.div
        key={`curtain-${path}`}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[65] origin-top bg-acid"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div key={path} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    </>
  );
}
