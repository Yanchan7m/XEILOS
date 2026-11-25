import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Communaute from "@/components/dashboard/pages/communaute/Communaute";

export const metadata = {
  title: "Communauté · Xeilos",
  description: "L'espace d'entraide des élèves Xeilos : questions, analyses, psychologie et prop firms, dans le respect des règles.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function CommunautePage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Communauté</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            On progresse mieux à plusieurs.<br />
            <span className="text-white/50">Pose tes questions, partage tes analyses.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            L&apos;espace d&apos;entraide des élèves : on y explique son raisonnement, on s&apos;aide sur les points bloquants et on parle
            aussi de ce qui est difficile. Ici, personne ne vend rien.
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <Communaute />
          </div>
        </div>
      </main>
    </div>
  );
}
