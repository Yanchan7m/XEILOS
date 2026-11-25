import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Suivi from "@/components/dashboard/pages/suivi/Suivi";

export const metadata = {
  title: "Mon suivi · Xeilos",
  description: "Les retours de ton coach sur tes trades, ton plan d'action et tes envois en attente.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function SuiviPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Mon suivi</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Ce que ton coach a vu<br />
            <span className="text-white/50">et ce que tu travailles ensuite.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Les notes et retours de ton coach sur tes trades, ton plan d&apos;action, et un endroit pour lui envoyer un trade à
            analyser. Un trade bien noté veut dire « bien exécuté selon ton plan », pas « gagnant ».
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <Suivi serifClass={serif.className} />
          </div>
        </div>
      </main>
    </div>
  );
}
