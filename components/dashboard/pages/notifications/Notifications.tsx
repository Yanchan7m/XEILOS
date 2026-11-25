"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { sb, SUPER_ADMIN, URL_SUPABASE, VAPID_PUBLIC_KEY } from "@/lib/supabase";
import { LISTES, PHRASES_DEFAUT, RYTHMES, type Liste, type PhrasesScalp } from "@/lib/phrases-scalping";

/* NOTIFICATIONS XEILOS (25/11/2026)
   · connexion avec le compte Axone (même base) ;
   · activer le push sur CE téléphone (app ajoutée à l'écran d'accueil) ;
   · le mode scalping : même interrupteur qu'Axone (settings/scalp), les rappels
     partent du serveur toutes les 2 minutes (fonction scalp-rappel) ;
   · mes phrases : settings/scalp_phrases, propres à chaque compte ;
   · admin : un message push à tous les appareils XEILOS. */

type Resultat = "loss" | "be" | "win";
type Scalp = { on?: boolean; since?: number | null; fired?: string[]; rappel?: number; sessions?: unknown[]; dernier?: { res: Resultat; at: number } } & Record<string, unknown>;
type Trade = { date?: string; time?: string; pnl?: number; sameAs?: string; example?: boolean; updatedAt?: number };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const carte = "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6";
const titre = "text-[15px] font-semibold text-white";
const aide = "mt-1 text-[12.5px] leading-relaxed text-white/50";
const champ = "w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--accent)]";
const bouton = "rounded-xl bg-[var(--accent)] px-4 py-2.5 text-[13.5px] font-medium text-black disabled:opacity-40";
const boutonSecondaire = "rounded-xl border border-white/[0.12] px-4 py-2.5 text-[13.5px] text-white/80 hover:bg-white/[0.04] disabled:opacity-40";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function nomAppareil() {
  const ua = navigator.userAgent;
  const machine = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Macintosh/.test(ua) ? "Mac" : /Windows/.test(ua) ? "PC" : "Appareil";
  return `${machine} · Xeilos`;
}

async function envoyerPush(session: Session, corps: Record<string, unknown>) {
  const r = await fetch(`${URL_SUPABASE}/functions/v1/send-push`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ app: "xeilos", ...corps }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || `Erreur ${r.status}`);
  return j as { sent?: number; info?: string };
}

/* ------------------------------------------------------------------ */

