"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "events", label: "Events" },
  { id: "gallery", label: "Gallery" },
  { id: "team", label: "Team" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Achievements" },
  { id: "notices", label: "Notices" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const onHome = pathname === "/";

  useEffect(() => {
    if (!onHome) return;
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [onHome]);

  return (
    <header className="fixed left-0 right-0 top-4 z-[110]">
      <div className="mx-auto flex w-[92%] max-w-[1180px] items-center justify-between gap-4">
        <Link href="/#home" className="flex items-center gap-2.5 text-[1.05rem] font-bold leading-tight">
          <span className="relative grid h-11 w-11 place-items-center rounded-full"
                style={{ background: "radial-gradient(60% 60% at 32% 24%, rgba(255,255,255,.4), transparent 58%), radial-gradient(circle at 32% 26%,rgba(248,188,220,.55),rgba(123,69,255,.42))" }}>
            <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6 relative z-10">
              <defs>
                <linearGradient id="logoGradH" x1="4" y1="5" x2="28" y2="27" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f8bcdc" /><stop offset="55%" stopColor="#c9b6ff" /><stop offset="100%" stopColor="#aeead9" />
                </linearGradient>
              </defs>
              <path d="M28 16 L22 5.6 L10 5.6 L4 16 L10 26.4 L22 26.4 Z" stroke="url(#logoGradH)" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M16 10 L11 22 M16 10 L21 22 M13.2 17.4 L18.8 17.4" stroke="url(#logoGradH)" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="16" cy="10" r="1.5" fill="#fff" />
              <circle cx="11" cy="22" r="1.3" fill="#fff" />
              <circle cx="21" cy="22" r="1.3" fill="#fff" />
              <circle cx="13.2" cy="17.4" r="1" fill="#fff" opacity=".85" />
              <circle cx="18.8" cy="17.4" r="1" fill="#fff" opacity=".85" />
            </svg>
          </span>
          <span>AIML<small className="block text-[.72rem] font-medium text-ink-dim">Club · GEC Ajmer</small></span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.09] p-1.5 backdrop-blur-xl lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.id}
              href={`/#${l.id}`}
              className={`rounded-full px-4 py-2.5 text-[.95rem] transition-colors ${
                onHome && active === l.id ? "bg-white/[0.14] text-white" : "text-ink-dim hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/#join" className="btn btn-primary !py-2.5 !px-5 text-sm">Join</Link>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="glass grid h-11 w-11 place-items-center lg:hidden"
          aria-label="Menu"
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="glass mx-[4vw] mt-3 flex flex-col p-3 lg:hidden">
          {[...LINKS, { id: "join", label: "Join" }].map((l) => (
            <Link key={l.id} href={`/#${l.id}`} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-ink-dim hover:bg-white/5 hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
