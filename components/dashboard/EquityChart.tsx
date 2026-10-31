"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type EquityPoint = { date: string; balance: number };

const RANGES = [
  { key: "7J", days: 7 },
  { key: "1M", days: 30 },
  { key: "3M", days: 90 },
  { key: "6M", days: 180 },
  { key: "1A", days: 365 },
  { key: "Tout", days: Infinity },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

const PAD_B = 28;

const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
const fmtPct = (n: number) =>
  `${n >= 0 ? "+" : ""}${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "") + ".";

export default function EquityChart({
  points,
  startCapital,
}: {
  points: EquityPoint[];
  startCapital: number;
}) {
  const [range, setRange] = useState<RangeKey>("Tout");
  const [hover, setHover] = useState<number | null>(null);

  // Le dessin suit la largeur réelle du bloc : textes lisibles sur téléphone comme sur grand écran
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(720);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const small = W < 520;
  const H = small ? 240 : 320;
  const PAD_R = small ? 70 : 92;

  const visible = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    if (!Number.isFinite(days)) return points;
    const last = new Date(points[points.length - 1].date).getTime();
    const from = last - days * 86_400_000;
    const sliced = points.filter((p) => new Date(p.date).getTime() >= from);
    return sliced.length >= 2 ? sliced : points.slice(-2);
  }, [points, range]);

  const values = visible.map((p) => p.balance).concat(startCapital);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = Math.max(rawMax - rawMin, startCapital * 0.01);
  const min = rawMin - span * 0.15;
  const max = rawMax + span * 0.15;

  const plotW = W - PAD_R;
  const plotH = H - PAD_B;
  const x = (i: number) => (i / (visible.length - 1)) * plotW;
  const y = (v: number) => plotH - ((v - min) / (max - min)) * plotH;

  const line = visible.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.balance).toFixed(1)}`).join(" ");
  const area = `${line} L${x(visible.length - 1)},${plotH} L0,${plotH} Z`;

  const first = visible[0].balance;
  const last = visible[visible.length - 1].balance;
  const periodPct = ((last - first) / first) * 100;

  const ticks = Array.from({ length: 4 }, (_, i) => max - ((max - min) * (i + 0.5)) / 4);
  const nLabels = small ? 3 : 5;
  const labelIdx = Array.from({ length: nLabels }, (_, i) => Math.round((i * (visible.length - 1)) / (nLabels - 1)));
  const active = hover ?? visible.length - 1;

  return (
    <div ref={box}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">
            Évolution du capital
          </div>
          <div className="mt-2 text-sm text-white/60">
            <span className={periodPct >= 0 ? "text-emerald-400" : "text-[var(--accent)]"}>
              {fmtPct(periodPct)}
            </span>{" "}
            sur la période
          </div>
        </div>
        <div className="flex w-full justify-between rounded-full border sm:w-auto sm:justify-start border-white/10 bg-white/[0.03] p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                range === r.key ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-8 w-full touch-pan-y select-none overflow-visible"
        onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round((px / plotW) * (visible.length - 1));
          setHover(Math.max(0, Math.min(visible.length - 1, i)));
        }}
      >
        <defs>
          <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <text key={t} x={W - 4} y={y(t) + 4} textAnchor="end" className="fill-white/30 text-[11px]">
            {fmt(t)}
          </text>
        ))}

        <path d={area} fill="url(#eq-fill)" />

        <line
          x1={0}
          x2={plotW}
          y1={y(startCapital)}
          y2={y(startCapital)}
          stroke="var(--accent)"
          strokeOpacity={0.7}
          strokeDasharray="4 4"
        />
        <text x={2} y={y(startCapital) + 18} className="fill-[var(--accent)] text-[11px]">
          Capital de départ · {fmt(startCapital)} $
        </text>

        <path d={line} fill="none" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />

        <line x1={x(active)} x2={x(active)} y1={0} y2={plotH} stroke="#fff" strokeOpacity={0.12} />
        <circle cx={x(active)} cy={y(visible[active].balance)} r={7} fill="#0b0b0d" stroke="#fff" strokeOpacity={0.5} />
        <circle cx={x(active)} cy={y(visible[active].balance)} r={3} fill="#fff" />

        <g transform={`translate(${plotW + 10}, ${y(visible[active].balance) - 11})`}>
          <rect width={small ? 60 : 78} height={22} rx={11} fill="rgba(217,33,40,0.18)" stroke="rgba(217,33,40,0.6)" />
          <text x={small ? 30 : 39} y={15} textAnchor="middle" className="fill-white text-[11px]">
            {fmt(visible[active].balance)}
          </text>
        </g>

        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === labelIdx[labelIdx.length - 1] ? "end" : "middle"} className="fill-white/35 text-[11px]">
            {fmtDay(visible[i].date)}
          </text>
        ))}
      </svg>
    </div>
  );
}
