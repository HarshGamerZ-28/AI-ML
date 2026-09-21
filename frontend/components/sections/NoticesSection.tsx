"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Notice } from "@/lib/api";
import Reveal from "@/components/Reveal";

export default function NoticesSection() {
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => { api.notices().then(setNotices); }, []);

  return (
    <section id="notices" className="scroll-mt-28 py-24">
      <div className="mx-auto w-[90%] max-w-3xl">
        <Reveal className="mb-10 max-w-2xl">
          <span className="eyebrow">Notice Board</span>
          <h2 className="font-display text-4xl">Stay updated with club announcements</h2>
        </Reveal>

        {notices.length === 0 ? (
          <p className="text-ink-faint">No notices right now.</p>
        ) : (
          <div className="grid gap-3">
            {notices.map((n, i) => (
              <Reveal key={n.id} delay={(i % 6) * 0.05}>
                <Link href={`/notices/${n.id}`} className="glass block p-5 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="chip mb-2">{n.category}</span>
                      <h3 className="font-medium">{n.title}</h3>
                      <p className="mt-1 text-xs text-ink-faint">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-lilac">→</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
