"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Member } from "@/lib/api";
import Reveal from "@/components/Reveal";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function TeamSection() {
  const [members, setMembers] = useState<Member[]>([]);
  useEffect(() => { api.members().then(setMembers); }, []);

  return (
    <section id="team" className="scroll-mt-28 py-24">
      <div className="mx-auto w-[90%] max-w-[1180px]">
        <Reveal className="mb-10 max-w-2xl">
          <span className="eyebrow">Team</span>
          <h2 className="font-display text-4xl">The people running it this year</h2>
          <p className="mt-3 text-ink-dim">Core team is elected each August. Anyone with two semesters in the club can stand.</p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {members.map((m, i) => (
            <Reveal key={m.id} delay={(i % 4) * 0.06}>
              <Link href={`/team/${m.id}`} className="glass block p-6 text-center transition-transform hover:-translate-y-1">
                <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-iris font-display text-xl text-[#1b1229]">
                  {initials(m.name)}
                </div>
                <h3 className="font-medium">{m.name}</h3>
                <p className="text-sm text-lilac">{m.role}</p>
                <p className="mt-1 text-xs text-ink-faint">{m.branch} · {m.year}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
