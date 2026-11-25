"use client";

import { useEffect, useState } from "react";
import {
  compterSession, dollars, duree, EMOTIONS, enregistrerBilan, HORS, iso, NOTES, PLANS, RESSENTIS,
  type CompteRendu, type SessionScalp,
} from "@/lib/sessions-scalping";

/* Le compte rendu de fin de session, comme dans le Journal Axone : tout est facultatif,
   « Enregistrer » enregistre toujours, « Plus tard » ferme (la session reste dans Mes sessions). */

const champ = "w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--accent)]";

function Pastilles({ choix, valeur, onChange, gros }: { choix: string[]; valeur?: string; onChange: (v?: string) => void; gros?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {choix.map((c) => (
        <button key={c} type="button" aria-pressed={valeur === c} onClick={() => onChange(valeur === c ? undefined : c)}
          className={`rounded-full border px-3 py-1 ${gros ? "text-[20px]" : "text-[12.5px]"} ${valeur === c ? "border-[var(--accent)] bg-[var(--accent)] text-black" : "border-white/[0.12] text-white/75 hover:bg-white/[0.05]"}`}>
          {c}
        </button>
      ))}
    </div>
  );
}

export default function FenetreCompteRendu({ userId, session, avant, onFerme }: {
  userId: string; session: SessionScalp; avant?: CompteRendu; onFerme: (enregistre: boolean) => void;
}) {
  const [cr, setCr] = useState<CompteRendu>(() => ({ ...avant, start: session.start }));
  const [gain, setGain] = useState(avant?.gain != null ? String(avant.gain) : session.trades ? String(session.pnl ?? "") : "");
  const [compte, setCompte] = useState<{ gagnes: number; perdus: number } | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => { void compterSession(userId, session).then(setCompte); }, [userId, session]);
  const maj = (k: keyof CompteRendu) => (v?: string) => setCr((x) => ({ ...x, [k]: v }));

  const enregistrer = async () => {
    setOccupe(true); setErreur("");
    const g = gain.trim().replace(",", ".");
    const { error } = await enregistrerBilan(userId, {
      ...cr, id: avant?.id, date: iso(new Date(session.start)), start: session.start, end: session.end, trades: session.trades ?? 0,
      gagnes: compte?.gagnes ?? avant?.gagnes ?? 0, perdus: compte?.perdus ?? avant?.perdus ?? 0, pnl: session.pnl ?? 0,
      gain: g === "" || !isFinite(Number(g)) ? null : Number(g), unite: cr.unite ?? "$",
      bien: (cr.bien ?? "").trim(), erreur: (cr.erreur ?? "").trim(), change: (cr.change ?? "").trim(),
      createdAt: avant?.createdAt ?? Date.now(), updatedAt: Date.now(),
    });
    setOccupe(false);
    if (error) setErreur("Non enregistré : " + error.message); else onFerme(true);
  };

  const q = "space-y-1.5 text-[13px] font-medium text-white/85";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center" onClick={() => onFerme(false)}>
      <div className="max-h-[92dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#121216] p-5" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[17px] font-semibold text-white">Compte rendu de ta session</div>
            <div className="mt-1 text-[12px] text-white/50">
              {duree((session.end || session.start) - session.start)} · {session.trades ?? 0} trade{(session.trades ?? 0) > 1 ? "s" : ""}
              {compte ? ` · ${compte.gagnes}G ${compte.perdus}P` : ""} · {dollars(session.pnl ?? 0)}. Tout est facultatif.
            </div>
          </div>
          <button className="text-white/40 hover:text-white" onClick={() => onFerme(false)} aria-label="Fermer sans enregistrer">✕</button>
        </div>

        <div className={q}>Comment tu t&apos;es senti ?<Pastilles gros choix={RESSENTIS} valeur={cr.ressenti} onChange={maj("ressenti")} /></div>
        <div className={q}>Combien as-tu gagné (ou perdu) ?
          <div className="flex items-center gap-2"><input className={champ} inputMode="decimal" value={gain} onChange={(e) => setGain(e.target.value)} /><span className="text-white/50">$</span></div>
        </div>
        <div className={q}>As-tu respecté ton plan ?<Pastilles choix={PLANS} valeur={cr.plan} onChange={maj("plan")} /></div>
        <div className={q}>L&apos;émotion qui a dominé<Pastilles choix={EMOTIONS} valeur={cr.emotion} onChange={maj("emotion")} /></div>
        <div className={q}>Ta note de la session<Pastilles choix={NOTES} valeur={cr.note} onChange={maj("note")} /></div>
        <div className={q}>As-tu pris un trade hors de ton plan ?<Pastilles choix={HORS} valeur={cr.hors} onChange={maj("hors")} /></div>
        {([["bien", "Ta meilleure décision"], ["erreur", "Ton erreur principale"], ["change", "Ce que tu changes la prochaine fois"]] as const).map(([k, l]) => (
          <label key={k} className={`${q} block`}>{l}
            <textarea className={`${champ} min-h-[60px]`} value={(cr[k] as string) ?? ""} onChange={(e) => setCr((x) => ({ ...x, [k]: e.target.value }))} />
          </label>
        ))}

        {erreur && <div className="text-[12.5px] text-red-400">{erreur}</div>}
        <div className="flex flex-wrap justify-end gap-2">
          <button className="rounded-xl border border-white/[0.12] px-4 py-2.5 text-[13.5px] text-white/80 hover:bg-white/[0.04]" onClick={() => onFerme(false)}>Plus tard</button>
          <button className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-[13.5px] font-medium text-black disabled:opacity-40" disabled={occupe} onClick={() => void enregistrer()}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