export default function Notifications() {
  const [session, setSession] = useState<Session | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    sb().auth.getSession().then(({ data }) => { setSession(data.session); setPret(true); });
    const { data } = sb().auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!pret) return <div className="text-[13px] text-white/40">Chargement…</div>;
  if (!session) return <Connexion />;

  const admin = session.user.email?.toLowerCase() === SUPER_ADMIN;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <CeTelephone session={session} />
        <ModeScalping userId={session.user.id} />
        {admin && <EnvoiAdmin session={session} />}
        <div className="text-[12px] text-white/35">
          Connecté : {session.user.email} ·{" "}
          <button className="underline hover:text-white/70" onClick={() => void sb().auth.signOut()}>se déconnecter</button>
        </div>
      </div>
      <MesPhrases userId={session.user.id} admin={admin} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Connexion() {
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);

  const entrer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOccupe(true); setErreur("");
    const { error } = await sb().auth.signInWithPassword({ email: email.trim(), password: mdp });
    setOccupe(false);
    if (error) setErreur(error.message === "Invalid login credentials" ? "E-mail ou mot de passe incorrect." : error.message);
  };

  return (
    <form onSubmit={entrer} className={`${carte} max-w-md space-y-3`}>
      <div className={titre}>Connecte-toi</div>
      <p className={aide}>Avec ton compte élève (le même que sur Axone). Tes phrases et tes appareils sont rattachés à ton compte.</p>
      <input className={champ} type="email" autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className={champ} type="password" autoComplete="current-password" placeholder="Mot de passe" value={mdp} onChange={(e) => setMdp(e.target.value)} required />
      {erreur && <div className="text-[12.5px] text-red-400">{erreur}</div>}
      <button className={bouton} disabled={occupe}>{occupe ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}

/* ------------------------------------------------------------------ */

type EtatPush = "inconnu" | "non-supporte" | "a-installer" | "refuse" | "inactif" | "actif";

function CeTelephone({ session }: { session: Session }) {
  const [etat, setEtat] = useState<EtatPush>("inconnu");
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState("");

  const verifier = useCallback(async () => {
    const ios = /iPhone|iPad/.test(navigator.userAgent);
    const installee = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) { setEtat(ios && !installee ? "a-installer" : "non-supporte"); return; }
    if (Notification.permission === "denied") { setEtat("refuse"); return; }
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    const sub = await reg.pushManager.getSubscription();
    setEtat(sub ? "actif" : "inactif");
  }, []);

  useEffect(() => { void verifier(); }, [verifier]);

  const activer = async () => {
    setOccupe(true); setMessage("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setEtat(perm === "denied" ? "refuse" : "inactif"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription())
        ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
      const { error } = await sb().from("push_subscriptions").upsert(
        { user_id: session.user.id, endpoint: sub.endpoint, subscription: sub.toJSON(), appareil: nomAppareil(), vu_le: new Date().toISOString(), app: "xeilos" },
        { onConflict: "endpoint" },
      );
      if (error) throw error;
      setEtat("actif");
      setMessage("Notifications activées sur cet appareil.");
    } catch (e) {
      setMessage("Échec : " + (e instanceof Error ? e.message : String(e)));
    } finally { setOccupe(false); }
  };

  const desactiver = async () => {
    setOccupe(true); setMessage("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sb().from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setEtat("inactif");
    } finally { setOccupe(false); }
  };

  const tester = async () => {
    setOccupe(true); setMessage("");
    try {
      const r = await envoyerPush(session, { title: "Xeilos", body: "Ça marche : tu recevras tes rappels ici.", url: "/dashboard/notifications", tag: "test" });
      setMessage(r.sent ? "Notification de test envoyée." : "Aucun appareil abonné trouvé.");
    } catch (e) { setMessage("Échec : " + (e instanceof Error ? e.message : String(e))); }
    finally { setOccupe(false); }
  };

  return (
    <div className={carte}>
      <div className="flex items-center justify-between gap-3">
        <div className={titre}>Notifications sur ce téléphone</div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] ${etat === "actif" ? "bg-emerald-400/15 text-emerald-300" : "bg-white/[0.06] text-white/50"}`}>
          {etat === "actif" ? "Activées" : etat === "refuse" ? "Refusées" : etat === "inconnu" ? "…" : "Non activées"}
        </span>
      </div>

      {etat === "a-installer" && (
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-white/70">
          <li>Dans Safari, touche le bouton <b>Partager</b>.</li>
          <li>Choisis <b>Sur l&apos;écran d&apos;accueil</b>.</li>
          <li>Ouvre Xeilos <b>depuis l&apos;icône</b>, reviens sur cette page et active les notifications.</li>
        </ol>
      )}
      {etat === "non-supporte" && <p className={aide}>Ce navigateur ne reçoit pas de notifications push. Sur iPhone, il faut iOS 16.4 ou plus.</p>}
      {etat === "refuse" && <p className={aide}>Tu as refusé les notifications. Réautorise-les dans les réglages du téléphone (Notifications → Xeilos), puis recharge la page.</p>}
      {(etat === "inactif" || etat === "actif") && <p className={aide}>Les rappels du mode scalping et les messages de l&apos;équipe Xeilos arrivent même app fermée.</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {etat === "inactif" && <button className={bouton} onClick={() => void activer()} disabled={occupe}>Activer les notifications</button>}
        {etat === "actif" && (
          <>
            <button className={bouton} onClick={() => void tester()} disabled={occupe}>Envoyer un test</button>
            <button className={boutonSecondaire} onClick={() => void desactiver()} disabled={occupe}>Désactiver</button>
          </>
        )}
      </div>
      {message && <div className="mt-3 text-[12.5px] text-white/60">{message}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ModeScalping({ userId }: { userId: string }) {
  const [sc, setSc] = useState<Scalp | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [saisie, setSaisie] = useState<Resultat | null>(null);
  const [montant, setMontant] = useState("");
  const [message, setMessage] = useState("");

  const lire = useCallback(async () => {
    const { data } = await sb().from("journal_axone_docs").select("data").eq("user_id", userId).eq("coll", "settings").eq("doc_id", "scalp").maybeSingle();
    setSc((data?.data as Scalp) ?? {});
  }, [userId]);

  useEffect(() => {
    void lire();
    const id = window.setInterval(() => { if (!document.hidden) void lire(); }, 15_000);
    return () => clearInterval(id);
  }, [lire]);

  if (!sc) return null;
  const on = !!sc.on;

  const ecrire = (next: Scalp) => sb().from("journal_axone_docs").upsert(
    { user_id: userId, coll: "settings", doc_id: "scalp", data: next, updated_at: new Date().toISOString() },
    { onConflict: "user_id,coll,doc_id" },
  );

  const basculer = async () => {
    setOccupe(true); setMessage("");
    // Même document que l'interrupteur d'Axone : on garde ses autres champs (historique des sessions…).
    let next: Scalp;
    if (!on) next = { ...sc, on: true, since: Date.now(), fired: [], rappel: 0 };
    else {
      const { data } = await sb().from("journal_axone_docs").select("data").eq("user_id", userId).eq("coll", "trades");
      const debut = sc.since || Date.now(), auj = iso(new Date()), de = hhmm(new Date(debut));
      const vus = new Map<string, Trade>();
      for (const r of (data ?? []) as { data: Trade }[]) {
        const t = r.data;
        if (t.example || t.date !== auj || typeof t.pnl !== "number") continue;
        if (t.time ? t.time < de : (t.updatedAt || 0) < debut) continue;
        const k = t.sameAs || JSON.stringify([t.time, t.pnl, t.updatedAt]);
        if (!vus.has(k)) vus.set(k, t);
      }
      const ts = [...vus.values()];
      const bilan = { start: debut, end: Date.now(), trades: ts.length, pnl: Math.round(ts.reduce((x, t) => x + (t.pnl || 0), 0) * 100) / 100 };
      next = { on: false, since: null, fired: [], sessions: [bilan, ...(((sc.sessions as unknown[]) || []))].slice(0, 100) };
      setMessage(`Session terminée · ${bilan.trades} trade${bilan.trades > 1 ? "s" : ""} · ${bilan.pnl.toLocaleString("fr-FR")} $`);
    }
    const { error } = await ecrire(next);
    setOccupe(false);
    if (error) void lire(); else setSc(next);
  };

  /* « Je viens d'avoir une perte / un gain » : avec un montant, c'est un vrai trade du journal
     (comme dans Axone) ; dans tous les cas, scalp.dernier fait partir la bonne phrase dans la minute. */
  const noter = async (choix: Resultat, avecMontant: boolean) => {
    setSaisie(null); setMessage("");
    const n = Number(montant.trim().replace(",", "."));
    const pnl = avecMontant && montant.trim() && isFinite(n) ? (choix === "loss" ? -Math.abs(n) : choix === "win" ? Math.abs(n) : n) : null;
    const res: Resultat = pnl === null ? choix : Math.abs(pnl) <= 5 ? "be" : pnl > 0 ? "win" : "loss";
    const now = new Date();
    if (pnl !== null) {
      const { error } = await sb().from("journal_axone_docs").insert({
        user_id: userId, coll: "trades", doc_id: crypto.randomUUID(), updated_at: now.toISOString(),
        data: { date: iso(now), time: hhmm(now), symbol: "", side: "", pnl, r: null, account: "", size: null, entry: null, exit: null, fees: null, rPlan: null,
          setup: "", grade: "", tags: ["Scalping"], plan: null, note: "Ajouté depuis Xeilos.", imageId: null, media: [], example: false,
          cat: { axone: false, perso: true, exemple: false }, pris: null, horsBilan: null, source: "scalping", sameAs: null, completed: null, updatedAt: now.getTime() },
      });
      if (error) { setMessage("Trade non enregistré : " + error.message); return; }
    }
    const next = { ...sc, dernier: { res, at: now.getTime() } };
    const { error } = await ecrire(next);
    if (error) { setMessage("Non enregistré : " + error.message); return; }
    setSc(next);
    const somme = pnl === null ? "" : ` (${pnl > 0 ? "+" : pnl < 0 ? "−" : ""}${Math.abs(pnl).toLocaleString("fr-FR")} $)`;
    setMessage({ loss: `❌ Perte notée${somme} : ta phrase « après une perte » arrive dans la minute.`, be: `➖ Trade neutre noté${somme}.`, win: `✅ Gain noté${somme} : ta phrase « après un gain » arrive dans la minute.` }[res]);
  };

  const minutes = on && sc.since ? Math.max(0, Math.round((Date.now() - sc.since) / 60000)) : 0;
  return (
    <div className={carte}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={titre}>Mode scalping</div>
          <p className={aide}>
            {on ? `Session en cours depuis ${minutes} min.` : "Allume-le quand tu scalpes : tu reçois tes rappels au rythme choisi, avec tes phrases."}
          </p>
        </div>
        <button
          role="switch" aria-checked={on} onClick={() => void basculer()} disabled={occupe}
          className={`relative h-7 w-12 shrink-0 rounded-full border transition ${on ? "border-red-400/60 bg-red-500/25" : "border-white/[0.12] bg-white/[0.06]"}`}
          aria-label="Mode scalping"
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full transition ${on ? "left-6 bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.7)]" : "left-0.5 bg-white/40"}`} />
        </button>
      </div>

      {on && (
        <div className="mt-4 space-y-3">
          <div className="text-[12.5px] text-white/55">Ton dernier trade :</div>
          <div className="flex flex-wrap gap-2">
            {([["loss", "❌ Perte"], ["be", "➖ Neutre"], ["win", "✅ Gain"]] as const).map(([r, l]) => (
              <button key={r} className={`${boutonSecondaire} ${saisie === r ? "border-[var(--accent)] text-white" : ""}`} onClick={() => { setMontant(""); setSaisie(r); }}>{l}</button>
            ))}
          </div>
          {saisie && (
            <form className="space-y-2 rounded-xl border border-white/[0.08] p-3" onSubmit={(e) => { e.preventDefault(); if (montant.trim()) void noter(saisie, true); }}>
              <div className="text-[13px] text-white/85">{saisie === "loss" ? "Perte de combien ?" : saisie === "win" ? "Gain de combien ?" : "Trade neutre : combien ?"}</div>
              <div className="flex items-center gap-2">
                <input autoFocus inputMode="decimal" className={champ} placeholder={saisie === "be" ? "ex. 2 ou -3" : "ex. 150"} value={montant} onChange={(e) => setMontant(e.target.value)} />
                <span className="text-white/50">$</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className={bouton} disabled={!montant.trim() || !isFinite(Number(montant.replace(",", ".")))}>Enregistrer</button>
                <button type="button" className={boutonSecondaire} onClick={() => void noter(saisie, false)}>Sans montant</button>
              </div>
              <p className="text-[11.5px] text-white/40">Le trade est ajouté à ton journal et compte dans ta session.</p>
            </form>
          )}
        </div>
      )}
      {message && <div className="mt-3 text-[12.5px] text-white/60">{message}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MesPhrases({ userId, admin }: { userId: string; admin: boolean }) {
  const vide = () => Object.fromEntries(LISTES.map(({ cle }) => [cle, [] as string[]])) as Record<Liste, string[]>;
  const [listes, setListes] = useState<Record<Liste, string[]> | null>(null);
  const [etoiles, setEtoiles] = useState<Record<Liste, boolean[]>>(vide() as unknown as Record<Liste, boolean[]>);
  const [ouverture, setOuverture] = useState("");
  const [respiration, setRespiration] = useState(true);
  const [rythme, setRythme] = useState(2);
  const [pourTous, setPourTous] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await sb().from("journal_axone_docs").select("data").eq("user_id", userId).eq("coll", "settings").eq("doc_id", "scalp_phrases").maybeSingle();
      const p = (data?.data as PhrasesScalp) ?? {};
      const l = Object.fromEntries(LISTES.map(({ cle }) => [cle, [...(p[cle]?.length ? p[cle]! : PHRASES_DEFAUT[cle])]])) as Record<Liste, string[]>;
      const prio = new Set((p.prioritaires ?? []).map((x) => x.trim()));
      setListes(l);
      setEtoiles(Object.fromEntries(LISTES.map(({ cle }) => [cle, l[cle].map((x) => prio.has(x.trim()))])) as Record<Liste, boolean[]>);
      setOuverture(p.ouverture || PHRASES_DEFAUT.ouverture);
      setRespiration(p.respiration !== false);
      setRythme(Number(p.rythme) || 2);
      setPourTous(p.pourTous === true);
    })();
  }, [userId]);

  if (!listes) return null;

  const changer = (cle: Liste, i: number, v: string) => setListes((l) => l && ({ ...l, [cle]: l[cle].map((x, j) => (j === i ? v : x)) }));
  const supprimer = (cle: Liste, i: number) => {
    setListes((l) => l && ({ ...l, [cle]: l[cle].filter((_, j) => j !== i) }));
    setEtoiles((e) => ({ ...e, [cle]: e[cle].filter((_, j) => j !== i) }));
  };
  const ajouter = (cle: Liste) => {
    setListes((l) => l && ({ ...l, [cle]: [...l[cle], ""] }));
    setEtoiles((e) => ({ ...e, [cle]: [...e[cle], false] }));
  };
  const etoiler = (cle: Liste, i: number) => setEtoiles((e) => ({ ...e, [cle]: e[cle].map((x, j) => (j === i ? !x : x)) }));

  // Une liste laissée identique aux phrases par défaut reste « par défaut » en base
  // (l'élève garde alors les phrases que l'admin donne à tout le monde).
  const pourBase = (l: string[], d: string[]) => { const p = l.map((x) => x.trim().slice(0, 200)).filter(Boolean).slice(0, 50); return p.length === d.length && p.every((x, i) => x === d[i]) ? [] : p; };

  const enregistrer = async () => {
    setOccupe(true); setMessage("");
    const o = ouverture.trim().slice(0, 200);
    const data: PhrasesScalp = {
      ouverture: o && o !== PHRASES_DEFAUT.ouverture ? o : undefined,
      ...Object.fromEntries(LISTES.map(({ cle }) => [cle, pourBase(listes[cle], PHRASES_DEFAUT[cle])])),
      respiration, rythme,
      prioritaires: LISTES.flatMap(({ cle }) => listes[cle].filter((_, i) => etoiles[cle][i]).map((x) => x.trim()).filter(Boolean)),
      ...(admin ? { pourTous } : {}),
    };
    const { error } = await sb().from("journal_axone_docs").upsert(
      { user_id: userId, coll: "settings", doc_id: "scalp_phrases", data, updated_at: new Date().toISOString() },
      { onConflict: "user_id,coll,doc_id" },
    );
    setOccupe(false);
    setMessage(error ? "Échec : " + error.message : "Enregistré : tes phrases partent dès le prochain rappel.");
  };

  const remettre = () => {
    if (!window.confirm("Remettre toutes les phrases Xeilos ? Tes modifications non enregistrées seront perdues.")) return;
    setListes(Object.fromEntries(LISTES.map(({ cle }) => [cle, [...PHRASES_DEFAUT[cle]]])) as Record<Liste, string[]>);
    setEtoiles(Object.fromEntries(LISTES.map(({ cle }) => [cle, PHRASES_DEFAUT[cle].map(() => false)])) as Record<Liste, boolean[]>);
    setOuverture(PHRASES_DEFAUT.ouverture);
  };

  return (
    <div className={`${carte} space-y-5`}>
      <div>
        <div className={titre}>Mes phrases</div>
        <p className={aide}>
          Modifie les phrases, supprime celles que tu ne veux pas (🗑) ou ajoutes-en, puis enregistre. ⭐ = prioritaire : un rappel sur deux est pris
          parmi tes ⭐. Si tu vides une liste, ce sont les phrases Xeilos qui partent. Elles sont à toi seul.
        </p>
      </div>

      <div className="space-y-1.5">
        <span className="text-[13px] font-medium text-white/85">Un rappel toutes les…</span>
        <div className="flex flex-wrap gap-1.5">
          {RYTHMES.map((m) => (
            <button key={m} type="button" onClick={() => setRythme(m)}
              className={`rounded-lg border px-3 py-1.5 text-[12.5px] ${rythme === m ? "border-[var(--accent)] bg-[var(--accent)] text-black" : "border-white/[0.12] text-white/70"}`}>{m} min</button>
          ))}
        </div>
        <span className="block text-[12px] text-white/40">1 minute au minimum.</span>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium text-white/85">Message d&apos;ouverture</span>
        <input className={champ} value={ouverture} maxLength={200} onChange={(e) => setOuverture(e.target.value)} />
        <span className="block text-[12px] text-white/40">Quand tu allumes le mode scalping.</span>
      </label>

      {LISTES.map(({ cle, titre: t, aide: a }) => {
        const coupe = cle === "souffles" && !respiration;
        const n = listes[cle].filter((x) => x.trim()).length;
        return (
          <div key={cle} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-medium text-white/85">{t}</span>
              <span className="text-[11.5px] text-white/40">{n} phrase{n > 1 ? "s" : ""}</span>
            </div>
            <span className="-mt-1 block text-[12px] text-white/40">{a}</span>
            {cle === "souffles" && (
              <label className="flex items-center gap-2 text-[12px] text-white/55">
                <input type="checkbox" checked={respiration} onChange={(e) => setRespiration(e.target.checked)} className="accent-[var(--accent)]" />
                Ajouter un exercice de respiration à chaque rappel
              </label>
            )}
            <div className={`space-y-1.5 ${coupe ? "pointer-events-none opacity-40" : ""}`}>
              {listes[cle].map((x, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <button type="button" onClick={() => etoiler(cle, i)} aria-pressed={!!etoiles[cle][i]}
                    title={etoiles[cle][i] ? "Prioritaire" : "Rendre prioritaire"}
                    className={`shrink-0 px-1 text-[17px] ${etoiles[cle][i] ? "text-amber-400" : "text-white/25 hover:text-white/60"}`}>{etoiles[cle][i] ? "★" : "☆"}</button>
                  <input className={champ} value={x} maxLength={200} placeholder="Écris ta phrase…" onChange={(e) => changer(cle, i, e.target.value)} />
                  <button type="button" onClick={() => supprimer(cle, i)} aria-label="Supprimer cette phrase" title="Supprimer cette phrase"
                    className="shrink-0 px-1.5 text-white/35 hover:text-red-400">🗑</button>
                </div>
              ))}
              <button type="button" className="rounded-lg border border-white/[0.12] px-3 py-1.5 text-[12.5px] text-white/70 hover:bg-white/[0.04]" onClick={() => ajouter(cle)}>+ Ajouter une phrase</button>
            </div>
          </div>
        );
      })}

      {admin && (
        <label className="flex items-start gap-2.5 rounded-xl border border-[var(--accent)]/30 p-3">
          <input type="checkbox" checked={pourTous} onChange={(e) => setPourTous(e.target.checked)} className="mt-0.5 accent-[var(--accent)]" />
          <span>
            <span className="block text-[13px] font-medium text-white/85">Utiliser mes phrases pour tout le monde</span>
            <span className="block text-[12px] text-white/45">Les élèves qui n&apos;ont pas écrit leurs phrases reçoivent les tiennes (liste par liste), ainsi que ton rythme et tes ⭐. Pense à enregistrer.</span>
          </span>
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        <button className={bouton} onClick={() => void enregistrer()} disabled={occupe}>Enregistrer mes phrases</button>
        <button className={boutonSecondaire} onClick={remettre} disabled={occupe}>Remettre les phrases Xeilos</button>
      </div>
      {message && <div className="text-[12.5px] text-white/60">{message}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EnvoiAdmin({ session }: { session: Session }) {
  const [t, setT] = useState("");
  const [corps, setCorps] = useState("");
  const [lien, setLien] = useState("/dashboard");
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState("");

  const envoyer = async () => {
    if (!t.trim()) return;
    if (!window.confirm(`Envoyer « ${t.trim()} » à tous les appareils Xeilos ?`)) return;
    setOccupe(true); setMessage("");
    try {
      const r = await envoyerPush(session, { broadcast: true, title: t.trim(), body: corps.trim(), url: lien.trim() || "/dashboard", category: "custom" });
      setMessage(`Envoyé à ${r.sent ?? 0} appareil(s).`);
      setT(""); setCorps("");
    } catch (e) { setMessage("Échec : " + (e instanceof Error ? e.message : String(e))); }
    finally { setOccupe(false); }
  };

  return (
    <div className={`${carte} space-y-3 border-[var(--accent)]/30`}>
      <div>
        <div className={titre}>Admin · envoyer une notification</div>
        <p className={aide}>Part sur tous les téléphones qui ont activé les notifications dans Xeilos (pas sur Axone).</p>
      </div>
      <input className={champ} placeholder="Titre" maxLength={80} value={t} onChange={(e) => setT(e.target.value)} />
      <textarea className={`${champ} min-h-[80px]`} placeholder="Message" maxLength={300} value={corps} onChange={(e) => setCorps(e.target.value)} />
      <input className={champ} placeholder="Page à ouvrir (ex. /dashboard/live)" value={lien} onChange={(e) => setLien(e.target.value)} />
      <button className={bouton} onClick={() => void envoyer()} disabled={occupe || !t.trim()}>Envoyer à tous</button>
      {message && <div className="text-[12.5px] text-white/60">{message}</div>}
    </div>
  );
}
