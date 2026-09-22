"use client";

import { useEffect, useMemo, useState } from "react";
import { onAnswer, type AnswerEvent } from "@/lib/demo-events";

/**
 * Écran « côté école » : se remplit en direct pendant que l'apprenant répond.
 * C'est la contrepartie des bénéfices annoncés sur la page d'accueil (suivi
 * temps réel, modules les moins compris, alerte décrochage).
 */
export default function TeacherDashboard() {
  const [events, setEvents] = useState<AnswerEvent[]>([]);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const off = onAnswer((e) => {
      setEvents((prev) => [...prev, e]);
      setFlash(true);
      clearTimeout(timer);
      timer = setTimeout(() => setFlash(false), 700);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);

  const stats = useMemo(() => {
    const total = events.length;
    const correct = events.filter((e) => e.correct).length;
    const byModule = new Map<string, { correct: number; total: number }>();
    for (const e of events) {
      const cur = byModule.get(e.module) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (e.correct) cur.correct += 1;
      byModule.set(e.module, cur);
    }
    const modules = Array.from(byModule.entries())
      .map(([module, s]) => ({
        module,
        ...s,
        pct: Math.round((s.correct / s.total) * 100),
      }))
      .sort((a, b) => a.pct - b.pct);

    // Deux erreurs de suite = signal de décrochage, comme dans le vrai suivi.
    const tail = events.slice(-2);
    const atRisk = tail.length === 2 && tail.every((e) => !e.correct);

    return {
      total,
      correct,
      pct: total ? Math.round((correct / total) * 100) : 0,
      modules,
      atRisk,
      weakest: modules[0],
    };
  }, [events]);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[#0b1120] p-6 text-white shadow-sm sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
            Espace formateur · temps réel
          </div>
          <h3 className="mt-1 text-xl font-semibold">Suivi de la session</h3>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-widest">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              flash ? "bg-[#22c55e]" : "live-dot bg-[#22c55e]"
            }`}
          />
          {stats.total === 0 ? "En attente" : "Connecté"}
        </span>
      </div>

      {stats.total === 0 ? (
        <p className="mt-6 text-sm text-white/50">
          Réponds à une question au-dessus : le tableau de bord de l&apos;école se
          remplit ici, question par question.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Tile label="Réponses" value={String(stats.total)} />
            <Tile label="Réussite" value={`${stats.pct} %`} accent={stats.pct >= 60} />
            <Tile label="Modules vus" value={String(stats.modules.length)} />
          </div>

          <div className="mt-6 space-y-3">
            {stats.modules.map((m) => (
              <div key={m.module}>
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>{m.module}</span>
                  <span className="tabular-nums">
                    {m.correct}/{m.total} · {m.pct} %
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${m.pct}%`,
                      background: m.pct >= 60 ? "#22c55e" : "#f59e0b",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {stats.weakest && stats.weakest.pct < 100 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              <span className="text-white/50">Module à revoir en priorité : </span>
              <strong>{stats.weakest.module}</strong>
              <span className="text-white/50">
                {" "}
                ({stats.weakest.pct} % de réussite)
              </span>
            </div>
          )}

          {stats.atRisk && (
            <div className="fade-up mt-3 rounded-2xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-4 text-sm text-[#fbbf24]">
              ⚠️ Deux erreurs consécutives : l&apos;apprenant serait signalé au
              formateur pour un point de suivi.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          accent ? "text-[#22c55e]" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
