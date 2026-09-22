"use client";

import { useEffect, useRef, useState } from "react";

export type Competence = { label: string; correct: number; total: number };

type Props = {
  title: string;
  score: number;
  total: number;
  competences: Competence[];
  /** Phrase d'accroche sous le score. */
  subtitle?: string;
};

const NIVEAUX = [
  { min: 0, label: "À consolider", color: "#ef4458", conseil: "Reprends les fondamentaux avant de passer à la pratique." },
  { min: 50, label: "En progression", color: "#f59e0b", conseil: "Les bases sont là : cible tes deux modules les plus faibles." },
  { min: 75, label: "Opérationnel", color: "#22c55e", conseil: "Niveau solide. Entraîne-toi sur des cas réels pour ancrer." },
  { min: 100, label: "Maîtrise", color: "#0ea5e9", conseil: "Sans faute. Passe au module suivant du parcours." },
];

function niveauPour(pct: number) {
  return [...NIVEAUX].reverse().find((n) => pct >= n.min) ?? NIVEAUX[0];
}

/** Compteur qui monte de 0 jusqu'à la valeur finale. */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easing out : rapide au début, ralentit à la fin
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return value;
}

export default function BilanFinal({
  title,
  score,
  total,
  competences,
  subtitle,
}: Props) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  const shown = useCountUp(score);
  const niveau = niveauPour(pct);
  const [radarIn, setRadarIn] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setRadarIn(true), 120);
    return () => clearTimeout(id);
  }, []);

  const faibles = competences
    .filter((c) => c.correct < c.total)
    .sort((a, b) => a.correct / a.total - b.correct / b.total);

  return (
    <div className="fade-up overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#0b1120] to-[#132038] p-8 text-white shadow-lg sm:p-10">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">
        {title}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="text-6xl font-semibold tabular-nums leading-none">
          {Math.round(shown)}
          <span className="text-2xl text-white/40"> / {total}</span>
        </div>
        <div
          className="rounded-full px-4 py-1.5 text-sm font-semibold"
          style={{ background: `${niveau.color}22`, color: niveau.color }}
        >
          {niveau.label} · {pct} %
        </div>
      </div>

      {subtitle && <p className="mt-3 text-sm text-white/60">{subtitle}</p>}

      <div className="mt-8 space-y-8">
        <div className="mx-auto w-full max-w-[320px]">
          <Radar competences={competences} active={radarIn} color={niveau.color} />
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/40">
            Plan de révision généré
          </div>
          <ul className="mt-3 space-y-2.5 text-sm">
            {faibles.slice(0, 3).map((c, i) => (
              <li
                key={c.label}
                className="fade-up flex gap-3"
                style={{ animationDelay: `${300 + i * 120}ms` }}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px]">
                  {i + 1}
                </span>
                <span>
                  <strong>{c.label}</strong>{" "}
                  <span className="text-white/60">
                    — {c.correct}/{c.total}. Révision programmée sous{" "}
                    {c.correct === 0 ? "24 h" : "3 jours"}.
                  </span>
                </span>
              </li>
            ))}
            {faibles.length === 0 && (
              <li className="text-white/70">
                Aucun point faible détecté. Xeilosia programme un rappel à 7 jours
                pour ancrer les acquis.
              </li>
            )}
          </ul>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            {niveau.conseil}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Radar SVG : un axe par compétence, le polygone se déploie au montage. */
function Radar({
  competences,
  active,
  color,
}: {
  competences: Competence[];
  active: boolean;
  color: string;
}) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 66;
  const n = Math.max(3, competences.length);

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, ratio: number) => {
    const a = angle(i);
    return [cx + Math.cos(a) * r * ratio, cy + Math.sin(a) * r * ratio];
  };

  const ratios = competences.map((c) => (c.total ? c.correct / c.total : 0));
  const polygon = ratios
    .map((ratio, i) => point(i, active ? Math.max(0.06, ratio) : 0.06).join(","))
    .join(" ");

  return (
    <svg viewBox={`-58 -6 ${size + 116} ${size + 12}`} width="100%" role="img" aria-label="Radar de compétences">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon
          key={g}
          points={Array.from({ length: n }, (_, i) => point(i, g).join(",")).join(" ")}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.12}
        />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={point(i, 1)[0]}
          y2={point(i, 1)[1]}
          stroke="#ffffff"
          strokeOpacity={0.12}
        />
      ))}

      <polygon
        points={polygon}
        fill={color}
        fillOpacity={0.28}
        stroke={color}
        strokeWidth={2}
        style={{ transition: "all 900ms cubic-bezier(.22,1,.36,1)" }}
      />

      {competences.map((c, i) => {
        const [lx, ly] = point(i, 1.3);
        return (
          <text
            key={c.label}
            x={lx}
            y={ly}
            fontSize="9"
            fill="#ffffff"
            fillOpacity={0.6}
            textAnchor={lx > cx + 4 ? "start" : lx < cx - 4 ? "end" : "middle"}
          >
            {c.label.length > 20 ? `${c.label.slice(0, 19)}…` : c.label}
          </text>
        );
      })}
    </svg>
  );
}
