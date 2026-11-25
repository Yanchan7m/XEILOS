import Link from "next/link";
import { notFound } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import PerformancePanel from "@/components/dashboard/PerformancePanel";
import { Today } from "@/components/dashboard/Countdown";
import {
  Accompagnement, Balance, Fond, Formation, Libelle, NoteCoach, Nouveautes, ProchainCall, TonEspace,
} from "@/components/dashboard/Blocs";
import {
  BandeauTrades, ChecklistTrade, ChiffreAnime, EnDirect, HeatmapPnl, ObjectifFunded, SessionsMarche,
} from "@/components/dashboard/variantes/Effets";
import { CHALLENGE, START_CAPITAL, STATS, pnlParJour, resume, serieGagnante } from "@/lib/dashboard-demo";
import BriefingDuJour from "@/components/dashboard/BriefingDuJour";
import { VERSIONS } from "../versions";

// LES 6 VERSIONS DU TABLEAU DE BORD (11/11/2026). Toutes gardent les éléments
// de base de /dashboard (balance, P&L, note du coach, performance, Xeilosia,
// formation, prochain call, nouveautés) ; chacune ajoute son effet.

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const dynamicParams = false;
export function generateStaticParams() {
  return VERSIONS.map((v) => ({ n: String(v.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const v = VERSIONS.find((x) => String(x.n) === n);
  return { title: `Version ${n}${v ? ` · ${v.nom}` : ""} · Xeilos`, robots: { index: false } };
}

export default async function VersionPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const v = VERSIONS.find((x) => String(x.n) === n);
  if (!v) notFound();

  const r = resume();
  const contenu = { 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6 }[v.n]!(r);

  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />
      <main className="relative min-w-0 flex-1 pt-14 pb-24 lg:pt-0">{contenu}</main>
      <Selecteur actuelle={v.n} />
    </div>
  );
}

type R = ReturnType<typeof resume>;

/** La disposition de /dashboard, avec des emplacements pour les ajouts. */
function Classique({
  r, entete, balance, apresEntete, avantPerf, trace, avantEspace, enHaut,
}: {
  r: R;
  entete?: ReactNode;
  balance?: ReactNode;
  apresEntete?: ReactNode;
  avantPerf?: ReactNode;
  trace?: boolean;
  avantEspace?: ReactNode;
  enHaut?: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-8 sm:px-8 sm:py-10 lg:px-10 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-0">
      <div className="min-w-0 xl:pr-12">
        {enHaut}
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <Today serifClass={serif.className} />
              {entete}
            </div>
            <div className="mt-8 sm:mt-10">
              <Balance balance={r.balance} pnl={r.pnl} pnlPct={r.pnlPct} chiffre={balance} />
            </div>
          </div>
          <NoteCoach serifClass={serif.className} />
        </div>
        {apresEntete}
        <div className="mt-12 h-px bg-white/[0.08]" />
        {avantPerf}
        <PerformancePanel points={r.points} startCapital={START_CAPITAL} stats={STATS} trace={trace} />
      </div>
      <TonEspace serifClass={serif.className} formationPct={r.formationPct} avant={avantEspace} />
    </div>
  );
}

// 1 · Référence : le tableau de bord actuel.
const v1 = (r: R) => <Classique r={r} />;

// 2 · Le chiffre vivant : la balance défile, la courbe se trace, le compte bat.
const v2 = (r: R) => (
  <Classique r={r} entete={<EnDirect />} balance={<ChiffreAnime valeur={r.balance} />} apresEntete={<BandeauTrades />} trace />
);

// 3 · Objectif funded : où il en est de son challenge prop firm.
const v3 = (r: R) => (
  <Classique
    r={r}
    avantPerf={<ObjectifFunded ch={CHALLENGE} capital={START_CAPITAL} balance={r.balance} drawdownPct={STATS.maxDrawdown} />}
  />
);

// 4 · Bento : les mêmes blocs en cartes, plus le calendrier de P&L.
function Carte({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`min-w-0 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-sm sm:p-7 ${className}`}>{children}</div>;
}
const v4 = (r: R) => {
  const jours = pnlParJour(r.points);
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Today serifClass={serif.className} />
        <h1 className="text-3xl">
          Ton <span className={`${serif.className} italic`}>espace</span>
        </h1>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Carte className="md:col-span-2 xl:col-span-2">
          <Balance balance={r.balance} pnl={r.pnl} pnlPct={r.pnlPct} />
        </Carte>
        <Carte>
          <NoteCoach serifClass={serif.className} alignDroite={false} nu />
        </Carte>
        <Carte>
          <Libelle>Formation</Libelle>
          <div className="mt-5">
            <Formation formationPct={r.formationPct} />
          </div>
        </Carte>
        <Carte className="md:col-span-2 xl:col-span-4">
          <HeatmapPnl jours={jours} serie={serieGagnante(jours)} />
        </Carte>
        <Carte className="md:col-span-2 xl:col-span-3">
          <div className="-mt-10">
            <PerformancePanel points={r.points} startCapital={START_CAPITAL} stats={STATS} />
          </div>
        </Carte>
        <Carte>
          <Libelle>Accompagnement</Libelle>
          <div className="mt-5">
            <Accompagnement />
          </div>
        </Carte>
        <Carte className="xl:col-span-2">
          <ProchainCall />
        </Carte>
        <Carte className="xl:col-span-2">
          <Libelle>Nouveautés Xeilos</Libelle>
          <div className="mt-5">
            <Nouveautes />
          </div>
        </Carte>
      </div>
    </div>
  );
};

// 5 · Xeilosia en tête : le briefing du jour, écrit à partir de ses chiffres.
const v5 = (r: R) => <Classique r={r} enHaut={<div className="mb-12"><BriefingDuJour pnl={r.pnl} /></div>} />;

// 6 · Séance du jour : sessions de marché en direct et checklist avant de trader.
const v6 = (r: R) => (
  <Classique
    r={r}
    avantPerf={
      <div className="mt-10">
        <SessionsMarche />
      </div>
    }
    avantEspace={
      <div className="mb-8 md:col-span-2 xl:col-span-1">
        <ChecklistTrade />
      </div>
    }
  />
);

function Selecteur({ actuelle }: { actuelle: number }) {
  const v = VERSIONS.find((x) => x.n === actuelle)!;
  return (
    <nav
      aria-label="Versions du tableau de bord"
      className="fixed bottom-4 left-4 z-30 flex items-center sm:left-1/2 sm:-translate-x-1/2 gap-1 rounded-full border border-white/15 bg-black/80 p-1.5 shadow-2xl backdrop-blur-md sm:bottom-6"
    >
      <Link href="/dashboard/versions" className="hidden px-3 text-[12px] text-white/60 hover:text-white sm:block">
        {v.nom}
      </Link>
      {VERSIONS.map((x) => (
        <Link
          key={x.n}
          href={`/dashboard/versions/${x.n}`}
          aria-current={x.n === actuelle ? "page" : undefined}
          title={x.nom}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] tabular-nums transition ${
            x.n === actuelle ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          {x.n}
        </Link>
      ))}
    </nav>
  );
}
