"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, Notice } from "@/lib/api";
import Reveal from "@/components/Reveal";

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { api.notice(id).then(setNotice).catch(() => setNotFound(true)); }, [id]);

  if (notFound) {
    return (
      <div className="pt-48 text-center">
        <p className="text-ink-faint">That notice couldn&apos;t be found.</p>
        <Link href="/#notices" className="btn btn-primary mt-6 inline-flex">Back to notices</Link>
      </div>
    );
  }
  if (!notice) return <div className="pt-48 text-center text-ink-faint">Loading…</div>;

  return (
    <div className="pb-28 pt-40">
      <div className="mx-auto w-[90%] max-w-2xl">
        <Reveal>
          <Link href="/#notices" className="text-sm text-ink-faint hover:text-ink-dim">← Back to notices</Link>
          <span className="chip mt-6 mb-3 block w-fit">{notice.category}</span>
          <h1 className="font-display text-3xl md:text-4xl">{notice.title}</h1>
          <p className="mt-2 text-sm text-ink-faint">
            {new Date(notice.created_at).toLocaleDateString(undefined, { dateStyle: "long" })} · <span className="capitalize">{notice.status}</span>
          </p>
          <div className="glass mt-8 p-7">
            <p className="whitespace-pre-line text-ink-dim">{notice.body}</p>
            {notice.attachment_url && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${notice.attachment_url}`}
                target="_blank"
                className="btn btn-primary mt-6 inline-flex"
              >
                📄 Download PDF
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
