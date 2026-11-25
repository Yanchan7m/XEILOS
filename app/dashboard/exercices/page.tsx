import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Exercices from "@/components/dashboard/pages/exercices/Exercices";

export const metadata = {
  title: "Exercices · Xeilos",
  description: "Tous les exercices de Xeilos : des situations de marché, des QCM et des cartes.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function ExercicesPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Exercices</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Pratique d&apos;abord.<br />
            <span className="text-white/50">La vidéo si tu bloques.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Tous les exercices au même endroit, sans argent réel. Certaines notions ont aussi une courte vidéo, à regarder si tu bloques.
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <Exercices />
          </div>
        </div>
      </main>
    </div>
  );
}
