"use client";

import { useEffect, useMemo, useState } from "react";

// Le calendrier de l'élève (/dashboard/calendrier). Tout est calculé côté
// client à partir de la date du jour réelle : calls de groupe (samedi 18h),
// ouverture de New York (15h30 en semaine), annonces économiques d'exemple
// et échéances de formation de démo, placées par rapport à aujourd'hui.

type Type = "call" | "session" | "annonce" | "formation";

type Evenement = {
  id: string;
  type: Type;
  heure: string;
  titre: string;
  detail: string;
  exemple?: boolean;
};

const TYPES: Record<Type, { label: string; aide: string; point: string; texte: string; puce: string }> = {
  call: {
    label: "Calls coachs",
    aide: "Visio de groupe avec les coachs Xeilos",
    point: "bg-[var(--accent)]",
    texte: "text-[var(--accent)]",
    puce: "border-[var(--accent)]/40 bg-[var(--accent)]/10",
  },
  session: {
    label: "Sessions de marché",
    aide: "Ouverture de New York, le moment le plus agité",
    point: "bg-sky-400",
    texte: "text-sky-300",
    puce: "border-sky-400/40 bg-sky-400/10",
  },
  annonce: {
    label: "Annonces éco",
    aide: "Chiffres qui font bouger les marchés (exemples)",
    point: "bg-amber-400",
    texte: "text-amber-300",
    puce: "border-amber-400/40 bg-amber-400/10",
  },
  formation: {
    label: "Formation",
    aide: "Tes échéances de formation (exemples)",
    point: "bg-emerald-400",
    texte: "text-emerald-300",
    puce: "border-emerald-400/40 bg-emerald-400/10",
  },
};

const ORDRE: Type[] = ["call", "session", "annonce", "formation"];

const POURQUOI_ANNONCE =
  "Pourquoi on évite de trader pendant : juste avant et juste après l'annonce, le prix peut faire de grands mouvements dans les deux sens en quelques secondes, et le spread (l'écart entre le prix d'achat et le prix de vente) s'élargit. Ton stop peut alors être exécuté plus loin que prévu. Beaucoup de traders restent à l'écart 15 minutes avant et 15 minutes après.";

const FED_MOIS = [0, 2, 3, 5, 6, 8, 9, 11]; // mois où l'exemple de décision de la Fed est placé

const cle = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const memeJour = (a: Date, b: Date) => cle(a) === cle(b);
const ajouterJours = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const debutJour = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/** Lundi de la semaine de `d`. */
const lundi = (d: Date) => ajouterJours(d, -((d.getDay() + 6) % 7));
/** n-ième jour de semaine `jour` (0 = dimanche) du mois. */
function nieme(annee: number, mois: number, jour: number, n: number) {
  const premier = new Date(annee, mois, 1);
  return new Date(annee, mois, 1 + ((jour - premier.getDay() + 7) % 7) + (n - 1) * 7);
}

