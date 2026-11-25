import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import ExerciceAbsorption from "@/components/dashboard/pages/formation/ExerciceAbsorption";

export const metadata = {
  title: "Exercice : l'absorption · Xeilos",
  description: "Pourquoi le prix peut tenir malgré beaucoup de vendeurs : 3 situations sur un carnet d'ordres animé, et la notion en vidéo si besoin.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function AbsorptionPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <Link href="/dashboard/exercices" className="text-[12px] text-white/50 hover:text-white">
            ← Exercices
          </Link>
          <div className="mt-4 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
            Exercice · Carnet d&apos;ordres
          </div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            L&apos;absorption.<br />
            <span className="text-white/50">Plein de vendeurs, et le prix tient ?</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Le carnet joue, puis s&apos;arrête et te pose une question. Réponds, puis regarde la suite. 3 situations, carnet fictif, sans argent
            en jeu. Bloqué ? La notion est expliquée en vidéo juste en dessous.
          </p>

          <section id="exercice" className="mt-10 scroll-mt-20">
            <ExerciceAbsorption />
          </section>

          <section id="video" className="mt-14 scroll-mt-20 border-t border-white/[0.08] pt-10">
            <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/55">Besoin d&apos;aide ? La notion en vidéo · 55 s</div>
            <p className="mt-2 max-w-2xl text-[13px] text-white/50">Une seule notion : l&apos;absorption. Facultatif.</p>
            <video
              className="mt-4 aspect-video w-full max-w-[720px] rounded-2xl border border-white/[0.08] bg-black"
              src="/videos/absorption.mp4"
              poster="/videos/absorption.jpg"
              controls
              playsInline
              preload="metadata"
            />
          </section>

          <section className="mt-10 flex flex-wrap gap-2">
            <Link
              href="/dashboard/lexique#lexique-absorption"
              className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-[13px] text-white/85 hover:border-white/35 hover:text-white"
            >
              📖 Absorption dans le lexique
            </Link>
            <Link
              href="/dashboard/contexte"
              className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-[13px] text-white/85 hover:border-white/35 hover:text-white"
            >
              Exercice suivant : lecture de marché en 3 étapes →
            </Link>
          </section>

          <p className="mt-12 border-t border-white/[0.08] pt-6 text-[12px] leading-relaxed text-white/45">
            Contenu pédagogique, pas un conseil en investissement. Une absorption n&apos;est jamais un signal d&apos;achat automatique.
            Le trading comporte un risque élevé de perte en capital.
          </p>
        </div>
      </main>
    </div>
  );
}
