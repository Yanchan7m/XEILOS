"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { COACH } from "@/lib/dashboard-demo";

// « Mon suivi » (/dashboard/suivi) : retours du coach, plan d'action, envois
// en attente. Les données sont celles de l'élève de démo ; les éléments lus,
// le plan coché et les envois restent sur l'appareil (localStorage).

type Retour = {
  id: string;
  quand: string;
  instrument: string;
  sens: "Achat" | "Vente";
  note: number;
  bien: string;
  aRetravailler: string;
};

// Les 4 derniers trades notés sur les 12 (moyenne de démo : 4,2 / 5).
const RETOURS: Retour[] = [
  {
    id: "r1",
    quand: "Hier",
    instrument: "Nasdaq (US100)",
    sens: "Achat",
    note: 3.5,
    bien: "L'entrée respecte ton plan : tu as attendu le retour du prix dans ta zone au lieu de courir après la bougie.",
    aRetravailler:
      "Ton stop était trop serré par rapport à la volatilité (l'amplitude des mouvements) de l'ouverture de New York. Il a été touché avant que le prix parte dans ton sens.",
  },
  {
    id: "r2",
    quand: "Il y a 2 jours",
    instrument: "Or (XAU/USD)",
    sens: "Vente",
    note: 4.5,
    bien: "Biais H4 (la tendance vue sur des bougies de 4 heures) noté avant d'entrer, risque limité à 1 % du compte. Exactement ce qu'on attend.",
    aRetravailler: "Tu as fermé la moitié de ta position trop tôt par peur. Note dans ton journal ce que tu ressentais à ce moment-là.",
  },
  {
    id: "r3",
    quand: "Il y a 4 jours",
    instrument: "EUR/USD",
    sens: "Achat",
    note: 4,
    bien: "Bonne lecture de la structure : tu as repéré la cassure du dernier sommet avant d'acheter.",
    aRetravailler:
      "Entrée prise sur le graphique 5 minutes sans vérifier l'unité de temps supérieure (H1). Regarde toujours le graphique plus large d'abord.",
  },
  {
    id: "r4",
    quand: "Il y a 6 jours",
    instrument: "Nasdaq (US100)",
    sens: "Vente",
    note: 5,
    bien: "Trade non pris pendant l'annonce du CPI, puis entrée propre une fois le marché calmé. Patience et discipline.",
    aRetravailler: "Rien à redire sur ce trade. Garde la même routine.",
  },
];

type Etape = { id: string; texte: string; aide: string };
const PLAN: Etape[] = [
  {
    id: "p1",
    texte: "Noter ton biais H4 avant chaque session",
    aide: "Le biais, c'est la direction que tu attends (hausse ou baisse) d'après le graphique en bougies de 4 heures.",
  },
  {
    id: "p2",
    texte: "Placer ton stop au-delà de l'agitation de l'ouverture de New York",
    aide: "Le stop (stop loss) coupe ta perte automatiquement. À l'ouverture (15h30, heure de Paris), le prix bouge plus : un stop trop proche saute pour rien.",
  },
  {
    id: "p3",
    texte: "Regarder la vidéo « Les règles des prop firms » (Bloc 1)",
    aide: "Pour connaître les limites de perte par jour et au total avant de passer un challenge.",
  },
];

// Les 2 points « à retravailler » du tableau de bord.
const A_RETRAVAILLER = [
  { titre: "Taille du stop à l'ouverture de New York", vu: "Vu sur 3 trades" },
  { titre: "Vérifier l'unité de temps supérieure avant d'entrer", vu: "Vu sur 2 trades" },
];

type Envoi = { id: string; instrument: string; sens: string; resultat: string; pourquoi: string; question: string; date: string };

const NON_LUS_INITIAUX = ["r1", "r2", "r3", "plan"];

function lire<T>(cle: string, defaut: T): T {
  try {
    const v = localStorage.getItem(cle);
    return v ? (JSON.parse(v) as T) : defaut;
  } catch {
    return defaut;
  }
}
function ecrire(cle: string, v: unknown) {
  try {
    localStorage.setItem(cle, JSON.stringify(v));
  } catch {
    /* stockage indisponible : on garde l'état en mémoire */
  }
}

