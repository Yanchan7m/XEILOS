"use client";

import { useEffect, useRef, useState } from "react";

export type Candle = { o: number; h: number; l: number; c: number };

type Props = {
  data: Candle[];
  support?: number;
  resistance?: number;
  caption?: string;
  /** Anime le graphique : la dernière bougie se forme en direct. */
  live?: boolean;
  /** Étiquette affichée à côté du point LIVE. */
  symbol?: string;
};

const TICK_MS = 260;
/** Nombre de ticks avant qu'une bougie se clôture et qu'une nouvelle s'ouvre. */
const TICKS_PER_CANDLE = 7;

/**
 * Prolonge la série d'origine par une bougie qui se forme tick par tick, pour
 * donner l'impression d'un flux de prix réel pendant que la question est posée.
 */
function useLiveCandles(data: Candle[], live: boolean) {
  const [series, setSeries] = useState<Candle[]>(data);
  const tick = useRef(0);

  useEffect(() => {
    setSeries(data);
    tick.current = 0;
  }, [data]);

  useEffect(() => {
    if (!live) return;

    // Amplitude calée sur la volatilité de la série pour rester crédible.
    const ranges = data.map((d) => d.h - d.l);
    const vol = ranges.reduce((a, b) => a + b, 0) / Math.max(1, ranges.length);

    const id = setInterval(() => {
      setSeries((prev) => {
        const next = prev.slice();
        const last = next[next.length - 1];
        const step = (Math.random() - 0.5) * vol * 0.7;
        const c = Number((last.c + step).toFixed(2));

        if (tick.current % TICKS_PER_CANDLE === TICKS_PER_CANDLE - 1) {
          // La bougie se clôture : on en ouvre une nouvelle et on décale la fenêtre.
          next.push({ o: c, h: c, l: c, c });
          if (next.length > data.length) next.shift();
        } else {
          next[next.length - 1] = {
            o: last.o,
            h: Math.max(last.h, c),
            l: Math.min(last.l, c),
            c,
          };
        }
        tick.current += 1;
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [live, data]);

  return series;
}

export default function CandlestickChart({
  data: rawData,
  support,
  resistance,
  caption,
  live = false,
  symbol = "XEILOS",
}: Props) {
  const data = useLiveCandles(rawData, live);
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

  const lastCandle = data[data.length - 1];
  const lastUp = lastCandle ? lastCandle.c >= lastCandle.o : true;

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = yMin + ((yMax - yMin) * i) / yTicks;
    return Number(v.toFixed(1));
  });

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[#0b1120] p-4 text-white shadow-sm">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
        <span>Chandeliers japonais · 20 dernières bougies</span>
        {live ? (
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[#22c55e]">Live</span>
            <span className="text-white/40">· {symbol}</span>
          </span>
        ) : (
          <span className="rounded-full bg-white/10 px-2 py-0.5">{symbol}</span>
        )}
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

        {/* prix courant : ligne + étiquette qui suivent la dernière bougie */}
        {live && lastCandle && (
          <g>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={y(lastCandle.c)}
              y2={y(lastCandle.c)}
              stroke={lastUp ? "#22c55e" : "#ef4458"}
              strokeOpacity="0.5"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <rect
              x={w - pad.r - 44}
              y={y(lastCandle.c) - 8}
              width="44"
              height="16"
              rx="3"
              fill={lastUp ? "#22c55e" : "#ef4458"}
            />
            <text
              x={w - pad.r - 22}
              y={y(lastCandle.c) + 4}
              fontSize="10"
              fontWeight="600"
              fill="#0b1120"
              textAnchor="middle"
            >
              {lastCandle.c.toFixed(2)}
            </text>
          </g>
        )}

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
