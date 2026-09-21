"use client";

import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AboutSection from "@/components/sections/AboutSection";
import EventsSection from "@/components/sections/EventsSection";
import GallerySection from "@/components/sections/GallerySection";
import TeamSection from "@/components/sections/TeamSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import AchievementsSection from "@/components/sections/AchievementsSection";
import NoticesSection from "@/components/sections/NoticesSection";
import JoinSection from "@/components/sections/JoinSection";

const TICKER = ["Python", "PyTorch", "TensorFlow", "Computer Vision", "NLP", "Transformers", "MLOps", "FastAPI", "Kaggle"];

const HeroOrb3D = dynamic(() => import("@/components/HeroOrb3D"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full max-w-[440px] mx-auto rounded-full bg-white/[0.03]" />,
});

export default function HomePage() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    // #gallery mounts inside a Suspense boundary (useSearchParams), so it isn't in the
    // initial HTML — give it a moment to render before trying to scroll to it.
    const t = setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ block: "start" });
    }, 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <section id="home" className="scroll-mt-28 flex min-h-[90svh] items-center pb-10 pt-44">
        <div className="mx-auto w-[90%] max-w-[1180px]">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <h1 className="font-display text-5xl uppercase leading-[1.02] sm:text-6xl lg:text-7xl">
                Pioneering<br /><span className="iris-text">the future of</span><br />intelligence
              </h1>
              <p className="mt-6 max-w-md text-ink-dim">
                Discover. Innovate. Inspire. Journey with us into the heart of AI &amp; ML at
                Government Engineering College, Ajmer.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/#join" className="btn btn-primary">Join the magic</Link>
                <Link href="/#events" className="btn btn-solid">Explore events</Link>
              </div>
            </div>

            <HeroOrb3D />
          </div>

          <Reveal delay={0.1} className="mt-20">
            <span className="eyebrow">Our journey</span>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                ["⚙️", "Workshops", "Weekly hands-on sessions from Python through to transformers."],
                ["🧪", "Research", "Fortnightly paper circles and small experiments."],
                ["🗂️", "Projects", "Squads ship something real every semester."],
                ["🌐", "Community", "Open to every branch and every year."],
              ].map(([icon, title, desc]) => (
                <div key={title} className="glass p-6">
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-xl">{icon}</div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-1 text-sm text-ink-faint">{desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-16 overflow-hidden border-y border-white/10 py-4">
            <div className="marquee-track">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="whitespace-nowrap text-sm uppercase tracking-[.22em] text-ink-faint">
                  <b className="text-lilac">//</b> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AboutSection />
      <EventsSection />
      <Suspense fallback={<div className="py-24 text-center text-ink-faint">Loading gallery…</div>}>
        <GallerySection />
      </Suspense>
      <TeamSection />
      <ProjectsSection />
      <AchievementsSection />
      <NoticesSection />
      <JoinSection />
    </>
  );
}