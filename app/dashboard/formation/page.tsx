import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Formation from "@/components/dashboard/pages/formation/Formation";

export const metadata = {
  title: "Formation · Xeilos",
  description: "Ton parcours de formation : progression, blocs et leçons, et exercices.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function FormationPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Formation</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Apprends dans l&apos;ordre.<br />
            <span className="text-white/50">Le risque d&apos;abord, le reste ensuite.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Cinq blocs, des leçons courtes et des exercices pour pratiquer sans argent en jeu. Si tu débutes, commence par
            l&apos;encart « Commence ici ».
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <Formation />
          </div>
        </div>
      </main>
    </div>
  );
}
