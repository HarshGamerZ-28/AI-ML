"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/AdminAuthContext";

const NAV = [
  { href: "/mission-control", label: "Overview", icon: "◈" },
  { href: "/mission-control/members", label: "Members", icon: "◍" },
  { href: "/mission-control/events", label: "Events", icon: "▤" },
  { href: "/mission-control/projects", label: "Projects", icon: "◆" },
  { href: "/mission-control/achievements", label: "Achievements", icon: "◎" },
  { href: "/mission-control/gallery", label: "Gallery", icon: "▦" },
  { href: "/mission-control/notices", label: "Notices", icon: "◐" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, loading, admin, logout } = useAdminAuth();

  const isLoginPage = pathname === "/mission-control/login";

  useEffect(() => {
    if (!loading && !isAdmin && !isLoginPage) router.replace("/mission-control/login");
  }, [loading, isAdmin, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (loading || !isAdmin) return <div className="pt-48 text-center text-ink-faint">Checking access…</div>;

  return (
    <div className="mx-auto flex w-[94%] max-w-[1300px] gap-8 pb-20 pt-32">
      <aside className="glass sticky top-28 hidden h-fit w-56 shrink-0 p-4 md:block">
        <p className="mb-3 px-2 text-xs uppercase tracking-[.15em] text-ink-faint">{admin?.display_name}</p>
        <nav className="grid gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                pathname === n.href ? "bg-white/10 text-white" : "text-ink-dim hover:bg-white/5"
              }`}
            >
              <span className="text-lilac">{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="mt-3 w-full rounded-xl px-3 py-2.5 text-left text-sm text-rose hover:bg-white/5">
          ← Log out
        </button>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
