"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { api, JoinRequestItem, UpdateRequestItem, Member } from "@/lib/api";
import ApprovalRow from "@/components/ApprovalRow";

export default function AdminMembersPage() {
  const { token } = useAdminAuth();
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([]);
  const [updateRequests, setUpdateRequests] = useState<UpdateRequestItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  function load() {
    if (!token) return;
    api.joinRequests(token, "pending").then(setJoinRequests);
    api.updateRequests(token, "pending").then(setUpdateRequests);
    api.members().then(setMembers);
  }
  useEffect(load, [token]);

  async function reviewJoin(id: number, status: "approved" | "rejected") {
    if (!token) return;
    await api.updateJoinStatus(token, id, status);
    load();
  }
  async function reviewUpdate(id: number, status: "approved" | "rejected") {
    if (!token) return;
    await api.reviewUpdateRequest(token, id, status);
    load();
  }
  async function toggleAdmin(m: Member) {
    if (!token) return;
    await api.updateMember(token, m.id, { is_admin: !m.is_admin });
    load();
  }
  async function removeMember(id: number) {
    if (!token || !confirm("Remove this member?")) return;
    await api.deleteMember(token, id);
    load();
  }

  return (
    <div className="grid gap-8">
      <h1 className="font-display text-3xl">Members</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-medium">Pending join requests</h2>
          <p className="mb-3 text-xs text-ink-faint">Review and approve new member registrations.</p>
          {joinRequests.length === 0 ? (
            <p className="text-sm text-ink-faint">Nothing pending.</p>
          ) : (
            <div className="grid gap-2">
              {joinRequests.map((r) => (
                <ApprovalRow
                  key={r.id}
                  name={r.name}
                  subtitle={`${r.branch || "—"} · ${r.year || "—"}`}
                  meta={`Requested ${new Date(r.created_at).toLocaleDateString()}`}
                  onApprove={() => reviewJoin(r.id, "approved")}
                  onReject={() => reviewJoin(r.id, "rejected")}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-medium">Pending profile updates</h2>
          <p className="mb-3 text-xs text-ink-faint">Verify and publish member-submitted changes.</p>
          {updateRequests.length === 0 ? (
            <p className="text-sm text-ink-faint">Nothing pending.</p>
          ) : (
            <div className="grid gap-2">
              {updateRequests.map((r) => {
                const member = members.find((m) => m.id === r.member_id);
                const changes = JSON.parse(r.payload_json);
                const fields = Object.keys(changes).join(", ");
                return (
                  <ApprovalRow
                    key={r.id}
                    name={member?.name || `Member #${r.member_id}`}
                    subtitle={`Updating: ${fields}`}
                    meta={r.note ? `"${r.note}"` : undefined}
                    onApprove={() => reviewUpdate(r.id, "approved")}
                    onReject={() => reviewUpdate(r.id, "rejected")}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-1 font-medium">All members ({members.length})</h2>
        <p className="mb-3 text-xs text-ink-faint">The Admin tag here is only ever visible to logged-in admins — never to the public.</p>
        <div className="glass overflow-x-auto p-2">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-ink-faint">
                <th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Branch / Year</th>
                <th className="p-3">Admin</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-white/5 transition-colors hover:bg-white/[0.03]">
                  <td className="p-3">
                    <Link href={`/mission-control/members/${m.id}`} className="hover:text-lilac">{m.name}</Link>
                  </td>
                  <td className="p-3 text-ink-dim">{m.role}</td>
                  <td className="p-3 text-ink-dim">{m.branch} · {m.year}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleAdmin(m)}
                      className={`rounded-full px-3 py-1 text-xs ${m.is_admin ? "bg-lilac/20 text-lilac" : "bg-white/5 text-ink-faint"}`}
                    >
                      {m.is_admin ? "Admin" : "Make admin"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => removeMember(m.id)} className="text-xs text-rose">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
