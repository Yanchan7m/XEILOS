"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { sb, SUPER_ADMIN, URL_SUPABASE, VAPID_PUBLIC_KEY } from "@/lib/supabase";
import { LISTES, PHRASES_DEFAUT, versListe, versTexte, type Liste, type PhrasesScalp } from "@/lib/phrases-scalping";

/* NOTIFICATIONS XEILOS (25/11/2026)
   · connexion avec le compte Axone (même base) ;
   · activer le push sur CE téléphone (app ajoutée à l'écran d'accueil) ;
   · le mode scalping : même interrupteur qu'Axone (settings/scalp), les rappels
     partent du serveur toutes les 2 minutes (fonction scalp-rappel) ;
   · mes phrases : settings/scalp_phrases, propres à chaque compte ;
   · admin : un message push à tous les appareils XEILOS. */

type Scalp = { on?: boolean; since?: number | null; fired?: string[]; rappel?: number } & Record<string, unknown>;

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

  const basculer = async () => {
    setOccupe(true);
    // Même document que l'interrupteur d'Axone : on garde ses autres champs (historique des sessions…).
    const next: Scalp = on ? { ...sc, on: false, since: null, fired: [] } : { ...sc, on: true, since: Date.now(), fired: [], rappel: 0 };
    const { error } = await sb().from("journal_axone_docs").upsert(
      { user_id: userId, coll: "settings", doc_id: "scalp", data: next, updated_at: new Date().toISOString() },
      { onConflict: "user_id,coll,doc_id" },
    );
    setOccupe(false);
    if (error) void lire(); else setSc(next);
  };

  const minutes = on && sc.since ? Math.max(0, Math.round((Date.now() - sc.since) / 60000)) : 0;
  return (
    <div className={carte}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={titre}>Mode scalping</div>
          <p className={aide}>
            {on ? `Session en cours depuis ${minutes} min : un rappel toutes les 2 minutes.` : "Allume-le quand tu scalpes : tu reçois un rappel toutes les 2 minutes, avec tes phrases."}
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
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MesPhrases({ userId, admin }: { userId: string; admin: boolean }) {
  const [textes, setTextes] = useState<Record<Liste, string> | null>(null);
  const [ouverture, setOuverture] = useState("");
  const [respiration, setRespiration] = useState(true);
  const [pourTous, setPourTous] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await sb().from("journal_axone_docs").select("data").eq("user_id", userId).eq("coll", "settings").eq("doc_id", "scalp_phrases").maybeSingle();
      const p = (data?.data as PhrasesScalp) ?? {};
      setTextes({ calme: versTexte(p.calme), perte: versTexte(p.perte), gain: versTexte(p.gain), souffles: versTexte(p.souffles) });
      setOuverture(p.ouverture ?? "");
      setRespiration(p.respiration !== false);
      setPourTous(p.pourTous === true);
    })();
  }, [userId]);

  if (!textes) return null;

  const enregistrer = async () => {
    setOccupe(true); setMessage("");
    const data: PhrasesScalp = {
      ouverture: ouverture.trim().slice(0, 200) || undefined,
      calme: versListe(textes.calme), perte: versListe(textes.perte), gain: versListe(textes.gain), souffles: versListe(textes.souffles),
      respiration,
      ...(admin ? { pourTous } : {}),
    };
    const { error } = await sb().from("journal_axone_docs").upsert(
      { user_id: userId, coll: "settings", doc_id: "scalp_phrases", data, updated_at: new Date().toISOString() },
      { onConflict: "user_id,coll,doc_id" },
    );
    setOccupe(false);
    setMessage(error ? "Échec : " + error.message : "Enregistré : tes phrases partent dès le prochain rappel.");
  };

  const partirDuDefaut = () => {
    setTextes({ calme: versTexte(PHRASES_DEFAUT.calme), perte: versTexte(PHRASES_DEFAUT.perte), gain: versTexte(PHRASES_DEFAUT.gain), souffles: versTexte(PHRASES_DEFAUT.souffles) });
    setOuverture(PHRASES_DEFAUT.ouverture);
  };

  return (
    <div className={`${carte} space-y-4`}>
      <div>
        <div className={titre}>Mes phrases</div>
        <p className={aide}>Écris tes propres rappels, une phrase par ligne. Une case vide garde les phrases Xeilos. Elles sont à toi seul : personne d&apos;autre ne les voit.</p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium text-white/85">Message d&apos;ouverture</span>
        <input className={champ} value={ouverture} maxLength={200} placeholder={PHRASES_DEFAUT.ouverture} onChange={(e) => setOuverture(e.target.value)} />
        <span className="block text-[12px] text-white/40">Quand tu allumes le mode scalping.</span>
      </label>

      {LISTES.map(({ cle, titre: t, aide: a }) => {
        const n = versListe(textes[cle]).length;
        const coupe = cle === "souffles" && !respiration;
        return (
          <label key={cle} className="block space-y-1.5">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-medium text-white/85">{t}</span>
              <span className="text-[11.5px] text-white/40">{n ? `${n} phrase${n > 1 ? "s" : ""}` : "phrases Xeilos"}</span>
            </span>
            {cle === "souffles" && (
              <span className="flex items-center gap-2 text-[12px] text-white/55">
                <input type="checkbox" checked={respiration} onChange={(e) => setRespiration(e.target.checked)} className="accent-[var(--accent)]" />
                Ajouter un exercice de respiration à chaque rappel
              </span>
            )}
            <textarea className={`${champ} min-h-[96px] ${coupe ? "opacity-40" : ""}`} disabled={coupe} value={textes[cle]}
              placeholder={PHRASES_DEFAUT[cle].slice(0, 3).join("\n")}
              onChange={(e) => setTextes((x) => (x ? { ...x, [cle]: e.target.value } : x))} />
            <span className="block text-[12px] text-white/40">{a}</span>
          </label>
        );
      })}

      {admin && (
        <label className="flex items-start gap-2.5 rounded-xl border border-[var(--accent)]/30 p-3">
          <input type="checkbox" checked={pourTous} onChange={(e) => setPourTous(e.target.checked)} className="mt-0.5 accent-[var(--accent)]" />
          <span>
            <span className="block text-[13px] font-medium text-white/85">Utiliser mes phrases pour tout le monde</span>
            <span className="block text-[12px] text-white/45">Les élèves qui n&apos;ont pas écrit leurs phrases reçoivent les tiennes (case par case). Ceux qui ont écrit les leurs les gardent. Pense à enregistrer.</span>
          </span>
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        <button className={bouton} onClick={() => void enregistrer()} disabled={occupe}>Enregistrer mes phrases</button>
        <button className={boutonSecondaire} onClick={partirDuDefaut} disabled={occupe}>Partir des phrases Xeilos</button>
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
