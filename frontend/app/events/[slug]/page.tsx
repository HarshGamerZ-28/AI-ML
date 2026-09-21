"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { api, EventDetail, GalleryItem } from "@/lib/api";
import Reveal from "@/components/Reveal";
import Countdown from "@/components/Countdown";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.event(slug).then((ev) => {
      setEvent(ev);
      api.gallery({ event_id: ev.id }).then(setGallery);
    }).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="pt-48 text-center">
        <p className="text-ink-faint">That event couldn&apos;t be found.</p>
        <Link href="/#events" className="btn btn-primary mt-6 inline-flex">Back to events</Link>
      </div>
    );
  }
  if (!event) return <div className="pt-48 text-center text-ink-faint">Loading…</div>;

  const isUpcoming = event.status === "upcoming";

  return (
    <div className="pb-28 pt-40">
      <div className="mx-auto w-[90%] max-w-[1180px]">
        <Reveal>
          <span className="chip chip-live mb-4">{isUpcoming ? "Upcoming" : "Past event"}</span>
          <h1 className="font-display text-4xl md:text-5xl">{event.title}</h1>
          <p className="mt-3 text-ink-dim">
            {new Date(event.event_date).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
            {event.location ? ` — ${event.location}` : ""}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Reveal>
              <h2 className="mb-3 font-display text-2xl">About the event</h2>
              <p className="text-ink-dim">{event.description}</p>
            </Reveal>

            {event.schedule.length > 0 && (
              <Reveal delay={0.1} className="mt-10">
                <h2 className="mb-4 font-display text-2xl">Event schedule</h2>
                <div className="relative pl-8">
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-rose via-lilac to-mint" />
                  {event.schedule.map((s) => (
                    <div key={s.id} className="glass relative mb-3 p-4">
                      <div className="absolute -left-8 top-5 h-3.5 w-3.5 rounded-full border-2 border-lilac bg-void" />
                      <div className="text-sm text-ink-faint">{s.time_label}</div>
                      <div className="font-medium">{s.title}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {gallery.length > 0 && (
              <Reveal delay={0.15} className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-2xl">Gallery highlights</h2>
                  <Link href={`/?event=${event.id}#gallery`} className="text-sm text-lilac">View full gallery →</Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.slice(0, 6).map((g) => (
                    <div key={g.id} className="glass relative aspect-square overflow-hidden">
                      {g.type === "image" ? (
                        <Image src={g.url} alt={g.caption || event.title} fill className="object-cover" unoptimized />
                      ) : (
                        <video src={g.url} className="h-full w-full object-cover" muted />
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.1}>
            <div className="glass sticky top-28 p-6">
              <dl className="grid gap-4 text-sm">
                <div><dt className="text-ink-faint">Date</dt><dd className="mt-0.5">{new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: "long" })}</dd></div>
                <div><dt className="text-ink-faint">Time</dt><dd className="mt-0.5">{new Date(event.event_date).toLocaleTimeString(undefined, { timeStyle: "short" })}</dd></div>
                <div><dt className="text-ink-faint">Location</dt><dd className="mt-0.5">{event.location || "TBA"}</dd></div>
                <div><dt className="text-ink-faint">Status</dt><dd className="mt-0.5 capitalize">{event.status}</dd></div>
              </dl>

              {isUpcoming && (
                <>
                  <div className="my-5 h-px bg-white/10" />
                  <p className="mb-2 text-sm text-ink-faint">Starts in</p>
                  <Countdown target={event.event_date} />
                  <Link href={`/register/${event.slug}`} className="btn btn-primary mt-5 w-full justify-center">
                    Register for this event
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
