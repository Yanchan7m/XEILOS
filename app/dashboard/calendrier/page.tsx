import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Calendrier from "@/components/dashboard/pages/calendrier/Calendrier";

export const metadata = {
  title: "Calendrier · Xeilos",
  description: "Tes calls de groupe, les sessions de marché, les grandes annonces économiques et tes échéances de formation.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function CalendrierPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Calendrier</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Ta semaine se prépare<br />
            <span className="text-white/50">avant d&apos;ouvrir un graphique.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Les calls avec les coachs, l&apos;ouverture de New York, les grandes annonces économiques et tes échéances de formation,
            au même endroit. Toutes les heures sont à l&apos;heure de Paris.
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <Calendrier />
          </div>
        </div>
      </main>
    </div>
  );
}
