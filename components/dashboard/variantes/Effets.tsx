"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

// Les ajouts « effet waw » des versions 2 à 6 du tableau de bord.
// Tous respectent « réduire les animations » du système : le résultat final
// s'affiche d'emblée.

function animationsReduites() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ─── V2 · LE CHIFFRE VIVANT ───────────────────────────────────────────────

/** Le nombre défile jusqu'à sa valeur à l'ouverture (1,6 s, ralenti à la fin). */
export function ChiffreAnime({ valeur, duree = 1600 }: { valeur: number; duree?: number }) {
  const [affiche, setAffiche] = useState(valeur);
  useEffect(() => {
    if (animationsReduites()) return;
    const depart = Math.round(valeur * 0.82);
    const t0 = performance.now();
    let id = 0;
    const pas = (t: number) => {
      const p = Math.min(1, (t - t0) / duree);
      const e = 1 - Math.pow(2, -10 * p); // easeOutExpo
      setAffiche(Math.round(depart + (valeur - depart) * (p === 1 ? 1 : e)));
      if (p < 1) id = requestAnimationFrame(pas);
    };
    id = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(id);
  }, [valeur, duree]);
  return <>{affiche.toLocaleString("fr-FR")}</>;
}

/** Point vert qui bat : « Compte synchronisé · il y a 3 s ». */
export function EnDirect() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v >= 9 ? 0 : v + 1)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.07] px-3 py-1 text-[12px] text-emerald-300">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      Compte synchronisé · il y a {s === 0 ? "un instant" : `${s} s`}
    </span>
  );
}

