"use client";

import { useEffect, useState } from "react";

function diff(target: string) {
  const total = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    total,
    days: Math.floor(total / 86400000),
    hours: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export default function Countdown({ target }: { target: string }) {
  const [d, setD] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setD(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "Days", value: d.days },
    { label: "Hours", value: d.hours },
    { label: "Min", value: d.minutes },
    { label: "Sec", value: d.seconds },
  ];

  return (
    <div className="flex gap-3">
      {units.map((u) => (
        <div key={u.label} className="glass min-w-[64px] px-3 py-2.5 text-center">
          <div className="font-display text-2xl font-semibold iris-text">
            {String(u.value).padStart(2, "0")}
          </div>
          <div className="mt-0.5 text-[.65rem] uppercase tracking-[.15em] text-ink-faint">{u.label}</div>
        </div>
      ))}
    </div>
  );
}
