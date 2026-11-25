"use client";

import Link from "next/link";
import { useState } from "react";
import { FORMATION } from "@/lib/dashboard-demo";
import { LEXIQUE } from "@/lib/lexique";
import { BLOCS, EXOS, type Bloc, type Exercice } from "./parcours";

/* ------------------------------------------------------------------ */
/*  Petits éléments partagés                                           */
/* ------------------------------------------------------------------ */

const carte = "rounded-2xl border border-white/[0.08] bg-white/[0.02]";

function Titre({ sur, children, id }: { sur: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="scroll-mt-20">
      <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">{sur}</div>
      <h2 className="mt-2 text-[24px] leading-tight text-white sm:text-[28px]">{children}</h2>
    </div>
  );
}

function Exemple() {
  return (
    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
      Exemple
    </span>
  );
}

function VideoBientot() {
  return (
    <button
      type="button"
      disabled
      aria-label="Vidéo bientôt disponible"
      className="inline-flex min-h-10 shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full border border-white/10 px-3 text-[12px] text-white/40"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
      Vidéo bientôt
    </button>
  );
}

function Barre({ pct }: { pct: number }) {
  return (
    <div className="h-[3px] rounded-full bg-white/10">
      <div className="h-full rounded-full bg-white/80" style={{ width: `${pct}%` }} />
    </div>
  );
}

