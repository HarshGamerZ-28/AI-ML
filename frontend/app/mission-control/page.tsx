"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { api, AdminStats } from "@/lib/api";

export default function AdminOverview() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => { if (token) api.stats(token).then(setStats); }, [token]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSending(true); setResult(null);
    try {
      const r = await api.broadcastEmail(token, subject, body);
      if (!r.configured) setResult(r.detail || "SMTP not configured.");
      else setResult(`Sent to ${r.sent} of ${r.recipients} recipients${r.failed ? ` (${r.failed} failed)` : ""}.`);
    } catch (e: any) {
      setResult(e.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  const cards = stats ? [
    ["Total members", stats.total_members, "◍", "bg-lilac/15 text-lilac"],
    ["Pending join requests", stats.pending_join_requests, "◑", "bg-peach/15 text-peach"],
    ["Pending update requests", stats.pending_update_requests, "◐", "bg-rose/15 text-rose"],
    ["Pending achievements", stats.pending_achievements, "◎", "bg-mint/15 text-mint"],
    ["Total events", stats.total_events, "▤", "bg-lilac/15 text-lilac"],
    ["Gallery items", stats.gallery_count, "▦", "bg-peach/15 text-peach"],
    ["Open notices", stats.open_notices, "◈", "bg-mint/15 text-mint"],
  ] as const : [];

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Overview</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map(([label, value, icon, color]) => (
          <div key={label} className="glass p-5">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-full text-lg ${color}`}>{icon}</div>
            <div className="font-display text-3xl">{value}</div>
            <div className="mt-1 text-xs text-ink-faint">{label}</div>
          </div>
        ))}
      </div>

      <div className="glass mt-8 max-w-xl p-6">
        <h2 className="font-display text-xl">Broadcast an email</h2>
        <p className="mt-1 text-sm text-ink-faint">
          Sends to every unique email on file — members, join requests and event registrations.
        </p>
        <form onSubmit={send} className="mt-4 grid gap-3">
          <div className="field"><label>Subject</label><input required value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="field"><label>Message</label><textarea required rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <button className="btn btn-primary justify-center" disabled={sending}>{sending ? "Sending…" : "Send to everyone"}</button>
          {result && <p className="text-sm text-ink-dim">{result}</p>}
        </form>
      </div>
    </div>
  );
}
