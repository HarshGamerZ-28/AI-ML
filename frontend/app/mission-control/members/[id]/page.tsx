"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { api, Member } from "@/lib/api";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminMemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [form, setForm] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.member(id).then((m) => {
      setMember(m);
      setForm({
        name: m.name, role: m.role, branch: m.branch || "", year: m.year || "",
        bio: m.bio || "", skills: m.skills || "", email: m.email || "",
        github_url: m.github_url || "", linkedin_url: m.linkedin_url || "",
        is_core: m.is_core, is_admin: m.is_admin,
      });
    });
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !member) return;
    await api.updateMember(token, member.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!token || !member || !confirm(`Remove ${member.name}?`)) return;
    await api.deleteMember(token, member.id);
    router.push("/mission-control/members");
  }

  if (!member || !form) return <p className="text-ink-faint">Loading…</p>;

  return (
    <div>
      <Link href="/mission-control/members" className="text-sm text-ink-faint hover:text-ink-dim">← Back to members</Link>

      <div className="mt-4 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-iris font-display text-xl text-[#1b1229]">
          {initials(member.name)}
        </div>
        <div>
          <h1 className="font-display text-2xl">{member.name}</h1>
          <p className="text-sm text-ink-faint">{member.role} · Member since {new Date(member.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <form onSubmit={save} className="glass mt-6 grid gap-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Role</label><input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="field"><label>Branch</label><input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
          <div className="field"><label>Year</label><input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
        </div>
        <div className="field"><label>Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
        <div className="field"><label>Skills (comma-separated)</label><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="field"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>GitHub URL</label><input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></div>
          <div className="field"><label>LinkedIn URL</label><input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} /></div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ink-dim">
            <input type="checkbox" checked={form.is_core} onChange={(e) => setForm({ ...form, is_core: e.target.checked })} className="!w-auto" /> Core team
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-dim">
            <input type="checkbox" checked={form.is_admin} onChange={(e) => setForm({ ...form, is_admin: e.target.checked })} className="!w-auto" /> Admin
          </label>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button className="btn btn-primary !py-2 text-sm">Save changes</button>
          <button type="button" onClick={remove} className="text-sm text-rose">Remove member</button>
          {saved && <span className="text-sm text-mint">Saved.</span>}
        </div>
      </form>

      <Link href={`/team/${member.id}`} target="_blank" className="mt-4 inline-block text-sm text-lilac">
        View public profile →
      </Link>
    </div>
  );
}
