"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, EventItem } from "@/lib/api";
import Reveal from "@/components/Reveal";
import Countdown from "@/components/Countdown";
import ZigzagTimeline from "@/components/ZigzagTimeline";

export default function EventsSection() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [nextEvent, setNextEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    api.events().then(setEvents);
    api.nextEvent().then(setNextEvent);
  }, []);

  return (
    <section id="events" className="scroll-mt-28 py-24">
      <div className="mx-auto w-[90%] max-w-[1180px]">
        <Reveal className="mb-10 max-w-2xl">
          <span className="eyebrow">Events</span>
          <h2 className="font-display text-4xl">What&apos;s coming up, and what we&apos;ve already run</h2>
          <p className="mt-3 text-ink-dim">Open to all GEC Ajmer students. Lab sessions have capped seats, so register early.</p>
        </Reveal>

        {nextEvent && (
          <Reveal delay={0.1}>
            <div className="glass mb-16 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
              <div>
                <span className="chip chip-live mb-3">Next up</span>
                <h3 className="font-display text-2xl md:text-3xl">{nextEvent.title}</h3>
                <p className="mt-1 text-ink-faint">
                  {new Date(nextEvent.event_date).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
                  {nextEvent.location ? ` — ${nextEvent.location}` : ""}
                </p>
                <Link href={`/events/${nextEvent.slug}`} className="btn btn-primary mt-4">View details</Link>
              </div>
              <Countdown target={nextEvent.event_date} />
            </div>
          </Reveal>
        )}

        {events.length === 0 ? (
          <p className="text-ink-faint">No events yet — check back soon.</p>
        ) : (
          <ZigzagTimeline events={events} />
        )}
      </div>
    </section>
  );
}
