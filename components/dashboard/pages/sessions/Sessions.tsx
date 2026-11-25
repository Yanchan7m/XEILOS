"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { sb } from "@/lib/supabase";
import { dollars, duree, hhmm, lireBilans, type CompteRendu, type SessionScalp } from "@/lib/sessions-scalping";
import FenetreCompteRendu from "@/components/scalping/FenetreCompteRendu";

/* Mes sessions de scalping, comme l'onglet du Journal Axone : chaque session, son compte
   rendu (à faire ou à revoir), et les moyennes en haut. */

const carte = "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5";

export default function Sessions() {
  const [auth, setAuth] = useState<Session | null | undefined>(undefined);
  const [sessions, setSessions] = useState<SessionScalp[]>([]);
  const [bilans, setBilans] = useState<CompteRendu[]>([]);
  const [ouverte, setOuverte] = useState<SessionScalp | null>(null);

  useEffect(() => { sb().auth.getSession().then(({ data }) => setAuth(data.session)); }, []);

  const charger = useCallback(async (uid: string) => {
    const { data } = await sb().from("journal_axone_docs").select("data").eq("user_id", uid).eq("coll", "settings").eq("doc_id", "scalp").maybeSingle();
    setSessions(((data?.data as { sessions?: SessionScalp[] } | undefined)?.sessions ?? []).filter((s) => s && s.start));
    setBilans(await lireBilans(uid));
  }, []);

  useEffect(() => { if (auth) void charger(auth.user.id); }, [auth, charger]);

  if (auth === undefined) return <div className="text-[13px] text-white/40">Chargement…</div>;
  if (!auth) return (
    <div className={`${carte} max-w-md text-[13.5px] text-white/70`}>
      Connecte-toi d&apos;abord dans <Link href="/dashboard/notifications" className="text-[var(--accent)] underline">Notifications</Link> pour retrouver tes sessions.
    </div>
  );

  const bilanDe = (s: SessionScalp) => bilans.find((b) => b.start === s.start);
  const crs = sessions.map(bilanDe).filter(Boolean) as CompteRendu[];
  const notes = crs.map((c) => Number(c.note)).filter((n) => n > 0);
  const emos: Record<string, number> = {}; crs.forEach((c) => { if (c.emotion) emos[c.emotion] = (emos[c.emotion] || 0) + 1; });
  const emo = Object.entries(emos).sort((a, b) => b[1] - a[1])[0];
  const plans = crs.filter((c) => c.plan);
  const tot = sessions.reduce((x, s) => x + (s.pnl || 0), 0);
  const stats: [string, React.ReactNode][] = [
    ["Sessions", sessions.length],
    ["P&L total", <span key="p" className={tot > 0 ? "text-emerald-400" : tot < 0 ? "text-red-400" : ""}>{dollars(tot)}</span>],
    ["Comptes rendus", `${crs.length} / ${sessions.length}`],
    ["Note moyenne", notes.length ? `${(notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1)} / 10` : "—"],
    ["Plan respecté", plans.length ? `${Math.round(plans.filter((c) => c.plan === "Oui").length / plans.length * 100)} %` : "—"],
    ["Émotion la plus fréquente", emo ? emo[0] : "—"],
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
            <div className="text-[11px] text-white/45">{k}</div>
            <div className="mt-0.5 text-[17px] font-semibold text-white">{v}</div>
          </div>
        ))}
      </div>

      {!sessions.length && (
        <div className={`${carte} text-[13px] text-white/55`}>
          Aucune session pour l&apos;instant. Allume le mode scalping dans Notifications quand tu trades, puis coupe-le à la fin : le compte rendu s&apos;ouvre.
        </div>
      )}

      <div className="space-y-2">
        {sessions.map((s) => {
          const c = bilanDe(s), d = new Date(s.start);
          const puces = c ? [c.ressenti, c.note && `${c.note}/10`, c.plan && `Plan : ${c.plan}`, c.emotion, c.hors && c.hors !== "Non" && `Hors plan : ${c.hors}`].filter(Boolean) as string[] : [];
          const textes = c ? ([["Meilleure décision", c.bien], ["Erreur principale", c.erreur], ["Je change", c.change]] as const).filter(([, v]) => v) : [];
          return (
            <div key={s.start} className={`${carte} space-y-2`}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <b className="capitalize text-white">{d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</b>
                <span className="text-[12px] text-white/45">{hhmm(d)} → {hhmm(new Date(s.end || s.start))} · {duree((s.end || s.start) - s.start)} · {s.trades || 0} trade{(s.trades || 0) > 1 ? "s" : ""}</span>
                <b className={(s.pnl || 0) > 0 ? "text-emerald-400" : (s.pnl || 0) < 0 ? "text-red-400" : "text-white/70"}>{dollars(s.pnl || 0)}</b>
                <span className="flex-1" />
                <button onClick={() => setOuverte(s)}
                  className={c ? "rounded-lg border border-white/[0.12] px-3 py-1.5 text-[12.5px] text-white/75 hover:bg-white/[0.04]" : "rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[12.5px] font-medium text-black"}>
                  {c ? "Revoir / modifier" : "Faire le compte rendu"}
                </button>
              </div>
              {puces.length > 0 && (
                <div className="flex flex-wrap gap-1.5">{puces.map((p) => <span key={p} className="rounded-full border border-white/[0.1] px-2.5 py-0.5 text-[12px] text-white/75">{p}</span>)}</div>
              )}
              {textes.map(([k, v]) => <div key={k} className="text-[12.5px] text-white/55"><b className="font-medium text-white/85">{k} :</b> {v}</div>)}
            </div>
          );
        })}
      </div>

      {ouverte && (
        <FenetreCompteRendu userId={auth.user.id} session={ouverte} avant={bilanDe(ouverte)}
          onFerme={(ok) => { setOuverte(null); if (ok) void charger(auth.user.id); }} />
      )}
    </div>
  );
}
