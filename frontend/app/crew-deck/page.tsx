"use client";

import { useState } from "react";
import { useMemberAuth } from "@/lib/MemberAuthContext";
import { api } from "@/lib/api";
import Reveal from "@/components/Reveal";

function AuthForms() {
  const { login, signup } = useMemberAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", branch: "", year: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await signup(form);
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Reveal className="mx-auto max-w-md">
      <div className="glass p-8">
        <span className="eyebrow">Member Portal</span>
        <h1 className="font-display text-2xl">{mode === "login" ? "Log in to your account" : "Create your member account"}</h1>
        <p className="mt-2 text-sm text-ink-faint">
          This is for existing club members — use it to request changes to your own profile. New here? Use the{" "}
          <a href="/#join" className="text-lilac">Join</a> page instead.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          {mode === "signup" && (
            <div className="field"><label>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          )}
          <div className="field"><label>Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>Password</label><input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="field"><label>Branch</label><input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
              <div className="field"><label>Year</label>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                  <option value="">Select</option>
                  <option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option>
                </select>
              </div>
            </div>
          )}
          <button className="btn btn-primary justify-center" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
          {err && <p className="text-sm text-rose">{err}</p>}
        </form>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 text-sm text-ink-faint hover:text-ink-dim">
          {mode === "login" ? "New account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </Reveal>
  );
}

function ProfilePanel() {
  const { member, token, logout, refresh } = useMemberAuth();
  const [form, setForm] = useState({ bio: member?.bio || "", skills: member?.skills || "", github_url: member?.github_url || "", linkedin_url: member?.linkedin_url || "" });
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setStatus("sending");
    try {
      await api.submitUpdateRequest(token, { payload: form, note });
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  if (!member) return null;

  return (
    <Reveal className="mx-auto max-w-xl">
      <div className="glass p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">Hi, {member.name.split(" ")[0]}</h1>
            <p className="text-sm text-ink-faint">{member.role} · {member.branch} · {member.year}</p>
          </div>
          <button onClick={logout} className="text-sm text-ink-faint hover:text-ink-dim">Log out</button>
        </div>

        <div className="my-6 h-px bg-white/10" />
        <h2 className="mb-1 font-medium">Request a profile update</h2>
        <p className="mb-4 text-sm text-ink-faint">Changes go to an admin for approval before they go live.</p>

        {status === "ok" ? (
          <p className="rounded-xl border border-mint/30 bg-mint/5 p-4 text-mint">
            Request sent — an admin will review it soon.
          </p>
        ) : (
          <form onSubmit={submit} className="grid gap-4">
            <div className="field"><label>Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            <div className="field"><label>Skills (comma-separated)</label><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="field"><label>GitHub URL</label><input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></div>
              <div className="field"><label>LinkedIn URL</label><input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} /></div>
            </div>
            <div className="field"><label>Note to admin (optional)</label><input value={note} onChange={(e) => setNote(e.target.value)} /></div>
            <button className="btn btn-primary justify-center" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Submit request"}
            </button>
            {status === "err" && <p className="text-sm text-rose">Something went wrong — try again.</p>}
          </form>
        )}
      </div>
    </Reveal>
  );
}

export default function PortalPage() {
  const { member, loading } = useMemberAuth();

  return (
    <div className="pb-28 pt-40">
      <div className="mx-auto w-[90%]">
        {loading ? (
          <p className="text-center text-ink-faint">Loading…</p>
        ) : member ? (
          <ProfilePanel />
        ) : (
          <AuthForms />
        )}
      </div>
    </div>
  );
}
