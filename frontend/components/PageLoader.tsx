"use client";

import { useEffect, useState } from "react";

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDone(true);
      setTimeout(() => setHidden(true), 200);
      return;
    }

    let raf: number;
    const tick = () => {
      setProgress((p) => {
        const next = p + (100 - p) * 0.06 + 0.4;
        return next >= 99 ? 99 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      cancelAnimationFrame(raf);
      setProgress(100);
      setTimeout(() => setDone(true), 250);
      setTimeout(() => setHidden(true), 850);
    };

    if (document.readyState === "complete") {
      const t = setTimeout(finish, 500); // still show it briefly, never an instant flash
      return () => clearTimeout(t);
    }
    window.addEventListener("load", finish);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", finish);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-void transition-opacity duration-500"
      style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }}
      aria-hidden={done}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative grid h-16 w-16 animate-spin place-items-center rounded-full"
             style={{ background: "conic-gradient(from 0deg, #f8bcdc, #c9b6ff, #aeead9, #ffdcae, #f8bcdc)", animationDuration: "1.4s" }}>
          <div className="absolute inset-[3px] rounded-full bg-void" />
          <div className="relative h-2.5 w-2.5 rounded-full bg-white" style={{ boxShadow: "0 0 12px #fff" }} />
        </div>
        <div className="font-display text-sm tracking-[.25em] text-ink-dim">AIML CLUB</div>
        <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-iris transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}