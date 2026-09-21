"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { api, Notice } from "@/lib/api";

const empty = { title: "", body: "", category: "Announcement", status: "open", attachment_url: "" };

export default function AdminNoticesPage() {
  const { token } = useAdminAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [uploading, setUploading] = useState(false);

  function load() { api.notices().then(setNotices); }
  useEffect(load, []);

  function openEdit(n?: Notice) {
    if (!n) { setForm(empty); setEditing("new"); return; }
    setForm({ title: n.title, body: n.body, category: n.category, status: n.status, attachment_url: n.attachment_url || "" });
    setEditing(n.id);
  }

  async function onPickPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const form2 = new FormData();
      form2.append("file", file);
      const { url } = await api.uploadNoticeAttachment(token, form2);
      setForm((f: any) => ({ ...f, attachment_url: url }));
    } catch (err: any) {
      alert(err.message || "Upload failed — only PDFs are supported.");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (editing === "new") await api.createNotice(token, form);
    else await api.updateNotice(token, editing as number, form);
    setEditing(null);
    load();
  }

  async function remove(id: number) {
    if (!token || !confirm("Delete this notice?")) return;
    await api.deleteNotice(token, id);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Notices</h1>
        <button onClick={() => openEdit()} className="btn btn-primary !py-2 text-sm">New notice</button>
      </div>

      {editing !== null && (
        <form onSubmit={save} className="glass mb-8 grid gap-3 p-6">
          <div className="field"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label>Body</label><textarea required rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Announcement</option><option>Meeting</option><option>Deadline</option><option>Workshop</option>
              </select>
            </div>
            <div className="field"><label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="open">Open</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Attach a PDF (optional)</label>
            <input type="file" accept="application/pdf" onChange={onPickPdf} />
            {uploading && <p className="mt-1 text-xs text-ink-faint">Uploading…</p>}
            {form.attachment_url && !uploading && (
              <p className="mt-1 text-xs text-mint">
                Attached: {form.attachment_url.split("/").pop()}{" "}
                <button type="button" onClick={() => setForm({ ...form, attachment_url: "" })} className="ml-2 text-rose">remove</button>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary !py-2 text-sm" disabled={uploading}>Save</button>
            <button type="button" onClick={() => setEditing(null)} className="btn !py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-2">
        {notices.map((n) => (
          <div key={n.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <span className="chip mb-1">{n.category}</span>
              <p className="font-medium">{n.title}{n.attachment_url && <span className="ml-2 text-xs text-lilac">PDF</span>}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openEdit(n)} className="text-xs text-lilac">Edit</button>
              <button onClick={() => remove(n.id)} className="text-xs text-rose">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