function evenementsDuJour(d: Date, aujourdhui: Date): Evenement[] {
  const out: Evenement[] = [];
  const jour = d.getDay();
  const y = d.getFullYear(), m = d.getMonth();

  if (jour >= 1 && jour <= 5) {
    out.push({
      id: "ny",
      type: "session",
      heure: "15h30",
      titre: "Ouverture de New York",
      detail:
        "Les marchés américains ouvrent : le volume (le nombre d'ordres échangés) monte d'un coup et le prix bouge plus vite. Les 15 premières minutes sont souvent les plus agitées. Certaines semaines de mars et d'octobre-novembre, quand les heures d'été ne changent pas le même jour en Europe et aux États-Unis, l'ouverture a lieu à 14h30.",
    });
  }

  if (memeJour(d, nieme(y, m, 5, 1))) {
    out.push({
      id: "nfp",
      type: "annonce",
      heure: "14h30",
      titre: "NFP · emploi américain",
      detail: `NFP (Non-Farm Payrolls) : le nombre d'emplois créés aux États-Unis le mois précédent, hors agriculture. Un des chiffres qui fait le plus bouger l'or, le dollar et les indices. ${POURQUOI_ANNONCE}`,
      exemple: true,
    });
  }
  if (memeJour(d, nieme(y, m, 3, 2))) {
    out.push({
      id: "cpi",
      type: "annonce",
      heure: "14h30",
      titre: "CPI · inflation américaine",
      detail: `CPI (Consumer Price Index) : l'évolution des prix à la consommation aux États-Unis, c'est-à-dire l'inflation. Il influence les décisions de la Fed, donc tous les marchés. ${POURQUOI_ANNONCE}`,
      exemple: true,
    });
  }
  if (FED_MOIS.includes(m) && memeJour(d, nieme(y, m, 3, 3))) {
    out.push({
      id: "fed",
      type: "annonce",
      heure: "20h00",
      titre: "Fed · décision sur les taux",
      detail: `La Fed (la banque centrale américaine) annonce si elle monte, baisse ou garde ses taux d'intérêt, puis son président répond à la presse à 20h30. ${POURQUOI_ANNONCE}`,
      exemple: true,
    });
  }

  if (jour === 6) {
    out.push({
      id: "call",
      type: "call",
      heure: "18h00",
      titre: "Call de groupe avec les coachs Xeilos",
      detail:
        "En visio : questions-réponses et analyse de trades envoyés par les élèves. Prépare une question ou un trade à montrer. Les marchés actions sont fermés le samedi : c'est le bon moment pour faire le bilan de ta semaine.",
    });
  }

  // Échéances de formation de démo, placées par rapport à aujourd'hui.
  const base = debutJour(aujourdhui);
  if (memeJour(d, ajouterJours(base, 3))) {
    out.push({
      id: "qcm",
      type: "formation",
      heure: "Dans la journée",
      titre: "Révision du QCM du Bloc 2",
      detail:
        "Le QCM adaptatif te ressert les questions que tu as ratées. Ça prend une dizaine de minutes : c'est en revoyant ses erreurs qu'on les retient.",
      exemple: true,
    });
  }
  const dimanche = ajouterJours(base, base.getDay() === 0 ? 7 : 7 - base.getDay());
  if (memeJour(d, dimanche)) {
    out.push({
      id: "video",
      type: "formation",
      heure: "Avant dimanche soir",
      titre: "Vidéo « Les règles des prop firms » (Bloc 1)",
      detail:
        "Objectif de la semaine. Une prop firm est une société qui te confie un capital après un challenge : cette vidéo explique ses règles (perte maximale par jour, perte maximale totale) pour ne pas perdre ton compte sur une erreur évitable.",
      exemple: true,
    });
  }
  if (memeJour(d, ajouterJours(base, 10))) {
    out.push({
      id: "plan",
      type: "formation",
      heure: "Dans la journée",
      titre: "Échéance du plan d'action",
      detail:
        "Ton coach t'a demandé de placer ton stop (l'ordre qui coupe ta perte automatiquement) en tenant compte de l'agitation de l'ouverture de New York. Envoie-lui un trade qui applique ce point avant cette date.",
      exemple: true,
    });
  }

  return out.sort((a, b) => ORDRE.indexOf(a.type) - ORDRE.indexOf(b.type) || a.heure.localeCompare(b.heure));
}

const fmtMois = (d: Date) => {
  const s = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const fmtJour = (d: Date) => {
  const s = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-white/55">{children}</span>
  );
}

function CarteEvenement({ e }: { e: Evenement }) {
  const t = TYPES[e.type];
  return (
    <li className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className={`h-2 w-2 shrink-0 rounded-full ${t.point}`} aria-hidden />
        <span className={t.texte}>{t.label}</span>
        <span className="text-white/40">·</span>
        <span className="tabular-nums text-white/70">{e.heure}</span>
        {e.exemple && <Badge>exemple</Badge>}
      </div>
      <div className="mt-2 text-[15px] text-white">{e.titre}</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">{e.detail}</p>
    </li>
  );
}

