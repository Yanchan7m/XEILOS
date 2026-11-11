import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Countdown from "./Countdown";
import { COACH, FORMATION } from "@/lib/dashboard-demo";

// Les blocs de base du tableau de bord élève. /dashboard et ses 6 versions
// les reprennent tous ; chaque version ajoute ou réorganise autour d'eux.

export function Fond() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{
        backgroundImage:
          "radial-gradient(1200px 600px at 40% 70%, rgba(255,255,255,0.05), transparent 60%), radial-gradient(800px 500px at 0% 100%, rgba(217,33,40,0.07), transparent 60%)",
      }}
    />
  );
}

export function Libelle({ children }: { children: ReactNode }) {
  return <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">{children}</div>;
}

const pct = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Balance + P&L réalisé. `chiffre` remplace le nombre affiché (version animée). */
export function Balance({ balance, pnl, pnlPct, chiffre }: { balance: number; pnl: number; pnlPct: number; chiffre?: ReactNode }) {
  return (
    <div>
      <Libelle>Balance</Libelle>
      <div className="mt-2 flex items-end gap-2">
        <span className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-6xl font-light tracking-tight text-transparent tabular-nums sm:text-8xl">
          {chiffre ?? balance.toLocaleString("fr-FR")}
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
          {pct(pnlPct)} %
        </span>
      </div>
    </div>
  );
}

export function NoteCoach({ serifClass, alignDroite = true, nu = false }: { serifClass: string; alignDroite?: boolean; nu?: boolean }) {
  // `nu` : sans son cadre de téléphone, quand il est déjà posé dans une carte.
  const cadre = nu ? "" : "w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:w-auto sm:border-0 sm:bg-transparent sm:p-0";
  return (
    <div className={`${cadre} ${alignDroite ? "sm:text-right" : ""}`}>
      <Libelle>Note du coach</Libelle>
      <div className={`mt-4 flex items-center gap-3 sm:mt-5 ${alignDroite ? "sm:justify-end" : ""}`}>
        <Stars value={COACH.rating} />
        <span className={`${serifClass} text-5xl italic`}>
          {COACH.rating.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}
        </span>
        <span className="self-end pb-1 text-sm text-white/50">/5</span>
      </div>
      <div className="mt-2 text-[13px] text-white/60">{COACH.notedTrades} trades notés</div>
      <Link href="#" className="mt-2 inline-block text-[13px] text-white/75 hover:text-white">
        Voir les retours du coach ↗
      </Link>
    </div>
  );
}

export function Accompagnement() {
  return (
    <>
      <div className="flex items-center gap-2 text-[12px] text-white/60">
        <Image src="/xeilosia-avatar.png" alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
        Dernier message de Xeilosia · Aujourd’hui à 13:37
      </div>
      <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-white/90">
        Salut Yanis 👋 Ton dernier trade sur le NASDAQ respectait ton plan, mais ton stop était trop serré par
        rapport à la volatilité de l’ouverture. On en parle ?
      </p>
      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Plan d’action" value="1 / 3 fait" />
        <Row label="Envois en attente" value="0" />
        <Row label="À retravailler" value="2" />
      </dl>
      <ArrowLink href="/demo#chat">Ouvrir mon suivi</ArrowLink>
    </>
  );
}

export function Formation({ formationPct }: { formationPct: number }) {
  return (
    <>
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
    </>
  );
}

export function ProchainCall() {
  return (
    <>
      <div className="text-[13px] text-white/60">Prochain call</div>
      <div className="mt-2 text-[15px] text-white">
        Call de groupe <span className="text-white/60">avec les coachs Xeilos</span>
      </div>
      <div className="mt-1 text-[13px] text-white/60">Samedi · 18h00, heure de Paris</div>
      <div className="mt-1 text-[13px] text-[var(--accent)]">
        <Countdown weekday={6} hour={18} />
      </div>
    </>
  );
}

export function Nouveautes() {
  return (
    <>
      <div className="text-[12px] text-white/55"># annonces · Aujourd’hui à 13:21</div>
      <p className="mt-2 text-[15px] text-white/90">
        Le QCM adaptatif du Bloc 2 est en ligne : les questions ratées te seront resservies dans 3 jours.
      </p>
    </>
  );
}

/** La colonne « Ton espace » telle que sur /dashboard. */
export function TonEspace({ serifClass, formationPct, avant }: { serifClass: string; formationPct: number; avant?: ReactNode }) {
  return (
    <aside className="md:grid md:grid-cols-2 md:gap-x-10 xl:block xl:border-l xl:border-white/[0.08] xl:pl-12">
      <h2 className="mb-8 text-3xl text-white md:col-span-2">
        Ton <span className={`${serifClass} italic`}>espace</span>
      </h2>
      {avant}
      <Section title="Accompagnement">
        <Accompagnement />
      </Section>
      <Section title="Formation">
        <Formation formationPct={formationPct} />
      </Section>
      <div className="border-t border-white/[0.08] py-8">
        <ProchainCall />
      </div>
      <Section title="Nouveautés Xeilos">
        <Nouveautes />
      </Section>
    </aside>
  );
}

export function BulleXeilosia() {
  return (
    <Link
      href="/demo#chat"
      aria-label="Parler à Xeilosia"
      className="agent-ring fixed bottom-4 right-4 z-20 h-14 w-14 overflow-hidden rounded-full border border-white/20 bg-black sm:bottom-6 sm:right-6"
    >
      <Image src="/xeilosia-avatar.png" alt="" width={56} height={56} className="h-full w-full object-cover" />
    </Link>
  );
}

export function Stars({ value }: { value: number }) {
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

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/[0.08] py-8">
      <h3 className="mb-5 text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">{title}</h3>
      {children}
    </section>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-white/65">{label}</dt>
      <dd className="tabular-nums text-white">{value}</dd>
    </div>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mt-6 inline-flex items-center gap-2 text-[13px] text-white hover:text-white/70">
      {children} <span aria-hidden>→</span>
    </Link>
  );
}
