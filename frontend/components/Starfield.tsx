"use client";

import { useEffect, useRef } from "react";

export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let stars: { x: number; y: number; r: number; a: number; tw: number; d: number }[] = [];
    let raf: number;

    function seed() {
      canvas!.width = innerWidth * dpr;
      canvas!.height = innerHeight * dpr;
      canvas!.style.width = innerWidth + "px";
      canvas!.style.height = innerHeight + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.floor((innerWidth * innerHeight) / 11000) }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 1.25 + 0.25,
        a: Math.random() * 6,
        tw: Math.random() * 0.02 + 0.005,
        d: Math.random() * 0.05 + 0.008,
      }));
    }

    function paint() {
      ctx!.clearRect(0, 0, innerWidth, innerHeight);
      for (const s of stars) {
        s.a += s.tw;
        if (!reduced) {
          s.y -= s.d;
          if (s.y < -2) s.y = innerHeight + 2;
        }
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, 6.283);
        ctx!.fillStyle = `rgba(255,255,255,${0.26 + Math.abs(Math.sin(s.a)) * 0.6})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(paint);
    }

    seed();
    paint();
    addEventListener("resize", seed);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", seed);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" />
      <div
        className="pointer-events-none fixed -inset-[15%] z-0 opacity-90 blur-[16px]"
        style={{
          background:
            "radial-gradient(42vw 34vw at 76% 10%, rgba(146,74,255,.40), transparent 64%)," +
            "radial-gradient(36vw 30vw at 92% 44%, rgba(214,160,255,.22), transparent 66%)," +
            "radial-gradient(44vw 36vw at 16% 26%, rgba(248,188,220,.14), transparent 66%)," +
            "radial-gradient(52vw 42vw at 58% 86%, rgba(123,69,255,.24), transparent 68%)",
        }}
      />
    </>
  );
}
