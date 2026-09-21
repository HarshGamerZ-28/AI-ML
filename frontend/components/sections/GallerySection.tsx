"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { api, GalleryItem, EventItem } from "@/lib/api";
import Reveal from "@/components/Reveal";

export default function GallerySection() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState(searchParams.get("event") || "");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => { api.events().then(setEvents); }, []);

  useEffect(() => {
    api.gallery({
      event_id: eventId ? Number(eventId) : undefined,
      year: year || undefined,
      type: type || undefined,
    }).then(setItems);
  }, [eventId, year, type]);

  const years = Array.from(new Set(items.map((i) => i.year).filter(Boolean))) as string[];

  return (
    <section id="gallery" className="scroll-mt-28 py-24">
      <div className="mx-auto w-[90%] max-w-[1180px]">
        <Reveal className="mb-8 max-w-2xl">
          <span className="eyebrow">Gallery</span>
          <h2 className="font-display text-4xl">Moments from every gathering</h2>
          <p className="mt-3 text-ink-dim">Photos and clips from workshops, hackathons and demo days.</p>
        </Reveal>

        <Reveal delay={0.05} className="mb-8 flex flex-wrap gap-3">
          <select className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">All events</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
          <select className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">All years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Photos & videos</option>
            <option value="image">Photos only</option>
            <option value="video">Videos only</option>
          </select>
          {(eventId || year || type) && (
            <button onClick={() => { setEventId(""); setYear(""); setType(""); }} className="text-sm text-ink-faint hover:text-ink-dim">
              Reset filters
            </button>
          )}
        </Reveal>

        {items.length === 0 ? (
          <p className="text-ink-faint">No media found for these filters.</p>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={(i % 8) * 0.03} className="mb-3 break-inside-avoid">
                <button onClick={() => setLightbox(item)} className="glass block w-full overflow-hidden">
                  {item.type === "image" ? (
                    <Image src={item.url} alt={item.caption || ""} width={400} height={300} className="h-auto w-full object-cover" unoptimized />
                  ) : (
                    <video src={item.url} className="h-auto w-full" muted />
                  )}
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[150] grid place-items-center bg-black/80 p-6 backdrop-blur-md" onClick={() => setLightbox(null)}>
          <div className="max-h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {lightbox.type === "image" ? (
              <img src={lightbox.url} alt={lightbox.caption || ""} className="max-h-[85vh] rounded-2xl object-contain" />
            ) : (
              <video src={lightbox.url} controls autoPlay className="max-h-[85vh] rounded-2xl" />
            )}
            {lightbox.caption && <p className="mt-3 text-center text-sm text-ink-dim">{lightbox.caption}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
