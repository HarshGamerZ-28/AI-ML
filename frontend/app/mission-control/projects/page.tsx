"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { api, Project } from "@/lib/api";

const empty = { title: "", description: "", category: "General", tech_stack: "", is_live: false, repo_url: "", demo_url: "" };

export default function AdminProjectsPage() {
  const { token } = useAdminAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<number | "new" | null>(null);

  function load() { api.projects().then(setProjects); }
  useEffect(load, []);

  function openEdit(p?: Project) {
    if (!p) { setForm(empty); setEditing("new"); return; }
    setForm({
      title: p.title, description: p.description || "", category: p.category,
      tech_stack: p.tech_stack || "", is_live: p.is_live, repo_url: p.repo_url || "", demo_url: p.demo_url || "",
    });
    setEditing(p.id);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (editing === "new") await api.createProject(token, form);
    else await api.updateProject(token, editing as number, form);
    setEditing(null);
    load();
  }

  async function remove(id: number) {
    if (!token || !confirm("Delete this project?")) return;
    await api.deleteProject(token, id);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Projects</h1>
        <button onClick={() => openEdit()} className="btn btn-primary !py-2 text-sm">New project</button>
      </div>

      {editing !== null && (
        <form onSubmit={save} className="glass mb-8 grid gap-3 p-6">
          <div className="field"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Vision</option><option>NLP</option><option>Data</option><option>MLOps</option><option>General</option>
              </select>
            </div>
            <div className="field"><label>Tech stack (comma-separated)</label><input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Repo URL</label><input value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} /></div>
            <div className="field"><label>Demo URL</label><input value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-dim">
            <input type="checkbox" checked={form.is_live} onChange={(e) => setForm({ ...form, is_live: e.target.checked })} className="!w-auto" /> Live / deployed
          </label>
          <div className="flex gap-2">
            <button className="btn btn-primary !py-2 text-sm">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="btn !py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-2">
        {projects.map((p) => (
          <div key={p.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{p.title} {p.is_live && <span className="chip chip-live ml-2">Live</span>}</p>
              <p className="text-xs text-ink-faint">{p.category} · {p.tech_stack}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openEdit(p)} className="text-xs text-lilac">Edit</button>
              <button onClick={() => remove(p.id)} className="text-xs text-rose">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
