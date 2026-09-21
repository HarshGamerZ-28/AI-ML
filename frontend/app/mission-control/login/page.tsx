"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import Reveal from "@/components/Reveal";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await login(username, password);
      router.push("/mission-control");
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[80svh] items-center justify-center px-4 pt-24">
      <Reveal className="w-full max-w-sm">
        <div className="glass p-8">
          <h1 className="font-display text-2xl">Admin access</h1>
          <p className="mt-1 text-sm text-ink-faint">Restricted to the club's core team.</p>
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div className="field"><label>Username</label><input required value={username} onChange={(e) => setUsername(e.target.value)} /></div>
            <div className="field"><label>Password</label><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <button className="btn btn-primary justify-center" disabled={busy}>{busy ? "Checking…" : "Log in"}</button>
            {err && <p className="text-sm text-rose">{err}</p>}
          </form>
        </div>
      </Reveal>
    </div>
  );
}
