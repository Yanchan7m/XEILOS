import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Lexique from "@/components/dashboard/pages/lexique/Lexique";
import { LEXIQUE } from "@/lib/lexique";

export const metadata = {
  title: "Lexique · Xeilos",
  description: "Les mots du trading expliqués simplement : risque, ordres, lecture du marché, prop firms, psychologie.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function LexiquePage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Lexique</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Les mots du trader.<br />
            <span className="text-white/50">Simplement, avec un exemple.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            {`${LEXIQUE.length} mots classés par thème.`} Si tu débutes, lis d&apos;abord « Les bases » et « Gestion du risque ».
            Les chiffres des exemples sont fictifs.
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <Lexique />
          </div>
        </div>
      </main>
    </div>
  );
}
