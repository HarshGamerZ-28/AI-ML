"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { api, Achievement } from "@/lib/api";
import ApprovalRow from "@/components/ApprovalRow";

export default function AdminAchievementsPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<Achievement[]>([]);

  function load() { api.achievements({ status: "all" }).then(setItems); }
  useEffect(load, []);

  async function review(id: number, status: "approved" | "rejected") {
    if (!token) return;
    await api.updateAchievement(token, id, { status });
    load();
  }
  async function remove(id: number) {
    if (!token || !confirm("Delete this achievement?")) return;
    await api.deleteAchievement(token, id);
    load();
  }

  const pending = items.filter((a) => a.status === "pending");
  const reviewed = items.filter((a) => a.status !== "pending");

  return (
    <div className="grid gap-8">
      <h1 className="font-display text-3xl">Achievements</h1>

      <section>
        <h2 className="font-medium">Pending achievements</h2>
        <p className="mb-3 text-xs text-ink-faint">Verify and publish submitted achievements.</p>
        {pending.length === 0 ? (
          <p className="text-sm text-ink-faint">Nothing pending.</p>
        ) : (
          <div className="grid gap-2">
            {pending.map((a) => (
              <ApprovalRow
                key={a.id}
                name={a.member_name}
                subtitle={a.title}
                tag={a.category}
                meta={a.year}
                onApprove={() => review(a.id, "approved")}
                onReject={() => review(a.id, "rejected")}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium">All achievements ({reviewed.length})</h2>
        <div className="grid gap-2">
          {reviewed.map((a) => (
            <div key={a.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{a.badge_icon} {a.title}</p>
                <p className="text-xs text-ink-faint">{a.member_name} · {a.category}{a.year ? ` · ${a.year}` : ""}</p>
              </div>
              <button onClick={() => remove(a.id)} className="text-sm text-ink-faint hover:text-rose">Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
