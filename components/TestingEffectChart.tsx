"use client";

/**
 * Effet de test, graphique de rétention.
 * Inspiré des travaux de Roediger & Karpicke (2006, 2008) sur le retrieval practice :
 * tester son savoir activement (QCM, rappel) renforce la mémoire bien plus
 * que de relire passivement un cours.
 */
export default function TestingEffectChart() {
  // Points: [day, retention %]
  const days = [0, 1, 2, 7, 14, 30];
  const noTest = [100, 60, 44, 30, 22, 15];
  const withTest = [100, 88, 82, 75, 70, 65];

  const w = 520;
  const h = 260;
  const pad = { l: 40, r: 16, t: 16, b: 36 };
  const xMax = 30;
  const yMax = 100;

  const x = (d: number) => pad.l + (d / xMax) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / yMax) * (h - pad.t - pad.b);

  const path = (vals: number[]) =>
    vals
      .map((v, i) => `${i === 0 ? "M" : "L"} ${x(days[i]).toFixed(1)} ${y(v).toFixed(1)}`)
      .join(" ");

  const yTicks = [0, 25, 50, 75, 100];
  const xTicks = [0, 7, 14, 21, 30];

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Effet de test · Retrieval practice
          </div>
          <h3 className="mt-2 text-xl font-semibold text-[var(--ink)] sm:text-2xl">
            Rétention de l’information dans le temps
          </h3>
          <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
            Roediger & Karpicke (2006) ont montré qu’un simple QCM régulier
            augmente la rétention long terme de <strong>+50 %</strong> par
            rapport à la relecture passive.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <Legend color="var(--accent)" label="Avec QCM (effet de test)" />
          <Legend color="#94a3b8" label="Sans QCM (relecture seule)" dashed />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          width="100%"
          className="min-w-[480px]"
          role="img"
          aria-label="Courbe de rétention avec et sans effet de test"
        >
          {/* gridlines */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={y(t)}
                y2={y(t)}
                stroke="#eef2f7"
              />
              <text
                x={pad.l - 8}
                y={y(t) + 3}
                fontSize="10"
                fill="#94a3b8"
                textAnchor="end"
              >
                {t}%
              </text>
            </g>
          ))}
          {xTicks.map((d) => (
            <text
              key={d}
              x={x(d)}
              y={h - 14}
              fontSize="10"
              fill="#94a3b8"
              textAnchor="middle"
            >
              J+{d}
            </text>
          ))}
          {/* zone gain */}
          <defs>
            <linearGradient id="gainGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#d92128" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#d92128" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${path(withTest)} L ${x(30)} ${y(0)} L ${x(0)} ${y(0)} Z`}
            fill="url(#gainGrad)"
          />

          {/* curve: no test (dashed) */}
          <path
            d={path(noTest)}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="draw-line"
          />
          {/* curve: with test */}
          <path
            d={path(withTest)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            className="draw-line draw-line-delay"
          />

          {/* end labels */}
          <g>
            <circle cx={x(30)} cy={y(65)} r="4" fill="var(--accent)" />
            <text
              x={x(30) - 6}
              y={y(65) - 10}
              fontSize="11"
              fontWeight="600"
              fill="var(--accent-strong)"
              textAnchor="end"
            >
              65 %
            </text>
            <circle cx={x(30)} cy={y(15)} r="4" fill="#94a3b8" />
            <text
              x={x(30) - 6}
              y={y(15) + 16}
              fontSize="11"
              fontWeight="600"
              fill="#64748b"
              textAnchor="end"
            >
              15 %
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat value="+50%" label="Rétention long terme avec test régulier" />
        <Stat value="×2,3" label="Vitesse d’ancrage vs relecture" />
        <Stat value="-70%" label="Oubli à 30 jours" />
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[var(--muted)]">
      <span
        className="inline-block h-[3px] w-6 rounded"
        style={{
          background: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)`
            : color,
        }}
      />
      {label}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="text-2xl font-bold text-[var(--accent)]">{value}</div>
      <div className="mt-1 text-xs text-[var(--muted)]">{label}</div>
    </div>
  );
}
