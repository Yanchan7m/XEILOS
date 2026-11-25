import Link from "next/link";
import { EXOS, type Exercice } from "@/components/dashboard/pages/formation/parcours";

const carte = "rounded-2xl border border-white/[0.08] bg-white/[0.02]";

// Les exercices rangés par thème. L'exercice d'abord ; quand une notion a sa
// courte vidéo, elle est proposée en aide, facultative.
const GROUPES: { titre: string; sous: string; exos: Exercice[] }[] = [
  {
    titre: "Lire le marché",
    sous: "Des situations de marché à analyser, sans argent en jeu.",
    exos: [EXOS.absorption, EXOS.contexte, EXOS.parcours],
  },
  {
    titre: "Vérifier ce que tu sais",
    sous: "Des QCM et des cartes pour t'auto-évaluer. Une erreur ici ne coûte rien.",
    exos: [EXOS.qcmTrading, EXOS.qcmScalping, EXOS.cartes],
  },
];

function Carte({ e }: { e: Exercice }) {
  return (
    <div className={`${carte} flex flex-col p-5`}>
      <Link href={e.href!} className="group flex items-center justify-between gap-3">
        <span className="text-[15px] text-white">{e.titre}</span>
        <span aria-hidden className="text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white">
          →
        </span>
      </Link>
      <p className="mt-1 flex-1 text-[13px] leading-relaxed text-white/55">{e.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={e.href!}
          className="inline-flex min-h-9 items-center rounded-full bg-white px-3 text-[12px] font-medium text-black hover:bg-white/90"
        >
          Commencer
        </Link>
        {e.video && (
          <Link
            href={e.video}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/15 px-3 text-[12px] text-white/70 hover:border-white/35 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
            La notion en vidéo
          </Link>
        )}
        {e.horsTableau && <span className="text-[11px] uppercase tracking-[0.15em] text-white/40">Page démo</span>}
      </div>
    </div>
  );
}

export default function Exercices() {
  return (
    <div className="space-y-12">
      {GROUPES.map((g) => (
        <section key={g.titre}>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
            {g.titre} <span className="text-white/35">· {g.exos.length}</span>
          </h2>
          <p className="mt-2 text-[13px] text-white/50">{g.sous}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.exos.map((e) => (
              <Carte key={e.titre} e={e} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