/** Bandeau qui défile : les derniers trades de l'élève. */
export function BandeauTrades() {
  const trades = [
    { a: "NQ", s: "Long", r: +186 },
    { a: "ES", s: "Short", r: -92 },
    { a: "XAUUSD", s: "Long", r: +240 },
    { a: "NQ", s: "Short", r: +118 },
    { a: "EURUSD", s: "Long", r: -61 },
    { a: "YM", s: "Long", r: +97 },
    { a: "NQ", s: "Long", r: +152 },
  ];
  const ligne = [...trades, ...trades];
  return (
    <div className="relative mt-8 overflow-hidden rounded-full border border-white/[0.07] bg-white/[0.02] py-2 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="defile flex w-max gap-8 whitespace-nowrap px-4 text-[13px]">
        {ligne.map((t, i) => (
          <span key={i} className="text-white/60">
            <span className="text-white">{t.a}</span> · {t.s}{" "}
            <span className={t.r >= 0 ? "text-emerald-400" : "text-[var(--accent)]"}>
              {t.r >= 0 ? "+" : "−"}
              {Math.abs(t.r)} $
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── V3 · OBJECTIF FUNDED ─────────────────────────────────────────────────

type Challenge = {
  nom: string;
  objectifPct: number;
  perteJourMaxPct: number;
  drawdownMaxPct: number;
  joursMin: number;
  joursTrades: number;
  perteDuJour: number;
};

function Anneau({ part, taille = 168 }: { part: number; taille?: number }) {
  const r = taille / 2 - 10;
  const c = 2 * Math.PI * r;
  const [p, setP] = useState(0);
  useEffect(() => {
    if (animationsReduites()) {
      setP(part);
      return;
    }
    const id = setTimeout(() => setP(part), 150);
    return () => clearTimeout(id);
  }, [part]);
  return (
    <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`} className="-rotate-90">
      <defs>
        <linearGradient id="anneau-funded" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <circle cx={taille / 2} cy={taille / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
      <circle
        cx={taille / 2}
        cy={taille / 2}
        r={r}
        fill="none"
        stroke="url(#anneau-funded)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(1, Math.max(0, p)))}
        style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)" }}
      />
    </svg>
  );
}

function Jauge({ libelle, utilise, max, unite = "$", progres = false }: { libelle: string; utilise: number; max: number; unite?: string; progres?: boolean }) {
  const part = Math.min(1, utilise / max);
  // Une limite de risque rougit en s'approchant du plafond ; un progrès reste vert.
  const ton = progres ? "bg-emerald-400" : part < 0.5 ? "bg-emerald-400" : part < 0.8 ? "bg-amber-400" : "bg-[var(--accent)]";
  return (
    <div>
      <div className="flex justify-between text-[13px]">
        <span className="text-white/65">{libelle}</span>
        <span className="tabular-nums text-white">
          {utilise.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} / {max.toLocaleString("fr-FR")} {unite}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${ton}`} style={{ width: `${part * 100}%`, transition: "width 1.2s ease-out" }} />
      </div>
    </div>
  );
}

export function ObjectifFunded({ ch, capital, balance, drawdownPct }: { ch: Challenge; capital: number; balance: number; drawdownPct: number }) {
  const cible = capital * (1 + ch.objectifPct / 100);
  const gagne = balance - capital;
  const objectif = cible - capital;
  const part = Math.max(0, gagne / objectif);
  const reste = Math.max(0, cible - balance);
  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-emerald-500/[0.06] via-white/[0.02] to-amber-400/[0.05] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Objectif funded</div>
        <span className="rounded-full border border-white/15 px-3 py-1 text-[12px] text-white/70">{ch.nom}</span>
      </div>
      <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <Anneau part={part} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-light tabular-nums">{Math.round(part * 100)} %</span>
            <span className="text-[12px] text-white/55">de l’objectif</span>
          </div>
        </div>
        <div className="w-full space-y-5">
          <p className="text-[15px] leading-relaxed text-white/85">
            {reste > 0 ? (
              <>
                Plus que <span className="text-emerald-300 tabular-nums">{Math.round(reste).toLocaleString("fr-FR")} $</span> pour
                passer en compte financé. Encore {Math.max(0, ch.joursMin - ch.joursTrades)} jours de trading minimum.
              </>
            ) : (
              <>Objectif atteint : le compte financé t’attend.</>
            )}
          </p>
          <Jauge libelle="Perte du jour" utilise={ch.perteDuJour} max={(capital * ch.perteJourMaxPct) / 100} />
          <Jauge libelle="Drawdown max" utilise={drawdownPct} max={ch.drawdownMaxPct} unite="%" />
          <Jauge libelle="Jours tradés" utilise={ch.joursTrades} max={ch.joursMin} unite="j" progres />
        </div>
      </div>
    </section>
  );
}

// ─── V4 · LE CALENDRIER DE P&L ────────────────────────────────────────────

export function HeatmapPnl({ jours, serie }: { jours: { date: string; pnl: number }[]; serie: number }) {
  const max = Math.max(...jours.map((j) => Math.abs(j.pnl)), 1);
  // Colonnes = semaines, lignes = jours (lundi en haut).
  const premier = (new Date(jours[0].date).getUTCDay() + 6) % 7;
  const cases: ({ date: string; pnl: number } | null)[] = [...Array(premier).fill(null), ...jours];
  const semaines = Math.ceil(cases.length / 7);
  const [survol, setSurvol] = useState<{ date: string; pnl: number } | null>(null);
  const couleur = (pnl: number) => {
    const a = 0.18 + 0.82 * Math.min(1, Math.abs(pnl) / max);
    return pnl >= 0 ? `rgba(52,211,153,${a})` : `rgba(217,33,40,${a})`;
  };
  const gagnants = jours.filter((j) => j.pnl > 0).length;
  const meilleur = jours.reduce((m, j) => (j.pnl > m.pnl ? j : m), jours[0]);
  const pire = jours.reduce((m, j) => (j.pnl < m.pnl ? j : m), jours[0]);
  const jour = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const chiffres = [
    { l: "Jours verts", v: `${Math.round((gagnants / jours.length) * 100)} %`, d: `${gagnants} sur ${jours.length}` },
    { l: "Meilleure série", v: `${serie} j`, d: "verts d’affilée" },
    { l: "Meilleur jour", v: `+${meilleur.pnl} $`, d: jour(meilleur.date), t: "text-emerald-400" },
    { l: "Pire jour", v: `−${Math.abs(pire.pnl)} $`, d: jour(pire.date), t: "text-[var(--accent)]" },
  ];
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Calendrier P&amp;L</div>
        <div className="rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-3 py-1 text-[13px] text-amber-200">
          🔥 Record : {serie} jours verts d’affilée
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="w-full lg:max-w-[560px]">
          <div
            className="grid gap-[3px] sm:gap-1"
            style={{ gridTemplateRows: "repeat(7, auto)", gridTemplateColumns: `repeat(${semaines}, minmax(0, 1fr))`, gridAutoFlow: "column" }}
          >
            {cases.map((c, i) =>
              c ? (
                <button
                  key={i}
                  type="button"
                  aria-label={`${new Date(c.date).toLocaleDateString("fr-FR")} : ${c.pnl} $`}
                  onMouseEnter={() => setSurvol(c)}
                  onFocus={() => setSurvol(c)}
                  className="aspect-square w-full rounded-[3px] outline-none ring-white/70 transition hover:scale-125 focus:ring-1 sm:rounded-[5px]"
                  style={{ background: couleur(c.pnl) }}
                />
              ) : (
                <span key={i} />
              ),
            )}
          </div>
          <div className="mt-3 h-5 text-[13px] text-white/70">
            {survol ? (
              <>
                {new Date(survol.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
                <span className={survol.pnl >= 0 ? "text-emerald-400" : "text-[var(--accent)]"}>
                  {survol.pnl >= 0 ? "+" : "−"}
                  {Math.abs(survol.pnl)} $
                </span>
              </>
            ) : (
              <span className="text-white/40">Survole un jour pour voir son résultat</span>
            )}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07]">
          {chiffres.map((c) => (
            <div key={c.l} className="bg-[#101013] px-4 py-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">{c.l}</div>
              <div className={`mt-2 text-2xl font-light tabular-nums ${c.t ?? "text-white"}`}>{c.v}</div>
              <div className="mt-1 text-[12px] text-white/45">{c.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── V5 · LE BRIEFING DE XEILOSIA ─────────────────────────────────────────

export function BriefingXeilosia({ texte, constats }: { texte: string; constats: { titre: string; detail: string; ton: "vert" | "orange" | "rouge" }[] }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (animationsReduites()) {
      setN(texte.length);
      return;
    }
    const id = setInterval(() => setN((v) => (v >= texte.length ? v : v + 2)), 22);
    return () => clearInterval(id);
  }, [texte]);
  const fini = n >= texte.length;
  const tons = { vert: "border-emerald-500/30 text-emerald-300", orange: "border-amber-400/30 text-amber-200", rouge: "border-[var(--accent)]/40 text-red-300" };
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <span className="agent-ring h-11 w-11 overflow-hidden rounded-full border border-white/20">
          <Image src="/xeilosia-avatar.png" alt="" width={44} height={44} className="h-full w-full object-cover" />
        </span>
        <div>
          <div className="text-[15px] text-white">Ton briefing du jour</div>
          <div className="text-[12px] text-white/50">par Xeilosia · préparé à partir de tes 64 trades</div>
        </div>
      </div>
      <p className="relative mt-6 min-h-[5.5rem] text-lg leading-relaxed text-white/90 sm:text-xl" aria-label={texte}>
        <span aria-hidden>
          {texte.slice(0, n)}
          {!fini && <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-white/80" />}
        </span>
      </p>
      <div className={`relative mt-6 grid gap-3 sm:grid-cols-3 ${fini ? "fade-up" : "opacity-0"}`}>
        {constats.map((c) => (
          <div key={c.titre} className={`rounded-2xl border bg-black/20 p-4 ${tons[c.ton]}`}>
            <div className="text-[13px] font-medium">{c.titre}</div>
            <div className="mt-1 text-[13px] leading-relaxed text-white/70">{c.detail}</div>
          </div>
        ))}
      </div>
      <div className="relative mt-6 flex flex-wrap gap-2">
        {["Pourquoi mon stop était trop serré ?", "Fais-moi réviser le Bloc 2", "Analyse ma semaine"].map((q) => (
          <a key={q} href="/demo#chat" className="rounded-full border border-white/15 px-4 py-2 text-[13px] text-white/80 transition hover:border-white/40 hover:text-white">
            {q}
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── V6 · LA SÉANCE DU JOUR ───────────────────────────────────────────────

const SESSIONS = [
  { nom: "Asie", debut: 1, fin: 10, couleur: "bg-sky-400/50" },
  { nom: "Londres", debut: 9, fin: 17.5, couleur: "bg-violet-400/50" },
  { nom: "New York", debut: 15.5, fin: 22, couleur: "bg-[var(--accent)]/60" },
];

function heureParis(d: Date) {
  const [h, m, s] = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
    .format(d)
    .split(":")
    .map(Number);
  return h + m / 60 + s / 3600;
}

export function SessionsMarche() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = now ? heureParis(now) : null;
  const ouvertes = h === null ? [] : SESSIONS.filter((s) => h >= s.debut && h < s.fin).map((s) => s.nom);
  const avantNY = h === null ? null : ((15.5 - h + 24) % 24) * 3600;
  const fmt = (sec: number) => {
    const hh = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60), ss = Math.floor(sec % 60);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Sessions de marché</div>
          <div className="mt-2 text-[13px] text-white/55">
            {h === null ? " " : ouvertes.length ? `Ouvert : ${ouvertes.join(" + ")}` : "Marchés calmes · aucune grande session ouverte"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12px] text-white/55">Ouverture de New York dans</div>
          <div className="font-mono text-3xl tabular-nums text-white">{avantNY === null ? "--:--:--" : fmt(avantNY)}</div>
        </div>
      </div>
      <div className="relative mt-8">
        <div className="space-y-2">
          {SESSIONS.map((s) => (
            <div key={s.nom} className="relative h-7 rounded-md bg-white/[0.03]">
              <div
                className={`absolute inset-y-0 flex items-center rounded-md px-2 text-[12px] text-white ${s.couleur}`}
                style={{ left: `${(s.debut / 24) * 100}%`, width: `${((s.fin - s.debut) / 24) * 100}%` }}
              >
                {s.nom}
              </div>
            </div>
          ))}
        </div>
        {h !== null && (
          <div className="pointer-events-none absolute -bottom-2 -top-2 w-px bg-white" style={{ left: `${(h / 24) * 100}%` }}>
            <span className="absolute -top-5 -translate-x-1/2 rounded bg-white px-1.5 text-[11px] font-medium tabular-nums text-black">
              {String(Math.floor(h)).padStart(2, "0")}:{String(Math.floor((h % 1) * 60)).padStart(2, "0")}
            </span>
          </div>
        )}
        <div className="mt-4 flex justify-between text-[11px] text-white/40">
          {[0, 6, 12, 18, 24].map((x) => (
            <span key={x}>{x}h</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ChecklistTrade() {
  const points = useMemo(
    () => [
      "J’ai regardé le calendrier économique",
      "Mon biais H4 / H1 est noté",
      "Ma zone d’entrée et mon stop sont posés avant d’entrer",
      "Je risque 1 % maximum",
      "Je suis calme, pas en revanche",
    ],
    [],
  );
  const [coches, setCoches] = useState<boolean[]>(() => points.map(() => false));
  const faits = coches.filter(Boolean).length;
  const pret = faits === points.length;
  return (
    <section className={`rounded-3xl border p-6 transition-colors sm:p-8 ${pret ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-white/[0.08] bg-white/[0.02]"}`}>
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Avant de trader</div>
        <span className="text-[13px] tabular-nums text-white/60">
          {faits} / {points.length}
        </span>
      </div>
      <ul className="mt-5 space-y-2">
        {points.map((p, i) => (
          <li key={p}>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.03]">
              <input
                type="checkbox"
                checked={coches[i]}
                onChange={() => setCoches((c) => c.map((v, j) => (j === i ? !v : v)))}
                className="h-4 w-4 accent-emerald-400"
              />
              <span className={`text-[15px] ${coches[i] ? "text-white/45 line-through" : "text-white/90"}`}>{p}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className={`mt-5 text-[15px] ${pret ? "fade-up text-emerald-300" : "text-white/45"}`}>
        {pret ? "✓ Plan validé. Tu peux ouvrir le Terminal." : "Coche tout avant d’ouvrir une position."}
      </div>
    </section>
  );
}
