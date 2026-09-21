"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EventItem } from "@/lib/api";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function ZigzagTimeline({ events }: { events: EventItem[] }) {
  return (
    <div className="relative mx-auto max-w-4xl">
      {/* connecting spine */}
      <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-rose via-lilac to-mint md:block" />

      <div className="flex flex-col gap-10 md:gap-16">
        {events.map((ev, i) => {
          const fromLeft = i % 2 === 0;
          return (
            <div key={ev.id} className="relative grid grid-cols-1 items-center gap-4 md:grid-cols-2">
              {/* node on the spine */}
              <div className="absolute left-1/2 top-1/2 z-10 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-lilac bg-void shadow-[0_0_16px_rgba(201,182,255,.9)] md:block" />

              <motion.div
                initial={{ opacity: 0, x: fromLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
                transition={{ duration: 0.7, ease: [0.22, 0.68, 0.24, 1] }}
                className={fromLeft ? "md:col-start-1" : "md:col-start-2"}
              >
                <Link
                  href={`/events/${ev.slug}`}
                  className={`glass block p-6 transition-transform hover:-translate-y-1 ${fromLeft ? "md:mr-8" : "md:ml-8"}`}
                >
                  <span className={`chip ${ev.status === "upcoming" ? "chip-live" : ""}`}>
                    {ev.status === "upcoming" ? "Upcoming" : "Past"}
                  </span>
                  <h3 className="mt-3 font-display text-xl">{ev.title}</h3>
                  <p className="mt-1 text-sm text-ink-faint">{fmtDate(ev.event_date)} — {ev.location}</p>
                  <span className="mt-3 inline-block text-sm text-lilac">View details →</span>
                </Link>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
