"use client";
import { motion, useReducedMotion, useScroll, useSpring, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({ children, delay = 0, className, y = 28 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Harfleri maskeden yukarı kaldıran kinetik başlık. Ekran okuyucu için asıl metin aria-label'da kalır. */
export function SplitWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: delay + wi * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left bg-acid" />;
}

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40 });
  const sy = useSpring(y, { stiffness: 500, damping: 40 });
  const [big, setBig] = useState(false);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
    document.documentElement.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setBig(!!(e.target as HTMLElement)?.closest?.("a,button,[data-hover]"));
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [x, y]);
  if (!on) return null;
  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[80] -ml-3 -mt-3 hidden md:block"
    >
      <motion.div animate={{ scale: big ? 2.6 : 1 }} className="h-6 w-6 rounded-full bg-acid mix-blend-difference" />
    </motion.div>
  );
}

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/** İmleç konumuna göre kayan yazılım/tasarım ayrık ekranı. */
export function SplitHero({ left, right, hint }: { left: ReactNode; right: ReactNode; hint: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = useMotionValue(50);
  const smooth = useSpring(pct, { stiffness: 90, damping: 20 });
  const clip = useTransform(smooth, (p) => `polygon(${p + 8}% 0, 100% 0, 100% 100%, ${p - 8}% 100%)`);
  const edge = useTransform(smooth, (p) => `${p}%`);
  return (
    <div
      ref={ref}
      className="relative h-[78svh] min-h-[460px] w-full overflow-hidden border-b border-line select-none"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        pct.set(Math.min(85, Math.max(15, ((e.clientX - r.left) / r.width) * 100)));
      }}
    >
      <div className="absolute inset-0 bg-ink">{left}</div>
      <motion.div style={{ clipPath: clip }} className="absolute inset-0 bg-acid text-ink">{right}</motion.div>
      <motion.div aria-hidden style={{ left: edge }} className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/40 bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-ink mix-blend-normal">
        ◂ {hint} ▸
      </motion.div>
    </div>
  );
}
