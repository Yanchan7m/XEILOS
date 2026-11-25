import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { Fond } from "@/components/dashboard/Blocs";
import { VERSIONS } from "./versions";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata = { title: "6 versions du tableau de bord · Xeilos", robots: { index: false } };

export default function Versions() {
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <main className="relative mx-auto max-w-5xl px-4 py-14 sm:px-8 sm:py-20">
        <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/60">Tableau de bord élève</div>
        <h1 className="mt-4 text-4xl sm:text-6xl">
          Six <span className={`${serif.className} italic`}>versions</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/65">
          Les mêmes éléments partout : balance, P&amp;L, note du coach, performance, Xeilosia, formation, prochain call et nouveautés.
          Chaque version ajoute son effet. Le sélecteur en bas de page passe de l’une à l’autre.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {VERSIONS.map((v) => (
            <Link
              key={v.n}
              href={`/dashboard/versions/${v.n}`}
              className="group rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-white/25 hover:bg-white/[0.04] sm:p-7"
            >
              <div className="flex items-baseline gap-4">
                <span className={`${serif.className} text-5xl italic text-white/35 transition group-hover:text-[var(--accent)]`}>{v.n}</span>
                <span className="text-xl">{v.nom}</span>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-white/60">{v.ajout}</p>
              <div className="mt-5 text-[13px] text-white/80">Voir la version →</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
