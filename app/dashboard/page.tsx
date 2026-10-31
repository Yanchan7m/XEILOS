import Image from "next/image";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import Sidebar from "@/components/dashboard/Sidebar";
import PerformancePanel, { type TradeStats } from "@/components/dashboard/PerformancePanel";
import Countdown, { Today } from "@/components/dashboard/Countdown";
import type { EquityPoint } from "@/components/dashboard/EquityChart";

export const metadata = {
  title: "Tableau de bord · Xeilos",
  description: "Ton espace élève : capital, performance, formation et accompagnement.",
};

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

const START_CAPITAL = 10_000;

/** Courbe de capital de démo : 120 jours déterministes (même rendu à chaque build). */
function demoEquity(): EquityPoint[] {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const end = new Date("2026-10-20T00:00:00Z").getTime();
  let balance = START_CAPITAL;
  return Array.from({ length: 120 }, (_, i) => {
    if (i > 0) balance += (rand() - 0.44) * 140;
    return {
      date: new Date(end - (119 - i) * 86_400_000).toISOString(),
      balance: Math.round(balance),
    };
  });
}

const STATS: TradeStats = {
  trades: 64,
  winRate: 56.3,
  profitFactor: 1.62,
  avgWin: 118,
  avgLoss: 92,
  maxDrawdown: 3.4,
  bestDay: 412,
  avgRR: 1.8,
};

const COACH = { rating: 4.2, notedTrades: 12 };
const FORMATION = { watched: 18, total: 109, nextBlock: "Bloc 1", nextVideo: "Les règles des prop firms" };

