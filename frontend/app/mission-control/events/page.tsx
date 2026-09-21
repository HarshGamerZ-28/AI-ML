"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { api, EventItem, EventDetail } from "@/lib/api";

type ScheduleRow = { time_label: string; title: string; order: number };
const empty = {
  title: "", description: "", event_date: "", location: "", status: "upcoming", is_featured: false,
};

export default function AdminEventsPage() {
  const { token } = useAdminAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [regCounts, setRegCounts] = useState<Record<number, number>>({});

  function load() { api.events().then(setEvents); }
  useEffect(load, []);

  async function openEdit(ev?: EventItem) {
    if (!ev) {
      setForm(empty); setSchedule([]); setEditing("new"); return;
    }
    const detail: EventDetail = await api.event(String(ev.id));
    setForm({
      title: detail.title, description: detail.description || "",
      event_date: detail.event_date.slice(0, 16), location: detail.location || "",
      status: detail.status, is_featured: detail.is_featured,
    });
    setSchedule(detail.schedule.map((s) => ({ time_label: s.time_label, title: s.title, order: s.order })));
    setEditing(ev.id);
    if (token) api.eventRegistrations(token, ev.id).then((r) => setRegCounts((c) => ({ ...c, [ev.id]: r.length })));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const payload = { ...form, event_date: new Date(form.event_date).toISOString(), schedule };
    if (editing === "new") await api.createEvent(token, payload);
    else await api.updateEvent(token, editing as number, payload);
    setEditing(null);
    load();
  }

  async function remove(id: number) {
    if (!token || !confirm("Delete this event? Its schedule and gallery links go with it.")) return;
    await api.deleteEvent(token, id);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Events</h1>
        <button onClick={() => openEdit()} className="btn btn-primary !py-2 text-sm">New event</button>
      </div>

      {editing !== null && (
        <form onSubmit={save} className="glass mb-8 grid gap-3 p-6">
          <h2 className="font-medium">{editing === "new" ? "Create event" : "Edit event"}</h2>
          <div className="field"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Date &amp; time</label><input required type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
            <div className="field"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="upcoming">Upcoming</option><option value="past">Past</option><option value="live">Live</option>
              </select>
            </div>
            <label className="field flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="!w-auto" />
              Feature on countdown banner
            </label>
          </div>

          <div className="mt-2">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm text-ink-dim">Schedule</label>
              <button type="button" onClick={() => setSchedule([...schedule, { time_label: "", title: "", order: schedule.length }])} className="text-sm text-lilac">+ Add row</button>
            </div>
            {schedule.map((s, i) => (
              <div key={i} className="mb-2 grid grid-cols-[100px_1fr_auto] gap-2">
                <input placeholder="10:00 AM" value={s.time_label} onChange={(e) => { const n = [...schedule]; n[i].time_label = e.target.value; setSchedule(n); }} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm" />
                <input placeholder="Session title" value={s.title} onChange={(e) => { const n = [...schedule]; n[i].title = e.target.value; setSchedule(n); }} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm" />
                <button type="button" onClick={() => setSchedule(schedule.filter((_, j) => j !== i))} className="text-rose">✕</button>
              </div>
            ))}
          </div>

          {typeof editing === "number" && (
            <p className="text-xs text-ink-faint">{regCounts[editing] ?? 0} registration(s) via the shareable link.</p>
          )}

          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary !py-2 text-sm">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="btn !py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="glass overflow-x-auto p-2">
        <table className="w-full min-w-[560px] text-sm">
          <thead><tr className="text-left text-ink-faint"><th className="p-3">Title</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} className="border-t border-white/5">
                <td className="p-3">{ev.title}{ev.is_featured && <span className="chip chip-live ml-2">Featured</span>}</td>
                <td className="p-3 text-ink-dim">{new Date(ev.event_date).toLocaleDateString()}</td>
                <td className="p-3 capitalize text-ink-dim">{ev.status}</td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(ev)} className="mr-3 text-xs text-lilac">Edit</button>
                  <button onClick={() => remove(ev.id)} className="text-xs text-rose">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
