"use client";

import { useEffect, useRef, useState } from "react";
import { api, Project } from "@/lib/api";
import Reveal from "@/components/Reveal";

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => { api.projects().then(setProjects); }, []);

  function scrollRail(dir: 1 | -1) {
    railRef.current?.scrollBy({ left: dir * Math.min(railRef.current.clientWidth * 0.8, 360), behavior: "smooth" });
  }

  return (
    <section id="projects" className="scroll-mt-28 py-24">
      <div className="mx-auto w-[90%] max-w-[1180px]">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="eyebrow">Projects</span>
            <h2 className="font-display text-4xl">Everything the squads have built</h2>
            <p className="mt-3 text-ink-dim">Each one started as a semester project. Drag the row or use the arrows.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollRail(-1)} aria-label="Previous" className="btn !h-11 !w-11 !p-0 justify-center">←</button>
            <button onClick={() => scrollRail(1)} aria-label="Next" className="btn !h-11 !w-11 !p-0 justify-center">→</button>
          </div>
        </Reveal>

        <div ref={railRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06} className="w-[300px] shrink-0 snap-start sm:w-[340px]">
              <div className="glass flex h-full flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="chip">{p.category}</span>
                  {p.is_live && <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_10px_theme(colors.mint)]" title="Live" />}
                </div>
                <h3 className="font-display text-lg">{p.title}</h3>
                <p className="flex-1 text-sm text-ink-faint">{p.description}</p>
                {p.tech_stack && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech_stack.split(",").map((t) => (
                      <span key={t} className="rounded-md bg-white/[0.08] px-2 py-0.5 text-[.7rem] text-ink-dim">{t.trim()}</span>
                    ))}
                  </div>
                )}
                {(p.repo_url || p.demo_url) && (
                  <div className="flex gap-4 pt-1 text-sm">
                    {p.repo_url && <a href={p.repo_url} target="_blank" className="text-lilac">Code →</a>}
                    {p.demo_url && <a href={p.demo_url} target="_blank" className="text-lilac">Demo →</a>}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