export default function DashboardPage() {
  const points = demoEquity();
  const balance = points[points.length - 1].balance;
  const pnl = balance - START_CAPITAL;
  const pnlPct = (pnl / START_CAPITAL) * 100;
  const formationPct = Math.round((FORMATION.watched / FORMATION.total) * 100);

  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      {/* Fond : halo sombre + trame de points façon onde */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 40% 70%, rgba(255,255,255,0.05), transparent 60%), radial-gradient(800px 500px at 0% 100%, rgba(217,33,40,0.07), transparent 60%)",
        }}
      />

      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-8 sm:px-8 sm:py-10 lg:px-10 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-0">
          {/* COLONNE CENTRALE */}
          <div className="xl:pr-12">
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div>
                <Today serifClass={serif.className} />
                <div className="mt-8 text-[12px] font-medium uppercase tracking-[0.3em] text-white/80 sm:mt-10">Balance</div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-6xl font-light tracking-tight text-transparent tabular-nums sm:text-8xl">
                    {balance.toLocaleString("fr-FR")}
                  </span>
                  <span className="mb-3 text-3xl font-light text-white/60">$</span>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/70">
                  P&amp;L réalisé
                  <span className="text-lg text-white tabular-nums">
                    {pnl >= 0 ? "+" : "−"}
                    {Math.abs(pnl).toLocaleString("fr-FR")} $
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs tabular-nums ${
                      pnl >= 0
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                    }`}
                  >
                    {pnl >= 0 ? "+" : ""}
                    {pnlPct.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %
                  </span>
                </div>
              </div>

              <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:w-auto sm:border-0 sm:bg-transparent sm:p-0 sm:text-right">
                <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Note du coach</div>
                <div className="mt-4 flex items-center gap-3 sm:mt-5 sm:justify-end">
                  <Stars value={COACH.rating} />
                  <span className={`${serif.className} text-5xl italic`}>
                    {COACH.rating.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}
                  </span>
                  <span className="self-end pb-1 text-sm text-white/50">/5</span>
                </div>
                <div className="mt-2 text-[13px] text-white/60">{COACH.notedTrades} trades notés</div>
                <Link href="#" className="mt-2 inline-block text-[13px] text-white/75 hover:text-white">
                  Voir les retours du coach ↗
                </Link>
              </div>
            </div>

            <div className="mt-12 h-px bg-white/[0.08]" />

            <PerformancePanel points={points} startCapital={START_CAPITAL} stats={STATS} />
          </div>

          {/* COLONNE « TON ESPACE » */}
          <aside className="md:grid md:grid-cols-2 md:gap-x-10 xl:block xl:border-l xl:border-white/[0.08] xl:pl-12">
            <h2 className="mb-8 text-3xl text-white md:col-span-2">
              Ton <span className={`${serif.className} italic`}>espace</span>
            </h2>

            <Section title="Accompagnement">
              <div className="flex items-center gap-2 text-[12px] text-white/60">
                <Image src="/xeilosia-avatar.png" alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
                Dernier message de Xeilosia · Aujourd’hui à 13:37
              </div>
              <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-white/90">
                Salut Yanis 👋 Ton dernier trade sur le NASDAQ respectait ton plan, mais ton stop était trop
                serré par rapport à la volatilité de l’ouverture. On en parle ?
              </p>
              <dl className="mt-6 space-y-3 text-sm">
                <Row label="Plan d’action" value="1 / 3 fait" />
                <Row label="Envois en attente" value="0" />
                <Row label="À retravailler" value="2" />
              </dl>
              <ArrowLink href="/demo#chat">Ouvrir mon suivi</ArrowLink>
            </Section>

            <Section title="Formation">
              <div className="text-4xl font-light tabular-nums">{formationPct} %</div>
              <div className="mt-3 h-[3px] rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white/80" style={{ width: `${formationPct}%` }} />
              </div>
              <div className="mt-3 text-[12px] text-white/55">
                {FORMATION.watched} / {FORMATION.total} vidéos regardées
              </div>
              <div className="mt-6 text-[13px] text-white/60">Prochaine vidéo · {FORMATION.nextBlock}</div>
              <div className="mt-1 text-[15px] text-white">{FORMATION.nextVideo}</div>
              <ArrowLink href="/demo">Continuer la formation</ArrowLink>
            </Section>

            <div className="border-t border-white/[0.08] py-8">
              <div className="text-[13px] text-white/60">Prochain call</div>
              <div className="mt-2 text-[15px] text-white">
                Call de groupe <span className="text-white/60">avec les coachs Xeilos</span>
              </div>
              <div className="mt-1 text-[13px] text-white/60">Samedi · 18h00, heure de Paris</div>
              <div className="mt-1 text-[13px] text-[var(--accent)]">
                <Countdown weekday={6} hour={18} />
              </div>
            </div>

            <Section title="Nouveautés Xeilos">
              <div className="text-[12px] text-white/55"># annonces · Aujourd’hui à 13:21</div>
              <p className="mt-2 text-[15px] text-white/90">
                Le QCM adaptatif du Bloc 2 est en ligne : les questions ratées te seront resservies dans 3 jours.
              </p>
            </Section>
          </aside>
        </div>
      </main>

      {/* Bulle Xeilosia */}
      <Link
        href="/demo#chat"
        aria-label="Parler à Xeilosia"
        className="agent-ring fixed bottom-4 right-4 z-20 sm:bottom-6 sm:right-6 h-14 w-14 overflow-hidden rounded-full border border-white/20 bg-black"
      >
        <Image src="/xeilosia-avatar.png" alt="" width={56} height={56} className="h-full w-full object-cover" />
      </Link>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} viewBox="0 0 24 24" className="h-5 w-5">
            <defs>
              <linearGradient id={`star-${i}`}>
                <stop offset={fill} stopColor="#fff" stopOpacity={0.9} />
                <stop offset={fill} stopColor="#fff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z"
              fill={`url(#star-${i})`}
              stroke="#fff"
              strokeOpacity={0.45}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/[0.08] py-8">
      <h3 className="mb-5 text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-white/65">{label}</dt>
      <dd className="tabular-nums text-white">{value}</dd>
    </div>
  );
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mt-6 inline-flex items-center gap-2 text-[13px] text-white hover:text-white/70">
      {children} <span aria-hidden>→</span>
    </Link>
  );
}
