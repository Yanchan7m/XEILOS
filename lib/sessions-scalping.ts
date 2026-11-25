"use client";

import { sb } from "@/lib/supabase";

/* Sessions de scalping et comptes rendus : mêmes données que le Journal Axone
   (public/journal-axone.html dans c4march), donc ce qui est rempli d'un côté
   se voit de l'autre.
   · settings/scalp.sessions : [{ start, end, trades, pnl }] (la plus récente d'abord)
   · coll « scalp_bilans » : un compte rendu par session, retrouvé par `start`. */

export type SessionScalp = { start: number; end?: number; trades?: number; pnl?: number };
export type CompteRendu = {
  id?: string;
  date?: string; start: number; end?: number; trades?: number; gagnes?: number; perdus?: number; pnl?: number;
  ressenti?: string; gain?: number | null; unite?: string; plan?: string; emotion?: string; note?: string; hors?: string;
  bien?: string; erreur?: string; change?: string; createdAt?: number; updatedAt?: number;
};

export const RESSENTIS = ["😣", "😕", "😐", "🙂", "😄"];
export const PLANS = ["Oui", "En partie", "Non"];
export const EMOTIONS = ["Calme", "Concentré", "Stress", "Frustration", "Euphorie", "Ennui", "Peur de rater", "Envie de me refaire"];
export const NOTES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
export const HORS = ["Non", "Un", "Plusieurs"];

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
export const duree = (ms: number) => { const m = Math.max(0, Math.round(ms / 60000)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`; };
export const dollars = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} $`;

type Trade = { date?: string; time?: string; pnl?: number; example?: boolean; updatedAt?: number; sameAs?: string };

/** Gagnants / perdants d'une session, comptés comme le journal (± 5 $ = neutre, un groupe de copies = un trade). */
export async function compterSession(userId: string, s: SessionScalp) {
  const d = new Date(s.start), f = new Date(s.end || Date.now()), jour = iso(d), de = hhmm(d), a = hhmm(f);
  const { data } = await sb().from("journal_axone_docs").select("doc_id, data").eq("user_id", userId).eq("coll", "trades").eq("data->>date", jour);
  const vus = new Map<string, Trade>();
  for (const r of (data ?? []) as { doc_id: string; data: Trade }[]) {
    const t = r.data;
    if (t.example || typeof t.pnl !== "number") continue;
    if (t.time ? t.time < de || t.time > a : (t.updatedAt || 0) < s.start || (t.updatedAt || 0) > (s.end || Date.now())) continue;
    const k = t.sameAs || r.doc_id; if (!vus.has(k)) vus.set(k, t);
  }
  const ts = [...vus.values()];
  return { gagnes: ts.filter((t) => t.pnl! > 5).length, perdus: ts.filter((t) => t.pnl! < -5).length };
}

export async function lireBilans(userId: string): Promise<CompteRendu[]> {
  const { data } = await sb().from("journal_axone_docs").select("doc_id, data").eq("user_id", userId).eq("coll", "scalp_bilans");
  return ((data ?? []) as { doc_id: string; data: CompteRendu }[]).map((r) => ({ ...r.data, id: r.doc_id }));
}

export async function enregistrerBilan(userId: string, cr: CompteRendu) {
  const { id, ...data } = cr;
  return sb().from("journal_axone_docs").upsert(
    { user_id: userId, coll: "scalp_bilans", doc_id: id || crypto.randomUUID(), data, updated_at: new Date().toISOString() },
    { onConflict: "user_id,coll,doc_id" },
  );
}
