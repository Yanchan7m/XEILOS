"use client";

export type Candle = { o: number; h: number; l: number; c: number };

type Props = {
  data: Candle[];
  support?: number;
  resistance?: number;
  caption?: string;
};

export default function CandlestickChart({
  data,
  support,
  resistance,
  caption,
}: Props) {
  const w = 560;
  const h = 240;
  const pad = { l: 38, r: 14, t: 14, b: 26 };

  const allHigh = Math.max(...data.map((d) => d.h), resistance ?? -Infinity);
  const allLow = Math.min(...data.map((d) => d.l), support ?? Infinity);
  const margin = (allHigh - allLow) * 0.12;
  const yMax = allHigh + margin;
  const yMin = allLow - margin;

  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const slot = innerW / data.length;
  const candleW = Math.max(3, slot * 0.65);

  const x = (i: number) => pad.l + slot * (i + 0.5);
  const y = (v: number) =>
    pad.t + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = yMin + ((yMax - yMin) * i) / yTicks;
    return Number(v.toFixed(1));
  });

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[#0b1120] p-4 text-white shadow-sm">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
        <span>Chandeliers japonais · 20 dernières bougies</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5">XEILOS</span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        role="img"
        aria-label="Graphique en chandeliers japonais"
      >
        {/* gridlines + Y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={y(t)}
              y2={y(t)}
              stroke="#1f2a3d"
              strokeDasharray="2 4"
            />
            <text
              x={pad.l - 6}
              y={y(t) + 3}
              fontSize="9"
              fill="#6b7689"
              textAnchor="end"
            >
              {t}
            </text>
          </g>
        ))}

        {/* support line */}
        {support !== undefined && (
          <g>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={y(support)}
              y2={y(support)}
              stroke="#16a34a"
              strokeOpacity="0.55"
              strokeDasharray="6 5"
              strokeWidth="1.2"
            />
            <text
              x={w - pad.r - 4}
              y={y(support) - 4}
              fontSize="9"
              fill="#22c55e"
              textAnchor="end"
            >
              Support {support}
            </text>
          </g>
        )}
        {/* resistance line */}
        {resistance !== undefined && (
          <g>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={y(resistance)}
              y2={y(resistance)}
              stroke="#d92128"
              strokeOpacity="0.6"
              strokeDasharray="6 5"
              strokeWidth="1.2"
            />
            <text
              x={w - pad.r - 4}
              y={y(resistance) - 4}
              fontSize="9"
              fill="#f87171"
              textAnchor="end"
            >
              Résistance {resistance}
            </text>
          </g>
        )}

        {/* candles */}
        {data.map((d, i) => {
          const cx = x(i);
          const isUp = d.c >= d.o;
          const color = isUp ? "#22c55e" : "#ef4458";
          const bodyTop = y(Math.max(d.o, d.c));
          const bodyBottom = y(Math.min(d.o, d.c));
          const bodyH = Math.max(1.5, bodyBottom - bodyTop);
          return (
            <g key={i}>
              <line
                x1={cx}
                x2={cx}
                y1={y(d.h)}
                y2={y(d.l)}
                stroke={color}
                strokeWidth="1.2"
              />
              <rect
                x={cx - candleW / 2}
                y={bodyTop}
                width={candleW}
                height={bodyH}
                fill={isUp ? color : color}
                opacity={isUp ? 0.9 : 0.95}
                rx="0.8"
              />
            </g>
          );
        })}

        {/* X axis baseline */}
        <line
          x1={pad.l}
          x2={w - pad.r}
          y1={h - pad.b}
          y2={h - pad.b}
          stroke="#1f2a3d"
        />
      </svg>
      {caption && (
        <div className="mt-2 text-center text-[11px] text-white/50">{caption}</div>
      )}
    </div>
  );
}
