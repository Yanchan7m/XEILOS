import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Countdown from "@/components/dashboard/Countdown";
import { Fond } from "@/components/dashboard/Blocs";
import { FORMATION } from "@/lib/dashboard-demo";

export const metadata = {
  title: "Tableau de bord · Xeilos",
  description: "Ton espace élève : où tu en es dans la formation, l'exercice conseillé et le prochain call.",
};

// Le tableau de bord est centré sur l'apprentissage : la formation d'abord,
// puis l'exercice conseillé et le prochain call. Les deux boutons du haut
// reprennent ceux de /xeilosapp (unlock747). Pas de solde, de P&L ni
// d'objectif funded : aucune connexion avec le compte de trading de l'élève
// (Tradovate…), donc ces chiffres seraient inventés.

const carte = "rounded-2xl border border-white/[0.1] bg-white/[0.03]";

export default function DashboardPage() {
  const pct = Math.round((FORMATION.watched / FORMATION.total) * 100);

  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1000px] space-y-8 px-4 py-8 sm:px-8 sm:py-12 lg:px-10">
          <h1 className="text-[30px] font-semibold tracking-[-0.025em] sm:text-[36px]">
            Bonjour. <span className="text-white/50">On reprend où tu t&apos;es arrêté.</span>
          </h1>

          {/* 1 · Les deux actions du jour, tout en haut */}
          <section className="grid gap-2.5 sm:grid-cols-2">
            <Link
              href="/dashboard/formation"
              className="group flex min-w-0 items-center justify-between gap-5 rounded-[22px] bg-white px-6 py-5 text-[#0b0b0d] transition hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <span className="min-w-0">
                <span className="block text-[18px] font-medium tracking-[-0.01em]">Continuer la formation</span>
                <span className="mt-0.5 block truncate text-[13px] text-black/55">
                  {FORMATION.nextVideo} · vidéo {FORMATION.watched + 1} sur {FORMATION.total}
                </span>
              </span>
              <span aria-hidden className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[#ff3b3b] text-[#0b0b0d] shadow-[0_6px_22px_rgb(255_59_59/0.45)]">
                →
              </span>
            </Link>
            <Link
              href="/dashboard/exercices/absorption"
              className="group flex min-w-0 items-center justify-between gap-5 rounded-[22px] border border-white/[0.14] bg-white/[0.04] px-6 py-5 text-white transition hover:-translate-y-0.5 hover:border-white/25 active:scale-[0.99]"
            >
              <span className="min-w-0">
                <span className="block text-[18px] font-medium tracking-[-0.01em]">Faire l&apos;exercice conseillé</span>
                <span className="mt-0.5 block truncate text-[13px] text-white/55">L&apos;absorption · 3 situations · 2 min</span>
              </span>
              <span aria-hidden className="grid h-12 w-12 flex-none place-items-center rounded-full bg-white/[0.12] text-white">
                →
              </span>
            </Link>
          </section>

          {/* 2 · Où j'en suis, et le prochain call */}
          <section className="grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/formation" className={`${carte} group flex flex-col p-5 transition hover:border-white/25 hover:bg-white/[0.05]`}>
              <span className="text-[12px] text-white/55">Ma progression · {FORMATION.nextBlock}</span>
              <span className="mt-1.5 text-[17px] text-white">
                {FORMATION.watched} / {FORMATION.total} vidéos vues
              </span>
              <span className="mt-4 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progression dans la formation">
                <span className="block h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
              </span>
            </Link>
            <Link href="/dashboard/calendrier" className={`${carte} group flex flex-col p-5 transition hover:border-white/25 hover:bg-white/[0.05]`}>
              <span className="text-[12px] text-white/55">Prochain call</span>
              <span className="mt-1.5 flex-1 text-[17px] text-white">Call de groupe, samedi 18 h</span>
              <span className="mt-3 text-[12px] text-white/55">
                <Countdown weekday={6} hour={18} />
              </span>
            </Link>
          </section>

          <p className="border-t border-white/[0.08] pt-6 text-[12px] leading-relaxed text-white/45">
            Xeilos est une formation : rien ici n&apos;est un conseil d&apos;investissement. Le trading comporte un risque élevé de perte en capital :
            environ 9 particuliers sur 10 perdent de l&apos;argent sur les CFD (AMF).
          </p>
        </div>
      </main>
    </div>
  );
}
