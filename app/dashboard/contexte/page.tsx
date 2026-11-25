import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import ContexteMarche from "@/components/ContexteMarche";
import AvertissementRisque from "@/components/AvertissementRisque";

export const metadata = {
  title: "Contexte de marché · Xeilos",
  description: "Lis un marché en 3 étapes (contexte, activité, carnet d'ordres) avant de décider de trader ou non.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function ContextePage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Le réflexe du trader</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Tu regardes le prix en premier ?<br />
            <span className="text-white/50">Commence par le contexte.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Trois situations sur le Nasdaq. Pour chacune, tu lis le même marché en trois étapes (contexte, activité, carnet d&apos;ordres),
            puis tu décides : trader ou ne pas trader.
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <ContexteMarche />
          </div>

          <AvertissementRisque sombre />
        </div>
      </main>
    </div>
  );
}
