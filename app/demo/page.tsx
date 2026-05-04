import Image from "next/image";
import Link from "next/link";
import MasterQCM from "@/components/MasterQCM";
import Chat from "@/components/Chat";
import FlipCard from "@/components/FlipCard";

export const metadata = {
  title: "Démo · Xeilos × Ask Amélie",
  description:
    "QCM réel, tuteur IA et cartes flip : la pédagogie Ask Amélie appliquée au Master Xeilos.",
};

export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1 ring-1 ring-[var(--border)] transition group-hover:ring-[var(--accent)]/40">
              <Image
                src="/xeilos-logo.jpeg"
                alt="Xeilos Trading Academy"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[var(--ink)]">
                Xeilos × Ask Amélie
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
                Démo interactive
              </div>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink)] transition hover:border-[var(--ink)]"
          >
            ← Retour à la présentation
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16">
        {/* HERO DEMO */}
        <section className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--muted)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
            Démonstration en direct
          </div>
          <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-[var(--ink)] sm:text-4xl md:text-5xl">
            Essaie la mécanique en live
          </h1>
          <p className="mt-4 text-base text-[var(--muted)]">
            Trois briques de la pédagogie Ask Amélie appliquées au{" "}
            <strong>Master Xeilos</strong> : QCM réel issu des modules
            (avec graphique chandeliers japonais sur la Q3), tuteur IA, et
            cartes flip de vocabulaire stratégie.
          </p>
        </section>

        {/* Bloc 1 + 2 */}
        <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          <div>
            <DemoLabel n="1" title="QCM réel · modules du Master" />
            <MasterQCM />
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <DemoLabel n="2" title="Tuteur IA · Alex" />
            <Chat />
          </div>
        </section>

        {/* Bloc 3 */}
        <section className="mt-12">
          <DemoLabel n="3" title="Cartes flip · vocabulaire stratégie" />
          <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--muted)]">
                Clique sur une carte pour révéler la réponse. L’IA programme
                ensuite le bon intervalle de rappel selon ta performance.
              </p>
              <span className="hidden rounded-full bg-[var(--surface)] px-3 py-1 text-[10px] uppercase tracking-widest text-[var(--muted)] sm:inline">
                Module Stratégie & KPI
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FlipCard
                question="Que signifie SWOT ?"
                answer="Strengths, Weaknesses, Opportunities, Threats. Outil d’analyse stratégique croisant facteurs internes et externes."
              />
              <FlipCard
                question="PESTEL, c’est quoi ?"
                answer="Politique, Économique, Social, Technologique, Environnemental, Légal. Analyse du macro-environnement externe."
              />
              <FlipCard
                question="Que veut dire DMAIC ?"
                answer="Define, Measure, Analyze, Improve, Control. Méthode structurante de Six Sigma pour optimiser un processus."
              />
              <FlipCard
                question="KPI : critères SMART ?"
                answer="Spécifique, Mesurable, Atteignable, Pertinent, Temporellement défini. Cadre de conception d’un bon indicateur."
              />
              <FlipCard
                question="5 Forces de Porter ?"
                answer="Rivalité concurrents, pouvoir clients, pouvoir fournisseurs, menace nouveaux entrants, menace produits de substitution. Mesure l’intensité concurrentielle d’un secteur."
              />
              <FlipCard
                question="Balanced Scorecard ?"
                answer="Tableau de bord de Kaplan & Norton qui évalue la performance selon 4 perspectives : Financière, Clients, Processus internes, Apprentissage & croissance."
              />
              <FlipCard
                question="Cycle PDCA ?"
                answer="Plan, Do, Check, Act. Cycle d’amélioration continue (Lean / Kaizen) : planifier, exécuter, vérifier, ajuster, puis recommencer."
              />
            </div>
          </div>
        </section>

        {/* CTA back */}
        <section className="mt-16 flex flex-col items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Tu veux comprendre la méthode ?
          </div>
          <p className="max-w-md text-sm text-[var(--muted-strong)]">
            Reviens à la présentation pour voir le concept Ask Amélie, l’étude
            scientifique sur l’effet de test et le plan de déploiement Xeilos.
          </p>
          <Link
            href="/"
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent)]"
          >
            ← Retour à la présentation
          </Link>
        </section>

        <footer className="mt-16 flex flex-col items-center gap-2 border-t border-[var(--border)] pt-8 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <Image
              src="/agent-face.png"
              alt=""
              width={20}
              height={20}
              className="rounded-full"
            />
            Démonstration interne, Xeilos × Ask Amélie.
          </div>
          <div>© {new Date().getFullYear()} Xeilos Trading Academy</div>
        </footer>
      </main>
    </div>
  );
}

function DemoLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-white">
        {n}
      </span>
      <span>{title}</span>
    </div>
  );
}