function Etoiles({ value }: { value: number }) {
  const uid = useId();
  return (
    <div className="flex gap-0.5" aria-label={`${value.toLocaleString("fr-FR")} sur 5`} role="img">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        const id = `${uid}-${i}`;
        return (
          <svg key={i} viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <defs>
              <linearGradient id={id}>
                <stop offset={fill} stopColor="#fff" stopOpacity={0.9} />
                <stop offset={fill} stopColor="#fff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z"
              fill={`url(#${id})`}
              stroke="#fff"
              strokeOpacity={0.45}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

function Titre({ children, droite }: { children: ReactNode; droite?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">{children}</h2>
      {droite}
    </div>
  );
}

function PastilleNonLu() {
  return <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white">Nouveau</span>;
}

function BoutonLu({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-10 rounded-full border border-white/[0.12] px-4 text-[13px] text-white/75 hover:border-white/30 hover:text-white"
    >
      Marquer comme lu
    </button>
  );
}

const champ =
  "mt-1.5 block w-full min-h-10 rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-[14px] text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none";

export default function Suivi({ serifClass }: { serifClass: string }) {
  const [nonLus, setNonLus] = useState<string[]>(NON_LUS_INITIAUX);
  const [plan, setPlan] = useState<string[]>(["p1"]);
  const [envois, setEnvois] = useState<Envoi[]>([]);
  const [charge, setCharge] = useState(false);
  const [confirme, setConfirme] = useState(false);

  useEffect(() => {
    setNonLus(lire("xeilos-suivi-nonlus", NON_LUS_INITIAUX));
    setPlan(lire("xeilos-suivi-plan", ["p1"]));
    setEnvois(lire("xeilos-suivi-envois", []));
    setCharge(true);
  }, []);
  useEffect(() => {
    if (!charge) return;
    ecrire("xeilos-suivi-nonlus", nonLus);
    ecrire("xeilos-suivi-plan", plan);
    ecrire("xeilos-suivi-envois", envois);
  }, [charge, nonLus, plan, envois]);

  const marquerLu = (id: string) => setNonLus((l) => l.filter((x) => x !== id));
  const planNonLu = nonLus.includes("plan");

  const envoyer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    setEnvois((l) => [
      {
        id: String(Date.now()),
        instrument: v("instrument"),
        sens: v("sens"),
        resultat: v("resultat"),
        pourquoi: v("pourquoi"),
        question: v("question"),
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
      },
      ...l,
    ]);
    e.currentTarget.reset();
    setConfirme(true);
  };

  return (
    <div>
      {/* Résumé */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="text-[12px] text-white/55">Note moyenne du coach</div>
          <div className="mt-2 flex items-end gap-2">
            <span className={`${serifClass} text-4xl font-semibold`}>{COACH.rating.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}</span>
            <span className="pb-1 text-sm text-white/50">/5</span>
          </div>
          <div className="mt-2"><Etoiles value={COACH.rating} /></div>
          <div className="mt-2 text-[12px] text-white/55">{COACH.notedTrades} trades notés</div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="text-[12px] text-white/55">Plan d&apos;action</div>
          <div className="mt-2 text-4xl font-light tabular-nums">{plan.length} / {PLAN.length}</div>
          <div className="mt-2 text-[12px] text-white/55">étape{plan.length > 1 ? "s" : ""} faite{plan.length > 1 ? "s" : ""}</div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="text-[12px] text-white/55">À retravailler</div>
          <div className="mt-2 text-4xl font-light tabular-nums">{A_RETRAVAILLER.length}</div>
          <div className="mt-2 text-[12px] text-white/55">points relevés par ton coach</div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="text-[12px] text-white/55">Envois en attente</div>
          <div className="mt-2 text-4xl font-light tabular-nums">{envois.length}</div>
          <div className="mt-2 text-[12px] text-white/55">trade{envois.length > 1 ? "s" : ""} en attente de retour</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-3">
        <p className="text-[13px] text-white/70" aria-live="polite">
          {nonLus.length ? (
            <>
              <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] tabular-nums text-white">
                {nonLus.length}
              </span>
              élément{nonLus.length > 1 ? "s" : ""} non lu{nonLus.length > 1 ? "s" : ""}
            </>
          ) : (
            "Tu as tout lu. Les prochains retours de ton coach apparaîtront ici."
          )}
        </p>
        {nonLus.length > 0 && (
          <button
            type="button"
            onClick={() => setNonLus([])}
            className="min-h-10 rounded-full px-3 text-[13px] text-white/75 hover:text-white"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>
      <p className="mt-3 text-[12px] text-white/45">Compte de démo : les trades, notes et retours ci-dessous sont des exemples.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {/* Retours du coach */}
          <section>
            <Titre>Retours du coach</Titre>
            <ul className="space-y-4">
              {RETOURS.map((r) => {
                const nonLu = nonLus.includes(r.id);
                return (
                  <li
                    key={r.id}
                    className={`rounded-2xl border p-5 sm:p-6 ${nonLu ? "border-white/[0.18] bg-white/[0.04]" : "border-white/[0.08] bg-white/[0.02]"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] text-white">{r.instrument}</span>
                          <span className="text-[13px] text-white/55">· {r.sens} · {r.quand}</span>
                          {nonLu && <PastilleNonLu />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Etoiles value={r.note} />
                        <span className="text-[13px] tabular-nums text-white/75">{r.note.toLocaleString("fr-FR")}/5</span>
                      </div>
                    </div>
                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">Ce qui est bien</dt>
                        <dd className="mt-1.5 text-[13px] leading-relaxed text-white/70">{r.bien}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.2em] text-amber-300">À retravailler</dt>
                        <dd className="mt-1.5 text-[13px] leading-relaxed text-white/70">{r.aRetravailler}</dd>
                      </div>
                    </dl>
                    {nonLu && (
                      <div className="mt-4">
                        <BoutonLu onClick={() => marquerLu(r.id)} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-white/55">
              Les {COACH.notedTrades - RETOURS.length} autres trades notés sont dans ton historique.
              <button
                type="button"
                disabled
                className="min-h-10 cursor-not-allowed rounded-full border border-white/[0.1] px-4 text-white/40"
              >
                Voir l&apos;historique · Bientôt
              </button>
            </div>
          </section>

          {/* Envoyer un trade */}
          <section id="envoyer" className="mt-12 border-t border-white/[0.08] pt-8">
            <Titre>Envoyer un trade au coach</Titre>
            <p className="-mt-2 mb-5 text-[13px] leading-relaxed text-white/55">
              Ton coach note l&apos;exécution (as-tu suivi ton plan ?), pas le résultat : un trade perdant bien exécuté peut avoir 5/5.
            </p>
            <form onSubmit={envoyer} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6" onChange={() => setConfirme(false)}>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block text-[13px] text-white/70">
                  Marché
                  <select name="instrument" required className={champ} defaultValue="">
                    <option value="" disabled>Choisis…</option>
                    <option>Nasdaq (US100)</option>
                    <option>Or (XAU/USD)</option>
                    <option>EUR/USD</option>
                    <option>Autre</option>
                  </select>
                </label>
                <label className="block text-[13px] text-white/70">
                  Sens
                  <select name="sens" className={champ} defaultValue="Achat">
                    <option>Achat</option>
                    <option>Vente</option>
                  </select>
                </label>
                <label className="block text-[13px] text-white/70">
                  Résultat
                  <select name="resultat" className={champ} defaultValue="Gagnant">
                    <option>Gagnant</option>
                    <option>Perdant</option>
                    <option>À l&apos;équilibre</option>
                    <option>Pas encore clôturé</option>
                  </select>
                </label>
              </div>
              <label className="mt-4 block text-[13px] text-white/70">
                Pourquoi tu as pris ce trade ?
                <textarea
                  name="pourquoi"
                  required
                  rows={3}
                  placeholder="Ton biais, ta zone d'entrée, où tu as mis ton stop et pourquoi…"
                  className={champ}
                />
              </label>
              <label className="mt-4 block text-[13px] text-white/70">
                Ta question au coach <span className="text-white/40">(facultatif)</span>
                <input name="question" placeholder="Ex. : mon stop était-il bien placé ?" className={champ} />
              </label>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="submit" className="min-h-10 rounded-full bg-white px-5 text-[14px] font-medium text-black hover:bg-white/85">
                  Envoyer au coach
                </button>
                <span className="text-[12px] text-white/45">Démo : ton envoi reste sur cet appareil, rien n&apos;est transmis.</span>
              </div>
              {confirme && (
                <p className="mt-4 text-[13px] text-emerald-300" role="status">
                  Trade ajouté à tes envois en attente.
                </p>
              )}
            </form>

            {envois.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[13px] text-white/70">Envois en attente ({envois.length})</h3>
                <ul className="mt-3 space-y-3">
                  {envois.map((e) => (
                    <li key={e.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0 text-[14px] text-white">
                          {e.instrument} <span className="text-white/55">· {e.sens} · {e.resultat} · {e.date}</span>
                        </div>
                        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-white/55">
                          En attente du coach
                        </span>
                      </div>
                      <p className="mt-2 break-words text-[13px] leading-relaxed text-white/60">{e.pourquoi}</p>
                      {e.question && <p className="mt-1 break-words text-[13px] text-white/45">Question : {e.question}</p>}
                      <button
                        type="button"
                        onClick={() => setEnvois((l) => l.filter((x) => x.id !== e.id))}
                        className="mt-2 min-h-10 text-[13px] text-white/55 hover:text-white"
                      >
                        Annuler l&apos;envoi
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-10">
          {/* Plan d'action */}
          <section className={`rounded-2xl border p-5 sm:p-6 ${planNonLu ? "border-white/[0.18] bg-white/[0.04]" : "border-white/[0.08] bg-white/[0.02]"}`}>
            <Titre droite={planNonLu ? <PastilleNonLu /> : undefined}>Plan d&apos;action</Titre>
            {planNonLu && (
              <p className="-mt-2 mb-4 text-[13px] text-white/70">Ton coach a ajouté une étape après ton trade d&apos;hier sur le Nasdaq.</p>
            )}
            <ul className="space-y-3">
              {PLAN.map((p) => {
                const fait = plan.includes(p.id);
                return (
                  <li key={p.id}>
                    <label className="flex min-h-10 cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={fait}
                        onChange={() => setPlan((l) => (fait ? l.filter((x) => x !== p.id) : [...l, p.id]))}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="min-w-0">
                        <span className={`block text-[14px] ${fait ? "text-white/50 line-through" : "text-white"}`}>{p.texte}</span>
                        <span className="mt-1 block text-[12px] leading-relaxed text-white/50">{p.aide}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {planNonLu && (
              <div className="mt-4">
                <BoutonLu onClick={() => marquerLu("plan")} />
              </div>
            )}
          </section>

          {/* À retravailler */}
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            <Titre>À retravailler</Titre>
            <ul className="space-y-3">
              {A_RETRAVAILLER.map((a) => (
                <li key={a.titre} className="flex items-start justify-between gap-3 text-[14px]">
                  <span className="min-w-0 text-white/85">{a.titre}</span>
                  <span className="shrink-0 text-[12px] text-white/45">{a.vu}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Xeilosia */}
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Image src="/xeilosia-avatar.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <div className="text-[15px] text-white">Xeilosia, ta tutrice</div>
                <div className="text-[12px] text-white/55">Disponible tout de suite, entre deux retours du coach</div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-white/60">
              Tu ne comprends pas un retour ? Demande-lui de te l&apos;expliquer avec un exemple, ou de t&apos;aider à préparer ton prochain
              envoi.
            </p>
            <Link
              href="/dashboard/tutrice"
              className="mt-5 flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/[0.15] px-4 text-[14px] text-white hover:bg-white/[0.06]"
            >
              Parler à Xeilosia <span aria-hidden>→</span>
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
