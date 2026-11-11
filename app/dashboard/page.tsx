import { Instrument_Serif } from "next/font/google";
import Sidebar from "@/components/dashboard/Sidebar";
import PerformancePanel from "@/components/dashboard/PerformancePanel";
import { Today } from "@/components/dashboard/Countdown";
import { Balance, BulleXeilosia, Fond, NoteCoach, TonEspace } from "@/components/dashboard/Blocs";
import { START_CAPITAL, STATS, resume } from "@/lib/dashboard-demo";

export const metadata = {
  title: "Tableau de bord · Xeilos",
  description: "Ton espace élève : capital, performance, formation et accompagnement.",
};

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export default function DashboardPage() {
  const { points, balance, pnl, pnlPct, formationPct } = resume();

  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-8 sm:px-8 sm:py-10 lg:px-10 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-0">
          {/* COLONNE CENTRALE */}
          <div className="xl:pr-12">
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div>
                <Today serifClass={serif.className} />
                <div className="mt-8 sm:mt-10">
                  <Balance balance={balance} pnl={pnl} pnlPct={pnlPct} />
                </div>
              </div>
              <NoteCoach serifClass={serif.className} />
            </div>

            <div className="mt-12 h-px bg-white/[0.08]" />

            <PerformancePanel points={points} startCapital={START_CAPITAL} stats={STATS} />
          </div>

          {/* COLONNE « TON ESPACE » */}
          <TonEspace serifClass={serif.className} formationPct={formationPct} />
        </div>
      </main>

      <BulleXeilosia />
    </div>
  );
}
