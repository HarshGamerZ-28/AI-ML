"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { api, GalleryItem, EventItem } from "@/lib/api";

type Mode = "single" | "zip" | "link";

export default function AdminGalleryPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [mode, setMode] = useState<Mode>("single");

  const [file, setFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [eventId, setEventId] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  function load() {
    api.gallery().then(setItems);
    api.events().then(setEvents);
  }
  useEffect(load, []);

  async function uploadSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !file) return;
    setBusy(true); setResult(null);
    const form = new FormData();
    form.append("file", file);
    if (eventId) form.append("event_id", eventId);
    if (caption) form.append("caption", caption);
    form.append("year", String(new Date().getFullYear()));
    try {
      await api.uploadGallery(token, form);
      setFile(null); setCaption(""); setEventId("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function uploadZip(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !zipFile) return;
    setBusy(true); setResult(null);
    const form = new FormData();
    form.append("file", zipFile);
    if (eventId) form.append("event_id", eventId);
    form.append("year", String(new Date().getFullYear()));
    try {
      const r = await api.bulkUploadGalleryZip(token, form);
      setResult(`Imported ${r.imported} file(s)${r.skipped ? `, skipped ${r.skipped} non-media file(s)` : ""}.`);
      setZipFile(null);
      load();
    } catch (err: any) {
      setResult(err.message || "That zip couldn't be imported.");
    } finally {
      setBusy(false);
    }
  }

  async function importFromLink(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !link) return;
    setBusy(true); setResult(null);
    try {
      const r = await api.bulkUploadGalleryFromUrl(token, {
        url: link, event_id: eventId ? Number(eventId) : undefined, year: String(new Date().getFullYear()),
      });
      setResult(`Imported ${r.imported} file(s)${r.skipped ? `, skipped ${r.skipped} non-media file(s)` : ""}.`);
      setLink("");
      load();
    } catch (err: any) {
      setResult(err.message || "Couldn't import from that link.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!token || !confirm("Delete this item?")) return;
    await api.deleteGallery(token, id);
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Gallery</h1>

      <div className="glass mb-8 p-6">
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm">
          {(["single", "zip", "link"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); }}
              className={`rounded-full px-4 py-1.5 transition-colors ${mode === m ? "bg-white/10 text-white" : "text-ink-faint"}`}
            >
              {m === "single" ? "Single file" : m === "zip" ? "Zip of files" : "Paste a link"}
            </button>
          ))}
        </div>

        <div className="field mb-3"><label>Event (optional)</label>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">None</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
        </div>

        {mode === "single" && (
          <form onSubmit={uploadSingle} className="grid gap-3 sm:grid-cols-2">
            <div className="field sm:col-span-2"><label>File (image or video)</label>
              <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
            </div>
            <div className="field sm:col-span-2"><label>Caption (optional)</label><input value={caption} onChange={(e) => setCaption(e.target.value)} /></div>
            <button className="btn btn-primary !py-2 text-sm sm:col-span-2 justify-center" disabled={busy}>
              {busy ? "Uploading…" : "Upload"}
            </button>
          </form>
        )}

        {mode === "zip" && (
          <form onSubmit={uploadZip} className="grid gap-3">
            <p className="text-xs text-ink-faint">
              Upload a .zip of photos and videos — every image/video inside is added to the gallery
              automatically. Other file types in the zip are skipped.
            </p>
            <div className="field"><label>Zip file</label>
              <input type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files?.[0] || null)} required />
            </div>
            <button className="btn btn-primary !py-2 justify-center text-sm" disabled={busy}>
              {busy ? "Importing…" : "Import zip"}
            </button>
          </form>
        )}

        {mode === "link" && (
          <form onSubmit={importFromLink} className="grid gap-3">
            <p className="text-xs text-ink-faint">
              Paste a direct download link, or a Google Drive share link, to a single <b>.zip</b> file
              of photos/videos. This imports one shared zip file — it can&apos;t browse an entire Drive
              folder (that needs the Drive API). For Drive, set sharing to &quot;Anyone with the link&quot;
              and keep the zip small enough to skip Drive&apos;s virus-scan warning page — otherwise
              download it yourself and use the Zip tab instead.
            </p>
            <div className="field"><label>Link</label>
              <input required type="url" placeholder="https://drive.google.com/file/d/…/view" value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <button className="btn btn-primary !py-2 justify-center text-sm" disabled={busy}>
              {busy ? "Fetching…" : "Import from link"}
            </button>
          </form>
        )}

        {result && <p className="mt-3 text-sm text-ink-dim">{result}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="glass relative aspect-square overflow-hidden">
            {item.type === "image" ? (
              <Image src={item.url} alt={item.caption || ""} fill className="object-cover" unoptimized />
            ) : (
              <video src={item.url} className="h-full w-full object-cover" muted />
            )}
            <button onClick={() => remove(item.id)} className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-2 py-1 text-xs text-rose">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
