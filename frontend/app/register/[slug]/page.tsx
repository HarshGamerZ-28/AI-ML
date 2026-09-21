"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, EventDetail } from "@/lib/api";
import Reveal from "@/components/Reveal";

export default function RegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", branch: "", year: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  useEffect(() => { api.event(slug).then(setEvent).catch(() => setEvent(null)); }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setStatus("sending");
    try {
      await api.registerForEvent(event.id, form);
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  if (!event) return <div className="pt-48 text-center text-ink-faint">Loading…</div>;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pb-20 pt-40">
      <Reveal className="w-full max-w-md">
        <div className="glass p-8">
          <span className="chip chip-live mb-3">Registration</span>
          <h1 className="font-display text-2xl">{event.title}</h1>
          <p className="mt-1 text-sm text-ink-faint">
            {new Date(event.event_date).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
            {event.location ? ` — ${event.location}` : ""}
          </p>

          {status === "ok" ? (
            <p className="mt-6 rounded-xl border border-mint/30 bg-mint/5 p-4 text-mint">
              You&apos;re registered! Details will be sent to your email closer to the date.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-4">
              <div className="field">
                <label>Full name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label>Year</label>
                  <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                    <option value="">Select</option>
                    <option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Branch</label>
                <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
              </div>
              <button className="btn btn-primary w-full justify-center" disabled={status === "sending"}>
                {status === "sending" ? "Submitting…" : "Confirm registration"}
              </button>
              {status === "err" && <p className="text-sm text-rose">Something went wrong — try again.</p>}
            </form>
          )}
        </div>
      </Reveal>
    </div>
  );
}
