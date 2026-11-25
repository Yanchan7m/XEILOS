import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Journal from "@/components/dashboard/pages/journal/Journal";

export const metadata = {
  title: "Journal de trading · Xeilos",
  description: "Note chaque trade : résultat en $ et en R, respect du plan, émotion. Filtre et repère ce qui se répète.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function JournalPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Journal de trading</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Ce que tu notes,<br />
            <span className="text-white/50">tu peux le corriger.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Après chaque trade, gagnant ou perdant : le résultat, si tu as suivi ton plan, et ce que tu ressentais.
            Au bout de quelques semaines, tes erreurs qui reviennent sautent aux yeux.
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <Journal />
          </div>
        </div>
      </main>
    </div>
  );
}
