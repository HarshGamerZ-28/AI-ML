"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, Member } from "@/lib/api";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import Reveal from "@/components/Reveal";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAdminAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { api.member(id).then(setMember).catch(() => setNotFound(true)); }, [id]);

  if (notFound) {
    return (
      <div className="pt-48 text-center">
        <p className="text-ink-faint">That member couldn&apos;t be found.</p>
        <Link href="/#team" className="btn btn-primary mt-6 inline-flex">Back to team</Link>
      </div>
    );
  }
  if (!member) return <div className="pt-48 text-center text-ink-faint">Loading…</div>;

  const skills = (member.skills || "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="pb-28 pt-40">
      <div className="mx-auto w-[90%] max-w-4xl">
        <Link href="/#team" className="text-sm text-ink-faint hover:text-ink-dim">← Back to team</Link>

        <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
          {/* photo card */}
          <Reveal className="glass flex flex-col items-center p-7 text-center">
            <div className="grid h-32 w-32 place-items-center rounded-full bg-iris font-display text-4xl text-[#1b1229]">
              {initials(member.name)}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <h1 className="font-display text-xl">{member.name}</h1>
              {isAdmin && member.is_admin && <span className="chip border-lilac/50 text-lilac">Admin</span>}
            </div>
            <p className="mt-1 text-lilac">{member.role}</p>
            <p className="mt-1 text-sm text-ink-faint">{member.branch} · {member.year}</p>

            {(member.email || member.github_url || member.linkedin_url) && (
              <div className="mt-5 flex gap-2">
                {member.email && (
                  <a href={`mailto:${member.email}`} aria-label="Email" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 transition-colors hover:border-lilac hover:text-lilac">✉</a>
                )}
                {member.github_url && (
                  <a href={member.github_url} target="_blank" aria-label="GitHub" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 transition-colors hover:border-lilac hover:text-lilac">GH</a>
                )}
                {member.linkedin_url && (
                  <a href={member.linkedin_url} target="_blank" aria-label="LinkedIn" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 transition-colors hover:border-lilac hover:text-lilac">in</a>
                )}
              </div>
            )}
          </Reveal>

          {/* details */}
          <div className="grid gap-4">
            <Reveal delay={0.05} className="glass p-6">
              <h2 className="mb-4 text-sm uppercase tracking-[.1em] text-ink-faint">Professional details</h2>
              <dl className="grid grid-cols-2 gap-y-4 text-sm sm:grid-cols-3">
                <div><dt className="text-ink-faint">Role</dt><dd className="mt-0.5">{member.role}</dd></div>
                <div><dt className="text-ink-faint">Branch</dt><dd className="mt-0.5">{member.branch || "—"}</dd></div>
                <div><dt className="text-ink-faint">Year</dt><dd className="mt-0.5">{member.year || "—"}</dd></div>
                <div><dt className="text-ink-faint">Team</dt><dd className="mt-0.5">{member.is_core ? "Core team" : "General member"}</dd></div>
                <div><dt className="text-ink-faint">Joined</dt><dd className="mt-0.5">{new Date(member.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</dd></div>
              </dl>
            </Reveal>

            <Reveal delay={0.1} className="glass p-6">
              <h2 className="mb-3 text-sm uppercase tracking-[.1em] text-ink-faint">About</h2>
              <p className="text-ink-dim">{member.bio || "No bio yet."}</p>
            </Reveal>

            <Reveal delay={0.15} className="glass p-6">
              <h2 className="mb-3 text-sm uppercase tracking-[.1em] text-ink-faint">Skills</h2>
              {skills.length ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => <span key={s} className="chip">{s}</span>)}
                </div>
              ) : <p className="text-ink-faint">Not listed.</p>}
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