function LienExercice({ exo }: { exo: Exercice }) {
  if (!exo.href) {
    return (
      <button type="button" disabled className="min-h-10 cursor-not-allowed rounded-full border border-white/10 px-4 text-[13px] text-white/40">
        {exo.titre} · Bientôt
      </button>
    );
  }
  return (
    <Link
      href={exo.href}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] text-white/85 transition hover:border-white/35 hover:text-white"
    >
      {exo.titre}
      <span aria-hidden>→</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Formation() {
  const pct = Math.round((FORMATION.watched / FORMATION.total) * 100);

  return (
    <div className="space-y-14">
      {/* Progression + prochaine leçon */}
      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className={`${carte} p-5 sm:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Ta progression</div>
            <Exemple />
          </div>
          <div className="mt-4 text-4xl font-light tabular-nums">{pct} %</div>
          <div className="mt-3">
            <Barre pct={pct} />
          </div>
          <div className="mt-3 text-[12px] text-white/55">
            {FORMATION.watched} / {FORMATION.total} leçons vues · 5 blocs
          </div>
        </div>

        <div className={`${carte} p-5 sm:p-6`}>
          <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Prochaine leçon</div>
          <div className="mt-4 text-[13px] text-white/55">{FORMATION.nextBlock} · Prop firms et gestion du risque</div>
          <div className="mt-1 text-[20px] text-white">{FORMATION.nextVideo}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-white/55">
            La vidéo n&apos;est pas encore en ligne. En attendant, lis la fiche « Prop firm » et « Challenge » du lexique et fais le QCM trading.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <VideoBientot />
            <Link
              href="/dashboard/lexique#lexique-prop-firm"
              className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-[13px] text-white/85 hover:border-white/35 hover:text-white"
            >
              Ouvrir le lexique
            </Link>
            <LienExercice exo={EXOS.qcmTrading} />
          </div>
        </div>
      </section>

      <CommenceIci />
      <Parcours />
      <section className={`${carte} flex flex-wrap items-center gap-4 p-5`}>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Après la leçon</div>
          <div className="mt-1 text-[15px] text-white">Tous les exercices sont réunis dans l&apos;onglet Exercices.</div>
        </div>
        <Link
          href="/dashboard/exercices"
          className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-[13px] font-medium text-black hover:bg-white/90"
        >
          Ouvrir les exercices →
        </Link>
      </section>

      <p className="border-t border-white/[0.08] pt-6 text-[12px] leading-relaxed text-white/45">
        Formation à visée pédagogique, pas un conseil en investissement. Le trading comporte un risque élevé de perte en capital :
        selon l&apos;AMF, la majorité des particuliers qui tradent des produits à effet de levier perdent de l&apos;argent. Entraîne-toi
        d&apos;abord en compte démo.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Commence ici                                                       */
/* ------------------------------------------------------------------ */

function CommenceIci() {
  const etapes: { titre: string; texte: string; lien: { href: string; label: string; ancre?: boolean } }[] = [
    {
      titre: "Apprends les mots de base",
      texte: `Stop loss, R, drawdown... ${LEXIQUE.length} mots expliqués simplement. Commence par « Les bases » et « Gestion du risque ».`,
      lien: { href: "/dashboard/lexique", label: "Ouvrir le lexique" },
    },
    {
      titre: "Commence le Bloc 1",
      texte: "Le risque d'abord : comment fonctionne un challenge et combien tu acceptes de perdre par trade.",
      lien: { href: "#bloc-1", label: "Voir le Bloc 1", ancre: true },
    },
    {
      titre: "Lis ton premier marché",
      texte: "Contexte, activité, carnet d'ordres : un exercice guidé, sans argent en jeu.",
      lien: { href: "/dashboard/contexte", label: "Lecture de marché" },
    },
    {
      titre: "Teste-toi",
      texte: "Un QCM pour vérifier ce que tu as compris. Une erreur ici ne coûte rien : c'est fait pour ça.",
      lien: { href: "/demo#qcm", label: "QCM trading" },
    },
  ];

  return (
    <section id="commence-ici" className="scroll-mt-20 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/[0.04] p-5 sm:p-8">
      <Titre sur="Tu débutes ?">Commence ici</Titre>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/55">
        Pas besoin de tout comprendre d&apos;un coup. Suis ces 4 étapes dans l&apos;ordre, à ton rythme. Et retiens une règle dès
        maintenant : on apprend en compte démo, jamais avec de l&apos;argent dont tu as besoin.
      </p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {etapes.map((e, i) => (
          <li key={e.titre} className={`${carte} flex flex-col p-5`}>
            <div className="text-[12px] tabular-nums text-[var(--accent)]">0{i + 1}</div>
            <div className="mt-2 text-[15px] text-white">{e.titre}</div>
            <p className="mt-1 flex-1 text-[13px] leading-relaxed text-white/55">{e.texte}</p>
            {e.lien.ancre ? (
              <a href={e.lien.href} className="mt-4 inline-flex min-h-10 items-center text-[13px] text-white/85 hover:text-white">
                {e.lien.label} →
              </a>
            ) : (
              <Link href={e.lien.href} className="mt-4 inline-flex min-h-10 items-center text-[13px] text-white/85 hover:text-white">
                {e.lien.label} →
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Parcours : les 5 blocs en accordéon                                */
/* ------------------------------------------------------------------ */

function Parcours() {
  const [ouvert, setOuvert] = useState<number | null>(1);

  return (
    <section>
      <Titre sur="Le parcours">5 blocs, {FORMATION.total} leçons</Titre>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/55">
        Les vidéos sont en cours de tournage : chaque leçon apparaîtra ici dès sa sortie. Les exercices liés à chaque bloc sont déjà
        disponibles.
      </p>
      <div className="mt-6 space-y-3">
        {BLOCS.map((b) => (
          <BlocCarte key={b.num} bloc={b} ouvert={ouvert === b.num} basculer={() => setOuvert(ouvert === b.num ? null : b.num)} />
        ))}
      </div>
    </section>
  );
}

function BlocCarte({ bloc, ouvert, basculer }: { bloc: Bloc; ouvert: boolean; basculer: () => void }) {
  const pct = Math.round((bloc.vues / bloc.total) * 100);
  const enCours = bloc.vues > 0 && bloc.vues < bloc.total;
  const premier = bloc.vues + 1;
  const autres = bloc.total - bloc.vues - bloc.lecons.length;

  return (
    <div id={`bloc-${bloc.num}`} className={`${carte} scroll-mt-20 overflow-hidden`}>
      <button
        type="button"
        onClick={basculer}
        aria-expanded={ouvert}
        className="flex min-h-10 w-full items-start gap-4 p-5 text-left transition hover:bg-white/[0.02] sm:p-6"
      >
        <div className="mt-0.5 text-[12px] tabular-nums text-[var(--accent)]">Bloc {bloc.num}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[17px] text-white">{bloc.titre}</span>
            {enCours && (
              <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-[var(--accent)]">
                En cours
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-white/55">{bloc.resume}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-full max-w-[220px]">
              <Barre pct={pct} />
            </div>
            <span className="shrink-0 text-[12px] tabular-nums text-white/55">
              {bloc.vues} / {bloc.total}
            </span>
          </div>
        </div>
        <span aria-hidden className={`mt-1 text-white/50 transition ${ouvert ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {ouvert && (
        <div className="border-t border-white/[0.06] px-5 pb-6 pt-4 sm:px-6">
          {bloc.vues > 0 && (
            <div className="flex items-center gap-2 py-2 text-[13px] text-white/55">
              <span className="text-emerald-400">✓</span>
              {bloc.vues} leçons déjà vues <Exemple />
            </div>
          )}
          <ul className="divide-y divide-white/[0.06]">
            {bloc.lecons.map((l, i) => {
              const prochaine = enCours && i === 0;
              return (
                <li key={l} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
                  <div className="flex min-w-0 items-baseline gap-3">
                    <span className="w-6 shrink-0 text-[12px] tabular-nums text-white/40">{premier + i}</span>
                    <span className={`text-[14px] ${prochaine ? "text-white" : "text-white/80"}`}>
                      {l}
                      {prochaine && <span className="ml-2 text-[12px] text-[var(--accent)]">· prochaine</span>}
                    </span>
                  </div>
                  <VideoBientot />
                </li>
              );
            })}
          </ul>
          {autres > 0 && (
            <div className="pt-3 text-[12px] text-white/45">+ {autres} autres leçons, listées à la sortie des vidéos.</div>
          )}

          <div className="mt-5 text-[12px] font-medium uppercase tracking-[0.2em] text-white/60">Pour t&apos;entraîner</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {bloc.exercices.length > 0 ? (
              bloc.exercices.map((e) => <LienExercice key={e.titre} exo={e} />)
            ) : (
              <LienExercice exo={{ titre: "Exercices de psychologie", description: "" }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

