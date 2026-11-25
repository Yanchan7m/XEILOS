import Link from "next/link";
import type { CSSProperties } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Chat from "@/components/Chat";

export const metadata = {
  title: "Xeilosia · Xeilos",
  description: "Pose tes questions de trading à Xeilosia, ta tutrice IA : risque, graphiques, carnet d'ordres, prop firms.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

// Le chat utilise les variables du thème clair : on les passe en sombre ici.
const sombre = {
  "--surface": "rgba(255,255,255,0.02)",
  "--surface-2": "rgba(255,255,255,0.05)",
  "--border": "rgba(255,255,255,0.1)",
  "--foreground": "#ffffff",
  "--muted": "rgba(255,255,255,0.55)",
} as CSSProperties;

const SUJETS = [
  { titre: "Gestion du risque", texte: "Stop loss, règle du 1 %, taille de position." },
  { titre: "Lecture de graphique", texte: "Tendance, range, supports et résistances." },
  { titre: "Carnet d'ordres", texte: "Bid, ask, liquidité, gros ordres." },
  { titre: "Prop firms", texte: "Règles d'un challenge, perte du jour, drawdown." },
];

export default async function TutricePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const question = typeof q === "string" && q.trim() ? q.slice(0, 300) : undefined;

  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Xeilosia, ta tutrice</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Pose ta question.<br />
            <span className="text-white/50">Même la plus simple.</span>
          </h1>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div style={sombre} className="min-w-0 text-white">
              <Chat question={question} hauteur="h-[min(680px,calc(100svh-220px))] min-h-[460px]" />
            </div>

            <aside className="space-y-6">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">Elle peut t&apos;aider sur</div>
                <ul className="mt-4 space-y-3">
                  {SUJETS.map((s) => (
                    <li key={s.titre} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="text-[14px] text-white">{s.titre}</div>
                      <div className="mt-1 text-[12px] leading-relaxed text-white/55">{s.texte}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-[12px] leading-relaxed text-white/55">
                Xeilosia explique la méthode : elle ne te dira jamais quoi acheter ni quand, et ne promet aucun gain. Un mot
                inconnu ?{" "}
                <Link href="/dashboard/lexique" className="text-white underline underline-offset-4">
                  Ouvre le lexique
                </Link>
                .
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
