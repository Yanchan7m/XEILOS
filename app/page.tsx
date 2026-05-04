import Image from "next/image";
import MasterQCM from "@/components/MasterQCM";
import Chat from "@/components/Chat";
import TestingEffectChart from "@/components/TestingEffectChart";
import FlipCard from "@/components/FlipCard";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1 ring-1 ring-[var(--border)]">
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
                Démonstration interne
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="#concept"
              className="hidden text-[var(--muted)] transition hover:text-[var(--ink)] sm:inline"
            >
              Concept
            </a>
            <a
              href="#science"
              className="hidden text-[var(--muted)] transition hover:text-[var(--ink)] sm:inline"
            >
              Effet de test
            </a>
            <a
              href="#demo"
              className="rounded-full bg-[var(--ink)] px-3 py-1.5 font-medium text-white transition hover:bg-[var(--accent)]"
            >
              Voir la démo
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16">
        {/* HERO */}
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
            Et si on adaptait{" "}
            <span className="bg-gradient-to-r from-[var(--accent)] to-[#7a0e12] bg-clip-text text-transparent">
              Ask Amélie
            </span>{" "}
            <br className="hidden sm:block" />à la pédagogie Xeilos ?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
            Un tuteur IA conversationnel + des QCM dynamiques générés depuis
            les contenus du Master, pour appliquer l’<strong>effet de test</strong>,
            la méthode d’apprentissage la mieux validée par les neurosciences.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#demo"
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--accent-strong)]"
            >
              Tester la démo
            </a>
            <a
              href="#concept"
              className="rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              Comprendre le concept
            </a>
          </div>
        </section>

        {/* WHAT IS ASK AMELIE */}
        <section id="concept" className="mt-24 sm:mt-28">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Le concept
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
                Ask Amélie, c’est quoi ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-strong)]">
                <a
                  href="https://askamelie.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  Ask Amélie
                </a>{" "}
                est une plateforme française qui transforme un contenu
                pédagogique (cours, support, vidéo) en plusieurs outils :
              </p>
              <ul className="mt-5 space-y-4">
                <Bullet n="1" title="Un quiz progressif (QCM)">
                  Le contenu est découpé et reformulé en questions à choix
                  multiples, accessibles sur mobile, avec correction immédiate
                  et <strong>cartes flip</strong> pour la mémorisation active.
                </Bullet>
                <Bullet n="2" title="Une IA tutrice conversationnelle">
                  L’apprenant peut discuter avec un agent IA qui connaît le
                  cours et répond 24/7, comme un mentor toujours disponible.
                </Bullet>
                <Bullet n="3" title="Un apprentissage adaptatif">
                  La techno apprend de chaque apprenant : une question ratée
                  est <strong>resservie 3 jours plus tard</strong>, puis une
                  semaine, puis un mois (répétition espacée). Chaque parcours
                  devient unique.
                </Bullet>
                <Bullet n="4" title="Un suivi temps réel">
                  Le formateur voit qui décroche, quelles questions reviennent,
                  et où interviennent les blocages, par élève et par cohorte.
                </Bullet>
              </ul>
              <p className="mt-6 text-sm text-[var(--muted)]">
                Aujourd’hui utilisé surtout dans l’hôtellerie et les services.
                On peut transposer cette mécanique <strong>tel quel</strong> sur
                les modules du Master Xeilos.
              </p>
            </div>

            {/* mock interface preview */}
            <div className="relative space-y-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--accent-soft)] to-white" />
                <div className="relative rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    <div className="ml-3 text-[10px] uppercase tracking-widest text-[var(--muted)]">
                      Conversation apprenant ↔ tuteur IA
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <MiniBubble side="left">
                      Bonjour Léa 👋 Petit rappel : tu avais raté cette
                      question il y a <strong>3 jours</strong>. On la refait ?
                    </MiniBubble>
                    <MiniBubble side="right">Go.</MiniBubble>
                    <MiniBubble side="left" highlight>
                      Q. Quel outil analyse les facteurs internes ET externes
                      d’une stratégie ?
                      <br />
                      <span className="opacity-70">
                        A) PESTEL &nbsp; B) SWOT &nbsp; C) 5 Forces de Porter
                      </span>
                    </MiniBubble>
                    <MiniBubble side="right">B</MiniBubble>
                    <MiniBubble side="left">
                      ✅ Bonne réponse cette fois. Prochain rappel dans 7 jours.
                    </MiniBubble>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  <span>Carte flip · clique pour révéler</span>
                  <span>1 / 24</span>
                </div>
                <FlipCard
                  question="Que signifie SWOT ?"
                  answer="Strengths, Weaknesses, Opportunities, Threats. Outil d’analyse stratégique qui croise facteurs internes (Forces, Faiblesses) et externes (Opportunités, Menaces)."
                />
              </div>
            </div>
          </div>
        </section>

        {/* SCIENCE */}
        <section id="science" className="mt-24 sm:mt-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              La science
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              L’effet de test, validé par les neurosciences
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted-strong)]">
              Se tester activement, via des QCM espacés dans le temps,
              ancre les connaissances <strong>bien plus profondément</strong>{" "}
              que la relecture passive. C’est le principe du{" "}
              <em>retrieval practice</em>, démontré par les travaux de Roediger
              & Karpicke (Université de Washington, 2006-2011).
            </p>
          </div>

          <div className="mt-10">
            <TestingEffectChart />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <SciCard
              title="Active recall"
              text="Forcer le cerveau à récupérer une info crée un chemin neuronal plus solide qu’une simple relecture."
            />
            <SciCard
              title="Spacing effect"
              text="Espacer les rappels dans le temps multiplie la rétention long terme. Ebbinghaus, 1885, confirmé en 2020."
            />
            <SciCard
              title="Feedback immédiat"
              text="Une correction donnée tout de suite après la réponse renforce l’apprentissage et corrige les fausses certitudes."
            />
          </div>
        </section>

        {/* APPLICATION XEILOS */}
        <section className="mt-24 sm:mt-28">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Application Xeilos
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
                On démarre avec le Master, on étend ensuite à tout le catalogue
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-strong)]">
                L’idée initiale : équiper tous les élèves du{" "}
                <strong>Master Xeilos</strong> d’un tuteur IA + d’un système
                de QCM dynamique pour entretenir leurs acquis entre deux
                modules (Stratégie d’entreprise, KPI, parties prenantes,
                optimisation des processus, planification…).
              </p>
              <p className="mt-3 text-base leading-relaxed text-[var(--muted-strong)]">
                Mais la mécanique est <strong>générique</strong> : même flux
                pour le MBA Trading, le programme Crypto/DeFi, l’Investissement
                long terme, voire les soft-skills. Une fois le moteur en place,
                on ajoute n’importe quel cours en quelques clics.
              </p>

              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                  Bénéfices côté école
                </div>
                <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
                  <li>• Suivi temps réel des décrocheurs (taux d’abandon ↓)</li>
                  <li>• Identification des modules les moins compris</li>
                  <li>• Différenciateur sur les pages de vente formations</li>
                  <li>• Argument éligibilité Qualiopi / suivi pédagogique</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-3">
              <FormationCard
                title="Master Xeilos (cible initiale)"
                desc="QCM hebdo sur chaque module (stratégie, KPI, parties prenantes…), tuteur IA pour l’explication des concepts et la révision."
                tag="Phase 1"
                primary
              />
              <FormationCard
                title="MBA Trading"
                desc="QCM par chapitre + tuteur IA pour les setups day trading, scalping et préparation prop firm."
                tag="Phase 2"
              />
              <FormationCard
                title="Crypto, Blockchain & DeFi"
                desc="Tests de vocabulaire on-chain, quiz sécurité wallets, veille narratives."
                tag="Phase 2"
              />
              <FormationCard
                title="Investissement long terme"
                desc="QCM analyse fondamentale, ETF, dividendes, rythme mensuel."
                tag="Phase 3"
              />
            </div>
          </div>
        </section>

        {/* DEMO */}
        <section id="demo" className="mt-24 sm:mt-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Démo interactive
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              Essaie la mécanique en live
            </h2>
            <p className="mt-3 text-base text-[var(--muted)]">
              Trois briques de la pédagogie Ask Amélie appliquées au{" "}
              <strong>Master Xeilos</strong> : QCM réel issu des modules,
              tuteur IA, et cartes flip de vocabulaire stratégie.
            </p>
          </div>

          {/* Bloc 1 + 2 : QCM + Chat */}
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            <div>
              <DemoLabel n="1" title="QCM réel · modules du Master" />
              <MasterQCM />
            </div>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <DemoLabel n="2" title="Tuteur IA · Alex" />
              <Chat />
            </div>
          </div>

          {/* Bloc 3 : Cartes flip */}
          <div className="mt-12">
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
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-24 flex flex-col items-center gap-2 border-t border-[var(--border)] pt-8 text-xs text-[var(--muted)]">
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

function Bullet({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
        {n}
      </div>
      <div>
        <div className="font-semibold text-[var(--ink)]">{title}</div>
        <div className="mt-0.5 text-sm text-[var(--muted-strong)]">{children}</div>
      </div>
    </li>
  );
}

function MiniBubble({
  side,
  children,
  highlight,
}: {
  side: "left" | "right";
  children: React.ReactNode;
  highlight?: boolean;
}) {
  const isRight = side === "right";
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
          isRight
            ? "bg-[var(--ink)] text-white"
            : highlight
              ? "border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--ink)]"
              : "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SciCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="text-sm font-semibold text-[var(--ink)]">{title}</div>
      <div className="mt-2 text-sm text-[var(--muted)]">{text}</div>
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

function FormationCard({
  title,
  desc,
  tag,
  primary,
}: {
  title: string;
  desc: string;
  tag: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        primary
          ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold text-[var(--ink)]">{title}</div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            primary
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface-2)] text-[var(--muted)]"
          }`}
        >
          {tag}
        </span>
      </div>
      <div className="mt-1.5 text-sm text-[var(--muted-strong)]">{desc}</div>
    </div>
  );
}
