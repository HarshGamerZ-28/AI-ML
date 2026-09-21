"use client";

import { useEffect, useState } from "react";
import { api, Achievement } from "@/lib/api";
import Reveal from "@/components/Reveal";

const CATEGORIES = ["All", "Hackathon", "Research", "Placement", "Competition", "Open Source", "General"];

export default function AchievementsSection() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [category, setCategory] = useState("All");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ member_name: "", title: "", description: "", category: "General", year: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  function load() {
    api.achievements({ category: category === "All" ? undefined : category }).then(setItems);
  }
  useEffect(load, [category]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.submitAchievement(form);
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  return (
    <section id="achievements" className="scroll-mt-28 py-24">
      <div className="mx-auto w-[90%] max-w-[1180px]">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="eyebrow">Hall of Fame</span>
            <h2 className="font-display text-4xl">Celebrating the wins of our members</h2>
          </div>
          <button onClick={() => setModal(true)} className="btn btn-primary">Submit an achievement</button>
        </Reveal>

        <Reveal delay={0.05} className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                category === c ? "border-lilac bg-lilac/10 text-white" : "border-white/10 text-ink-faint hover:text-ink-dim"
              }`}
            >
              {c}
            </button>
          ))}
        </Reveal>

        {items.length === 0 ? (
          <p className="text-ink-faint">Nothing here yet for this category.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a, i) => (
              <Reveal key={a.id} delay={(i % 6) * 0.05} className="glass p-6">
                <div className="text-3xl">{a.badge_icon}</div>
                <h3 className="mt-3 font-display text-lg">{a.title}</h3>
                <p className="mt-1 text-sm text-lilac">{a.member_name}{a.year ? ` · ${a.year}` : ""}</p>
                {a.description && <p className="mt-2 text-sm text-ink-faint">{a.description}</p>}
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[150] grid place-items-center bg-black/75 p-4 backdrop-blur-md" onClick={() => setModal(false)}>
          <div className="glass w-full max-w-md p-7" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl">Submit an achievement</h3>
            <p className="mt-1 text-sm text-ink-faint">An admin will review it before it goes live.</p>
            {status === "ok" ? (
              <p className="mt-5 rounded-xl border border-mint/30 bg-mint/5 p-4 text-mint">Thanks! We&apos;ll review it shortly.</p>
            ) : (
              <form onSubmit={submit} className="mt-5 grid gap-3">
                <div className="field"><label>Member name</label><input required value={form.member_name} onChange={(e) => setForm({ ...form, member_name: e.target.value })} /></div>
                <div className="field"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="field"><label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <button className="btn btn-primary justify-center" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Submit"}
                </button>
                {status === "err" && <p className="text-sm text-rose">Something went wrong — try again.</p>}
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
