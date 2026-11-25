import Image from "next/image";
import Link from "next/link";
import MasterQCM from "@/components/MasterQCM";
import ParcoursExercices from "@/components/ParcoursExercices";
import ScalpingQCM from "@/components/ScalpingQCM";
import Chat from "@/components/Chat";
import TeacherDashboard from "@/components/TeacherDashboard";
import FlipCard from "@/components/FlipCard";
import AvertissementRisque from "@/components/AvertissementRisque";

export const metadata = {
  title: "Démo · Xeilos",
  description:
    "QCM, tutrice IA, exercices sur graphiques et cartes flip : la pédagogie Xeilos appliquée au trading.",
};

export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
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
                Xeilos
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
                Démo interactive
              </div>
            </div>
          </Link>
          <Link
            href="/dashboard"
            className="flex min-h-10 items-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink)] transition hover:border-[var(--ink)]"
          >
            ← Mon tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        {/* HERO DEMO */}
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--ink)] sm:text-4xl md:text-5xl">
            Essaie la mécanique en live
          </h1>
          <p className="mt-4 text-base text-[var(--muted)]">
            Six briques de la pédagogie Xeilos appliquées au{" "}
            <strong>trading</strong> : QCM réel de trading (gestion du risque,
            structure de marché, scalping — avec graphique chandeliers japonais),
            tutrice IA, un parcours de 7 exercices interactifs (support/résistance,
            lecture de graphique et carnet d’ordres), un QCM scalping, et des
            cartes flip de vocabulaire de trading.
          </p>
        </section>

        {/* Bloc 1 + 2 */}
        <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          <div id="qcm" className="scroll-mt-24">
            <DemoLabel n="1" title="QCM réel · trading & scalping" />
            <MasterQCM />
          </div>
          <div id="chat" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
            <DemoLabel n="2" title="Tutrice IA · Xeilosia" />
            <Chat />
            <div className="mt-8">
              <DemoLabel n="3" title="Écran formateur · temps réel" />
              <TeacherDashboard />
            </div>
          </div>
        </section>

        {/* Bloc 3 — parcours d'exercices : que ferait-on dans cette situation ? */}
        <section id="exercices" className="mt-12 scroll-mt-24">
          <DemoLabel
            n="4"
            title="Parcours d'exercices · que ferait-on dans cette situation ?"
          />
          <div className="mb-4 max-w-2xl text-sm text-[var(--muted)]">
            7 exercices interactifs : <strong>2 support / résistance</strong> à
            placer sur le graphique, <strong>3 lectures de graphique</strong>{" "}
            (que ferais-tu dans cette situation ?), et{" "}
            <strong>2 sur le carnet d’ordres</strong>. À la fin, Xeilosia analyse
            tes 7 décisions.
          </div>
          <ParcoursExercices />
        </section>

        {/* Bloc 4 — QCM scalping sur graphiques TradingView réels */}
        <section id="scalping" className="mt-12 scroll-mt-24">
          <DemoLabel n="5" title="QCM scalping · graphiques TradingView réels" />
          <div className="mb-4 max-w-2xl text-sm text-[var(--muted)]">
            En complément : des setups de scalping (liquidités, breakout,
            sessions) sur de <strong>vrais graphiques TradingView</strong>{" "}
            zoomables, avec la bonne décision de trade à choisir.
          </div>
          <ScalpingQCM />
        </section>

        {/* Bloc 5 */}
        <section id="cartes" className="mt-12 scroll-mt-24">
          <DemoLabel n="6" title="Cartes flip · vocabulaire de trading" />
          <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--muted)]">
                Touche une carte pour révéler la réponse. L’IA programme
                ensuite le bon intervalle de rappel selon ta performance.
              </p>
              <span className="hidden rounded-full bg-[var(--surface)] px-3 py-1 text-[10px] uppercase tracking-widest text-[var(--muted)] sm:inline">
                Les mots de base
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FlipCard
                question="Stop loss ?"
                answer="L’ordre qui coupe ta position automatiquement si le prix va contre toi. Tu le places avant d’entrer, là où ton idée devient fausse."
              />
              <FlipCard
                question="La règle du 1 % ?"
                answer="Ne jamais risquer plus de 1 % de ton compte sur un trade. Sur 10 000 $, c’est 100 $ maximum entre l’entrée et le stop."
              />
              <FlipCard
                question="Le levier ?"
                answer="Il te permet une position plus grosse que ton capital. Il multiplie les gains ET les pertes : c’est le premier piège du débutant."
              />
              <FlipCard
                question="Support et résistance ?"
                answer="Des zones où le prix s’est déjà arrêté : les acheteurs sous le prix (support), les vendeurs au-dessus (résistance)."
              />
              <FlipCard
                question="Range ou tendance ?"
                answer="Tendance : des sommets et des creux de plus en plus hauts (ou bas). Range : des allers-retours entre deux bornes."
              />
              <FlipCard
                question="Carnet d’ordres ?"
                answer="La liste des ordres en attente : à l’achat (bid) sous le prix, à la vente (ask) au-dessus. Un gros bloc peut freiner le prix… ou disparaître."
              />
              <FlipCard
                question="Drawdown ?"
                answer="La baisse de ton compte depuis son plus haut. En challenge prop firm, le dépasser (souvent 10 %) fait échouer le challenge."
              />
              <FlipCard
                question="Revenge trading ?"
                answer="Reprendre un trade tout de suite pour « se refaire » après une perte. La règle : après 2 pertes d’affilée, on arrête pour la journée."
              />
            </div>
          </div>
        </section>

        {/* CTA retour */}
        <section className="mt-16 flex flex-col items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Et maintenant ?
          </div>
          <p className="max-w-md text-sm text-[var(--muted-strong)]">
            Reprends ta formation là où tu en étais, ou entraîne-toi à lire un
            marché avant de décider.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/formation"
              className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent)]"
            >
              Ma formation
            </Link>
            <Link
              href="/dashboard/contexte"
              className="rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              Contexte de marché
            </Link>
          </div>
        </section>

        <AvertissementRisque />

        <footer className="mt-16 flex flex-col items-center gap-2 border-t border-[var(--border)] pt-8 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <Image
              src="/xeilosia-avatar.png"
              alt=""
              width={20}
              height={20}
              className="rounded-full"
            />
            Xeilos.
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