export default function Calendrier() {
  const [aujourdhui, setAujourdhui] = useState<Date | null>(null);
  const [mois, setMois] = useState<Date | null>(null);
  const [choisi, setChoisi] = useState<Date | null>(null);
  const [actifs, setActifs] = useState<Record<Type, boolean>>({ call: true, session: true, annonce: true, formation: true });

  useEffect(() => {
    const now = new Date();
    setAujourdhui(debutJour(now));
    setMois(new Date(now.getFullYear(), now.getMonth(), 1));
    setChoisi(debutJour(now));
  }, []);

  const filtrer = (liste: Evenement[]) => liste.filter((e) => actifs[e.type]);

  const cases = useMemo(() => {
    if (!mois) return [];
    const debut = lundi(mois);
    const fin = new Date(mois.getFullYear(), mois.getMonth() + 1, 0);
    const n = Math.ceil(((fin.getTime() - debut.getTime()) / 86_400_000 + 1) / 7) * 7;
    return Array.from({ length: Math.round(n) }, (_, i) => ajouterJours(debut, i));
  }, [mois]);

  if (!aujourdhui || !mois || !choisi) {
    return <div className="h-[640px] rounded-2xl border border-white/[0.08] bg-white/[0.02]" aria-busy />;
  }

  const semaine = Array.from({ length: 7 }, (_, i) => ajouterJours(lundi(aujourdhui), i));
  const duChoisi = filtrer(evenementsDuJour(choisi, aujourdhui));
  const changerMois = (delta: number) => setMois(new Date(mois.getFullYear(), mois.getMonth() + delta, 1));
  const allerAujourdhui = () => {
    setMois(new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1));
    setChoisi(aujourdhui);
  };

  return (
    <div>
      {/* Filtres par type */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par type">
        {ORDRE.map((type) => {
          const t = TYPES[type];
          const on = actifs[type];
          return (
            <button
              key={type}
              type="button"
              aria-pressed={on}
              title={t.aide}
              onClick={() => setActifs((a) => ({ ...a, [type]: !a[type] }))}
              className={`flex min-h-10 items-center gap-2 rounded-full border px-4 text-[13px] transition-colors ${
                on ? `${t.puce} text-white` : "border-white/[0.08] bg-transparent text-white/40 line-through"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${on ? t.point : "bg-white/25"}`} aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[12px] text-white/45">
        Les dates des annonces économiques et de tes échéances de formation sont des exemples de démo. Vérifie toujours un vrai
        calendrier économique avant de trader.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Vue mois */}
        <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-6">
          <div className="flex items-center justify-between gap-2 px-1">
            <h2 className="text-[20px] text-white sm:text-[24px]">{fmtMois(mois)}</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={allerAujourdhui}
                className="min-h-10 rounded-full border border-white/[0.12] px-3 text-[13px] text-white/75 hover:text-white"
              >
                Aujourd&apos;hui
              </button>
              <button
                type="button"
                onClick={() => changerMois(-1)}
                aria-label="Mois précédent"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => changerMois(1)}
                aria-label="Mois suivant"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-[0.15em] text-white/40">
            {JOURS.map((j) => (
              <div key={j} className="py-1">{j}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cases.map((d) => {
              const evs = filtrer(evenementsDuJour(d, aujourdhui));
              const horsMois = d.getMonth() !== mois.getMonth();
              const estAujourdhui = memeJour(d, aujourdhui);
              const estChoisi = memeJour(d, choisi);
              const types = ORDRE.filter((t) => evs.some((e) => e.type === t));
              const visibles = evs.filter((e) => e.type !== "session").slice(0, 2);
              return (
                <button
                  key={cle(d)}
                  type="button"
                  onClick={() => {
                    setChoisi(d);
                    if (horsMois) setMois(new Date(d.getFullYear(), d.getMonth(), 1));
                  }}
                  aria-pressed={estChoisi}
                  aria-label={`${fmtJour(d)}${evs.length ? `, ${evs.length} événement${evs.length > 1 ? "s" : ""}` : ""}`}
                  className={`flex min-h-12 min-w-0 flex-col items-center gap-1 rounded-lg border p-1 text-left transition-colors sm:min-h-[92px] sm:items-stretch sm:p-2 ${
                    estChoisi
                      ? "border-white/60 bg-white/[0.07]"
                      : "border-white/[0.05] hover:border-white/20 hover:bg-white/[0.03]"
                  } ${horsMois ? "opacity-35" : ""}`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] tabular-nums ${
                      estAujourdhui ? "bg-[var(--accent)] text-white" : "text-white/80"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  <span className="flex flex-wrap justify-center gap-1 sm:hidden">
                    {types.map((t) => (
                      <span key={t} className={`h-1.5 w-1.5 rounded-full ${TYPES[t].point}`} aria-hidden />
                    ))}
                  </span>
                  <span className="hidden min-w-0 flex-col gap-1 sm:flex">
                    {visibles.map((e) => (
                      <span key={e.id} className={`truncate rounded border px-1.5 py-0.5 text-[11px] text-white/85 ${TYPES[e.type].puce}`}>
                        {e.titre.split(" · ")[0]}
                      </span>
                    ))}
                    {types.includes("session") && (
                      <span className="flex items-center gap-1 text-[11px] text-white/45">
                        <span className={`h-1.5 w-1.5 rounded-full ${TYPES.session.point}`} aria-hidden />
                        NY 15h30
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Détail du jour choisi */}
        <section className="min-w-0">
          <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">
            {memeJour(choisi, aujourdhui) ? "Aujourd'hui" : "Jour choisi"}
          </div>
          <h2 className="mt-2 text-[22px] text-white">{fmtJour(choisi)}</h2>
          {duChoisi.length ? (
            <ul className="mt-4 space-y-3">
              {duChoisi.map((e) => (
                <CarteEvenement key={e.id} e={e} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-[13px] leading-relaxed text-white/55">
              Rien de prévu ce jour-là{ORDRE.some((t) => !actifs[t]) ? " avec les filtres choisis" : ""}.
              {choisi.getDay() === 0 && " Les marchés actions sont fermés le dimanche : profites-en pour relire ton journal de trading."}
            </p>
          )}
          <button
            type="button"
            disabled
            className="mt-4 flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/[0.1] px-4 text-[13px] text-white/40"
          >
            Ajouter à mon agenda
            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]">Bientôt</span>
          </button>
        </section>
      </div>

      {/* Cette semaine */}
      <section className="mt-12 border-t border-white/[0.08] pt-8">
        <h3 className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Cette semaine</h3>
        <ul className="mt-5 divide-y divide-white/[0.06]">
          {semaine.map((d) => {
            const evs = filtrer(evenementsDuJour(d, aujourdhui));
            const passe = d.getTime() < aujourdhui.getTime();
            const estAujourdhui = memeJour(d, aujourdhui);
            return (
              <li key={cle(d)} className={`grid gap-2 py-4 sm:grid-cols-[230px_minmax(0,1fr)] sm:gap-6 ${passe ? "opacity-45" : ""}`}>
                <button
                  type="button"
                  onClick={() => {
                    setChoisi(d);
                    setMois(new Date(d.getFullYear(), d.getMonth(), 1));
                  }}
                  className="flex min-h-10 items-center gap-2 self-start text-left text-[14px] text-white hover:text-white/70"
                >
                  {fmtJour(d)}
                  {estAujourdhui && (
                    <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]">Aujourd&apos;hui</span>
                  )}
                </button>
                {evs.length ? (
                  <ul className="min-w-0 space-y-2">
                    {evs.map((e) => (
                      <li key={e.id} className="flex min-w-0 items-start gap-3 text-[13px] sm:items-center">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full sm:mt-0 ${TYPES[e.type].point}`} aria-hidden />
                        <span className="w-[72px] shrink-0 tabular-nums text-white/60">{e.heure.startsWith("Dans") || e.heure.startsWith("Avant") ? "Journée" : e.heure}</span>
                        <span className="min-w-0 text-white/85">
                          {e.titre}
                          {e.exemple && <span className="ml-2 text-[11px] text-white/40">(exemple)</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex min-h-10 items-center text-[13px] text-white/40">Rien de prévu.</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
