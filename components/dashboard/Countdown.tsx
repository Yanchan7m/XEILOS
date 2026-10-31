"use client";

import { useEffect, useState } from "react";

/** Prochaine occurrence d'un créneau hebdomadaire (jour 0 = dimanche, heure locale). */
function nextSlot(now: Date, weekday: number, hour: number) {
  const d = new Date(now);
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7));
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

/** Compte à rebours « Dans 4 j 03 h 11 min » vers un créneau hebdomadaire. */
export default function Countdown({ weekday, hour }: { weekday: number; hour: number }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <span>&nbsp;</span>;

  const diff = nextSlot(now, weekday, hour).getTime() - now.getTime();
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span>
      Dans {d > 0 && `${d} j `}
      {pad(h)} h {pad(m)} min
    </span>
  );
}

/** « Mardi — 20 octobre 2026 », calculé côté client pour ne pas figer la date au build. */
export function Today({ serifClass }: { serifClass: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  if (!now) return <div className="h-7" />;
  const day = now.toLocaleDateString("fr-FR", { weekday: "long" });
  return (
    <div className="flex items-center gap-4">
      <span className={`${serifClass} text-2xl italic text-white/85`}>
        {day.charAt(0).toUpperCase() + day.slice(1)}
      </span>
      <span className="h-px w-6 bg-white/25" />
      <span className="text-sm text-white/80">
        {now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
      </span>
    </div>
  );
}
