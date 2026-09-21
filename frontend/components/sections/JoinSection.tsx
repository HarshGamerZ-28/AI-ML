"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Reveal from "@/components/Reveal";

export default function JoinSection() {
  const [form, setForm] = useState({ name: "", email: "", branch: "", year: "", interests: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.submitJoin(form);
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  return (
    <section id="join" className="scroll-mt-28 py-24">
      <div className="mx-auto grid w-[90%] max-w-4xl gap-10 md:grid-cols-2 md:items-start">
        <Reveal>
          <span className="eyebrow">Join</span>
          <h2 className="font-display text-4xl">Tell us a bit about yourself</h2>
          <p className="mt-4 text-ink-dim">
            Membership is free and open all year. Fill this in and a core team member will add you to the
            WhatsApp group and send the onboarding notebook within a couple of days.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-ink-dim">
            <li>→ Weekly workshops, lab access and recorded sessions</li>
            <li>→ A project squad matched to your level from week three</li>
            <li>→ Hackathon teams, travel coordination and mentor reviews</li>
            <li>→ Alumni talks and referral channels for internships</li>
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="glass p-7">
          {status === "ok" ? (
            <p className="rounded-xl border border-mint/30 bg-mint/5 p-4 text-mint">
              You&apos;re in. Expect a WhatsApp invite within two days.
            </p>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="field"><label>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="field"><label>College email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="field"><label>Branch</label><input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
                <div className="field"><label>Year</label>
                  <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                    <option value="">Select</option>
                    <option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option>
                  </select>
                </div>
              </div>
              <div className="field"><label>Interests</label><input placeholder="ML, Computer Vision, NLP…" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} /></div>
              <div className="field"><label>Anything you&apos;ve built, or want to build?</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
              <button className="btn btn-primary justify-center" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send my details"}
              </button>
              {status === "err" && <p className="text-sm text-rose">Something went wrong — try again.</p>}
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
