"use client";

import { useEffect, useRef, useState } from "react";
import { EXERCISES, type LineExercise } from "@/lib/exercises";
import {
  SCALPING_QCM,
  type ScalpingQuestion,
  type ScalpStaticChart as ScalpStaticChartData,
  type ScalpChartView,
} from "@/lib/scalping-qcm";
import {
  ORDERBOOK_EXOS,
  type WallExercise,
  type BiasExercise,
  type DomLevel,
} from "@/lib/orderbook";
import YanAnalysis from "@/components/YanAnalysis";

/* ------------------------------------------------------------------ */
/*  Séquence : 2 support/résistance + 2 graphiques + 2 carnet d'ordre  */
/* ------------------------------------------------------------------ */

type Step =
  | { type: "line"; cat: string; ex: LineExercise }
  | { type: "chart"; cat: string; q: ScalpingQuestion }
  | { type: "domWall"; cat: string; exo: WallExercise }
  | { type: "domBias"; cat: string; exo: BiasExercise };

const lineExos = EXERCISES.filter(
  (e): e is LineExercise => e.kind === "line",
);
const chart1 = SCALPING_QCM.find(
  (q) => q.id === "scalp-nas-gap-consolidation",
)!;
const chart2 = SCALPING_QCM.find((q) => q.id === "scalp-eurusd-crt")!;
const domWall = ORDERBOOK_EXOS.find(
  (e) => e.id === "dom-bid-wall",
) as WallExercise;
const domBias = ORDERBOOK_EXOS.find(
  (e) => e.id === "dom-bias",
) as BiasExercise;

const STEPS: Step[] = [
  { type: "line", cat: "Support / Résistance", ex: lineExos[0] },
  { type: "line", cat: "Support / Résistance", ex: lineExos[1] },
  { type: "chart", cat: "Lecture graphique", q: chart1 },
  { type: "chart", cat: "Lecture graphique", q: chart2 },
  { type: "domWall", cat: "Carnet d'ordre", exo: domWall },
  { type: "domBias", cat: "Carnet d'ordre", exo: domBias },
];

/* ------------------------------------------------------------------ */
/*  Graphique chandeliers + ligne à faire glisser (support/résistance) */
/* ------------------------------------------------------------------ */

const W = 560;
const H = 250;
const PAD = { l: 40, r: 16, t: 16, b: 26 };
const INNER_W = W - PAD.l - PAD.r;
const INNER_H = H - PAD.t - PAD.b;
const round05 = (v: number) => Math.round(v * 2) / 2;

function lineRange(ex: LineExercise) {
  const allHigh = Math.max(...ex.data.map((d) => d.h), ex.target);
  const allLow = Math.min(...ex.data.map((d) => d.l), ex.target);
  const margin = (allHigh - allLow) * 0.12 || 1;
  return { yMin: allLow - margin, yMax: allHigh + margin };
}

function LinePlacer({
  ex,
  placed,
  onChange,
  validated,
  good,
}: {
  ex: LineExercise;
  placed: number | null;
  onChange: (v: number) => void;
  validated: boolean;
  good: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const { yMin, yMax } = lineRange(ex);
  const slot = INNER_W / ex.data.length;
  const candleW = Math.max(3, slot * 0.62);
  const xFor = (i: number) => PAD.l + slot * (i + 0.5);
  const yFor = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * INNER_H;
  const targetColor = ex.lineType === "support" ? "#22c55e" : "#f87171";

  function priceFromClientY(clientY: number): number {
    const svg = svgRef.current;
    if (!svg) return placed ?? yMin;
    const rect = svg.getBoundingClientRect();
    const yPx = ((clientY - rect.top) / rect.height) * H;
    const clamped = Math.min(PAD.t + INNER_H, Math.max(PAD.t, yPx));
    return yMin + (1 - (clamped - PAD.t) / INNER_H) * (yMax - yMin);
  }

  function nudge(d: number) {
    if (validated || placed == null) return;
    onChange(Math.min(yMax, Math.max(yMin, round05(placed + d))));
  }

  const lineC = validated ? (good ? "#22c55e" : "#f59e0b") : "#facc15";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[#0b1120] p-4 text-white shadow-sm">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
        <span>Fais glisser la ligne à la bonne hauteur</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5">XEILOS</span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Graphique en chandeliers interactif"
        style={{ touchAction: "none" }}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const v = yMin + ((yMax - yMin) * i) / 4;
          return (
            <g key={i}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={yFor(v)}
                y2={yFor(v)}
                stroke="#1f2a3d"
                strokeDasharray="2 4"
              />
              <text
                x={PAD.l - 6}
                y={yFor(v) + 3}
                fontSize="9"
                fill="#6b7689"
                textAnchor="end"
              >
                {Number(v.toFixed(1))}
              </text>
            </g>
          );
        })}

        {ex.data.map((d, i) => {
          const cx = xFor(i);
          const isUp = d.c >= d.o;
          const color = isUp ? "#22c55e" : "#ef4458";
          const bodyTop = yFor(Math.max(d.o, d.c));
          const bodyBottom = yFor(Math.min(d.o, d.c));
          const bodyH = Math.max(1.5, bodyBottom - bodyTop);
          return (
            <g key={i}>
              <line
                x1={cx}
                x2={cx}
                y1={yFor(d.h)}
                y2={yFor(d.l)}
                stroke={color}
                strokeWidth="1.2"
              />
              <rect
                x={cx - candleW / 2}
                y={bodyTop}
                width={candleW}
                height={bodyH}
                fill={color}
                opacity={isUp ? 0.9 : 0.95}
                rx="0.8"
              />
            </g>
          );
        })}

        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={H - PAD.b}
          y2={H - PAD.b}
          stroke="#1f2a3d"
        />

        {/* bonne réponse révélée */}
        {validated && (
          <g>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={yFor(ex.target)}
              y2={yFor(ex.target)}
              stroke={targetColor}
              strokeOpacity="0.9"
              strokeDasharray="6 5"
              strokeWidth="1.6"
            />
            <text
              x={W - PAD.r - 4}
              y={yFor(ex.target) - 4}
              fontSize="9"
              fill={targetColor}
              textAnchor="end"
            >
              {ex.lineType === "support" ? "Support" : "Résistance"} {ex.target}
            </text>
          </g>
        )}

        {/* ligne de l'apprenant */}
        {placed != null && (
          <g>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={yFor(placed)}
              y2={yFor(placed)}
              stroke={lineC}
              strokeWidth="2"
              strokeDasharray={validated ? "0" : "6 4"}
            />
            <circle cx={W - PAD.r - 10} cy={yFor(placed)} r="6" fill={lineC} />
            <rect
              x={PAD.l + 2}
              y={yFor(placed) - 16}
              width="54"
              height="14"
              rx="3"
              fill={lineC}
            />
            <text
              x={PAD.l + 6}
              y={yFor(placed) - 5}
              fontSize="9"
              fontWeight="600"
              fill="#0b1120"
            >
              Ta ligne {placed}
            </text>
          </g>
        )}

        {/* zone de drag */}
        {!validated && (
          <rect
            x={PAD.l}
            y={PAD.t}
            width={INNER_W}
            height={INNER_H}
            fill="transparent"
            className="cursor-ns-resize"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
              onChange(round05(priceFromClientY(e.clientY)));
            }}
            onPointerMove={(e) => {
              if (!dragging) return;
              onChange(round05(priceFromClientY(e.clientY)));
            }}
            onPointerUp={(e) => {
              setDragging(false);
              try {
                e.currentTarget.releasePointerCapture(e.pointerId);
              } catch {}
            }}
          />
        )}
      </svg>

      {!validated && (
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/60">
          <span>Réglage précis :</span>
          <button
            onClick={() => nudge(0.5)}
            className="rounded-md border border-white/20 px-2 py-0.5 text-white/80 transition hover:bg-white/10"
            aria-label="Monter la ligne"
          >
            ▲
          </button>
          <button
            onClick={() => nudge(-0.5)}
            className="rounded-md border border-white/20 px-2 py-0.5 text-white/80 transition hover:bg-white/10"
            aria-label="Descendre la ligne"
          >
            ▼
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Graphique TradingView live (lecture graphique)                     */
/* ------------------------------------------------------------------ */

function TradingViewChart({
  symbol,
  interval,
  id,
}: {
  symbol: string;
  interval: string;
  id: string;
}) {
  const params = new URLSearchParams({
    symbol,
    interval,
    hidesidetoolbar: "1",
    symboledit: "0",
    saveimage: "0",
    toolbarbg: "0b1120",
    theme: "dark",
    style: "1",
    timezone: "Etc/UTC",
    locale: "fr",
    hideideas: "1",
    frameElementId: `tv_${id}`,
  });
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0b1120] shadow-sm">
      <div className="flex items-center justify-between px-4 pt-3 text-[10px] uppercase tracking-widest text-white/60">
        <span>
          {symbol.replace(":", " · ")} · {interval}min
        </span>
        <span className="rounded-full bg-white/10 px-2 py-0.5">
          Graphique live · TradingView
        </span>
      </div>
      <div className="mt-2 aspect-[16/9] w-full">
        <iframe
          key={`${symbol}-${interval}`}
          src={`https://s.tradingview.com/widgetembed/?${params.toString()}`}
          title={`Graphique ${symbol}`}
          className="h-full w-full border-0"
          loading="lazy"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Graphique dessiné INTERACTIF (chandeliers + volume)                */
/*  - pas de flux live : les bougies illustrent exactement l'énoncé    */
/*  - on peut le faire glisser (pan) pour parcourir la séance          */
/*  - bascule entre plusieurs timeframes : M5 / M15 / H1               */
/* ------------------------------------------------------------------ */

const SC = {
  W: 560,
  H: 300,
  PAD: { l: 46, r: 16, t: 16, b: 20 },
  VOL_H: 46, // hauteur du panneau de volume
  GAPY: 10, // espace prix / volume
};

const tfLabel: Record<ScalpChartView["tf"], string> = {
  M5: "5 min",
  M15: "15 min",
  H1: "1 h",
};

function ScalpStaticChart({ chart }: { chart: ScalpStaticChartData }) {
  const [tfIdx, setTfIdx] = useState(0);
  const view: ScalpChartView = chart.views[tfIdx];
  const { candles, rangeLow, rangeHigh, gapIndex } = view;

  const len = candles.length;
  const win = Math.min(view.window, len);
  const maxOffset = Math.max(0, len - win);
  const initOffset = Math.min(maxOffset, Math.max(0, (gapIndex ?? 0) - 4));

  const [offset, setOffset] = useState(initOffset);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; off: number } | null>(null);

  // À chaque changement de timeframe, on recadre sur le gap / la consolidation.
  useEffect(() => {
    setOffset(initOffset);
  }, [tfIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const priceH = SC.H - SC.PAD.t - SC.PAD.b - SC.VOL_H - SC.GAPY;
  const priceTop = SC.PAD.t;
  const volTop = SC.PAD.t + priceH + SC.GAPY;
  const innerW = SC.W - SC.PAD.l - SC.PAD.r;
  const slot = innerW / win;
  const candleW = Math.max(3, slot * 0.62);

  const clampOff = (o: number) => Math.min(maxOffset, Math.max(0, o));

  // Échelle Y auto sur la fenêtre visible → sensation « live » au pan.
  const vis0 = Math.floor(offset);
  const vis1 = Math.min(len - 1, vis0 + win);
  const visible = candles.slice(vis0, vis1 + 1);
  const pMax = Math.max(...visible.map((d) => d.h), rangeHigh);
  const pMin = Math.min(...visible.map((d) => d.l), rangeLow);
  const pMargin = (pMax - pMin) * 0.12 || 1;
  const yMax = pMax + pMargin;
  const yMin = pMin - pMargin;
  const vMax = Math.max(...visible.map((d) => d.v), 1);

  const cx = (i: number) => SC.PAD.l + (i - offset) * slot + slot / 2;
  const py = (v: number) =>
    priceTop + (1 - (v - yMin) / (yMax - yMin)) * priceH;
  const vy = (v: number) => volTop + SC.VOL_H - (v / vMax) * SC.VOL_H;

  const ticks = Array.from({ length: 5 }, (_, i) =>
    Number((yMin + ((yMax - yMin) * i) / 4).toFixed(0)),
  );

  function onPointerDown(e: React.PointerEvent<SVGRectElement>) {
    if (maxOffset === 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, off: offset };
  }
  function onPointerMove(e: React.PointerEvent<SVGRectElement>) {
    if (!drag.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const pxPerCandle = (rect.width / SC.W) * slot;
    const dx = e.clientX - drag.current.x;
    setOffset(clampOff(drag.current.off - dx / pxPerCandle));
  }
  function onPointerUp(e: React.PointerEvent<SVGRectElement>) {
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }

  const step = (d: number) => setOffset((o) => clampOff(o + d));
  const clipId = `clip-${view.tf}`;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-[var(--ink)] shadow-sm">
      {/* En-tête : instrument + sélecteur de timeframe */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          {chart.label}
        </span>
        <div
          className="flex gap-1 rounded-full bg-[var(--surface-2)] p-0.5"
          role="group"
          aria-label="Choisir l'unité de temps"
        >
          {chart.views.map((v, i) => (
            <button
              key={v.tf}
              onClick={() => setTfIdx(i)}
              aria-pressed={i === tfIdx}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                i === tfIdx
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {v.tf}
            </button>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SC.W} ${SC.H}`}
        width="100%"
        role="img"
        aria-label={`Graphique NAS100 ${tfLabel[view.tf]} interactif : gap up puis consolidation à volume décroissant`}
        style={{ touchAction: "none" }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={SC.PAD.l}
              y={priceTop}
              width={innerW}
              height={volTop + SC.VOL_H - priceTop}
            />
          </clipPath>
        </defs>

        {/* gridlines + Y labels (prix) */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={SC.PAD.l}
              x2={SC.W - SC.PAD.r}
              y1={py(t)}
              y2={py(t)}
              stroke="#e5e7eb"
              strokeDasharray="2 4"
            />
            <text
              x={SC.PAD.l - 6}
              y={py(t) + 3}
              fontSize="9"
              fill="#6b7689"
              textAnchor="end"
            >
              {t}
            </text>
          </g>
        ))}

        {/* zone du range surlignée + bornes support / résistance */}
        <rect
          x={SC.PAD.l}
          y={py(rangeHigh)}
          width={innerW}
          height={py(rangeLow) - py(rangeHigh)}
          fill="#0ea5e9"
          opacity="0.08"
        />
        <line
          x1={SC.PAD.l}
          x2={SC.W - SC.PAD.r}
          y1={py(rangeHigh)}
          y2={py(rangeHigh)}
          stroke="#dc2626"
          strokeOpacity="0.8"
          strokeDasharray="6 5"
          strokeWidth="1.3"
        />
        <text
          x={SC.W - SC.PAD.r - 4}
          y={py(rangeHigh) - 4}
          fontSize="9"
          fill="#dc2626"
          textAnchor="end"
        >
          Haut du range {rangeHigh}
        </text>
        <line
          x1={SC.PAD.l}
          x2={SC.W - SC.PAD.r}
          y1={py(rangeLow)}
          y2={py(rangeLow)}
          stroke="#16a34a"
          strokeOpacity="0.8"
          strokeDasharray="6 5"
          strokeWidth="1.3"
        />
        <text
          x={SC.W - SC.PAD.r - 4}
          y={py(rangeLow) + 11}
          fontSize="9"
          fill="#16a34a"
          textAnchor="end"
        >
          Bas du range {rangeLow}
        </text>

        {/* contenu déplaçable (bougies, volume, gap), rogné à la zone de tracé */}
        <g clipPath={`url(#${clipId})`}>
          {/* annotation du gap (si visible) */}
          {gapIndex !== undefined &&
            gapIndex >= vis0 &&
            gapIndex <= vis1 && (
              <g>
                <line
                  x1={cx(gapIndex)}
                  x2={cx(gapIndex)}
                  y1={priceTop}
                  y2={volTop + SC.VOL_H}
                  stroke="#d97706"
                  strokeOpacity="0.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={cx(gapIndex)}
                  y={priceTop + 9}
                  fontSize="9"
                  fill="#b45309"
                  textAnchor="middle"
                >
                  Gap up
                </text>
              </g>
            )}

          {/* bougies (prix) */}
          {candles.slice(vis0, vis1 + 1).map((d, k) => {
            const i = vis0 + k;
            const x = cx(i);
            const isUp = d.c >= d.o;
            const color = isUp ? "#16a34a" : "#dc2626";
            const bodyTop = py(Math.max(d.o, d.c));
            const bodyBottom = py(Math.min(d.o, d.c));
            const bodyH = Math.max(1.5, bodyBottom - bodyTop);
            return (
              <g key={i}>
                <line
                  x1={x}
                  x2={x}
                  y1={py(d.h)}
                  y2={py(d.l)}
                  stroke={color}
                  strokeWidth="1.2"
                />
                <rect
                  x={x - candleW / 2}
                  y={bodyTop}
                  width={candleW}
                  height={bodyH}
                  fill={color}
                  opacity={isUp ? 0.9 : 0.95}
                  rx="0.8"
                />
              </g>
            );
          })}

          {/* barres de volume */}
          {candles.slice(vis0, vis1 + 1).map((d, k) => {
            const i = vis0 + k;
            const x = cx(i);
            const isUp = d.c >= d.o;
            const barH = (d.v / vMax) * SC.VOL_H;
            return (
              <rect
                key={`v${i}`}
                x={x - candleW / 2}
                y={vy(d.v)}
                width={candleW}
                height={Math.max(1, barH)}
                fill={isUp ? "#16a34a" : "#dc2626"}
                opacity="0.45"
                rx="0.6"
              />
            );
          })}
        </g>

        <text
          x={SC.PAD.l - 6}
          y={volTop + SC.VOL_H - 1}
          fontSize="8"
          fill="#6b7689"
          textAnchor="end"
        >
          Vol
        </text>

        {/* zone de capture du drag (pan) */}
        <rect
          x={SC.PAD.l}
          y={priceTop}
          width={innerW}
          height={volTop + SC.VOL_H - priceTop}
          fill="transparent"
          style={{ cursor: maxOffset > 0 ? "grab" : "default" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </svg>

      {/* Contrôles de déplacement */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted)]">
        <span>
          {maxOffset > 0
            ? "Glisse le graphique pour te déplacer dans la séance"
            : "Vue d'ensemble de la séance"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => step(-4)}
            disabled={offset <= 0}
            aria-label="Reculer dans le temps"
            className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] disabled:opacity-30"
          >
            ◀
          </button>
          <button
            onClick={() => step(4)}
            disabled={offset >= maxOffset}
            aria-label="Avancer dans le temps"
            className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] disabled:opacity-30"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Carnet d'ordre (DOM)                                               */
/* ------------------------------------------------------------------ */

function DomLadder({
  levels,
  side,
  pickedPrice,
  onPick,
  validated,
  targetPrice,
  clickable,
}: {
  levels: DomLevel[];
  side: "bid" | "ask";
  pickedPrice: number | null;
  onPick: (p: number) => void;
  validated: boolean;
  targetPrice?: number;
  clickable: boolean;
}) {
  const maxBid = Math.max(...levels.map((l) => l.bid));
  const maxAsk = Math.max(...levels.map((l) => l.ask));

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0b1120] p-3 text-white shadow-sm">
      <div className="mb-2 grid grid-cols-3 px-1 text-[10px] uppercase tracking-widest text-white/50">
        <span className="text-right">Bid (achat)</span>
        <span className="text-center">Prix</span>
        <span>Ask (vente)</span>
      </div>
      <div className="space-y-0.5">
        {levels.map((l) => {
          const isPicked = pickedPrice === l.price;
          const isTarget = validated && targetPrice === l.price;
          const bidW = `${(l.bid / maxBid) * 100}%`;
          const askW = `${(l.ask / maxAsk) * 100}%`;
          const rowBg = isTarget
            ? "bg-green-500/20 ring-1 ring-green-500"
            : isPicked
              ? "bg-[var(--accent)]/25 ring-1 ring-[var(--accent)]"
              : "";
          const Row = clickable && !validated ? "button" : "div";
          return (
            <Row
              key={l.price}
              {...(clickable && !validated
                ? { onClick: () => onPick(l.price), type: "button" as const }
                : {})}
              className={`grid w-full grid-cols-3 items-center gap-1 rounded-md px-1 py-0.5 text-left ${rowBg} ${
                clickable && !validated
                  ? "cursor-pointer hover:bg-white/5"
                  : ""
              }`}
            >
              {/* bid : barre alignée à droite */}
              <span className="flex items-center justify-end gap-1.5">
                <span className="tabular-nums text-[11px] text-green-300">
                  {l.bid}
                </span>
                <span className="relative hidden h-3 w-16 sm:block">
                  <span
                    className="absolute right-0 top-0 h-full rounded-sm bg-green-500/40"
                    style={{ width: bidW }}
                  />
                </span>
              </span>
              {/* prix */}
              <span className="text-center text-[11px] font-semibold tabular-nums text-white/90">
                {l.price}
              </span>
              {/* ask : barre alignée à gauche */}
              <span className="flex items-center gap-1.5">
                <span className="relative hidden h-3 w-16 sm:block">
                  <span
                    className="absolute left-0 top-0 h-full rounded-sm bg-[#ef4458]/45"
                    style={{ width: askW }}
                  />
                </span>
                <span className="tabular-nums text-[11px] text-[#f9a3ab]">
                  {l.ask}
                </span>
              </span>
            </Row>
          );
        })}
      </div>
      <div className="mt-2 text-center text-[10px] text-white/40">
        {side === "bid" ? "Mur d'achat = support" : "Mur de vente = résistance"}{" "}
        · tailles en contrats
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Orchestrateur                                                      */
/* ------------------------------------------------------------------ */

type Answer = {
  placed: number | null;
  selected: number | null;
  pickedPrice: number | null;
  pickedBias: "long" | "short" | null;
};

const emptyAnswer: Answer = {
  placed: null,
  selected: null,
  pickedPrice: null,
  pickedBias: null,
};

export default function ParcoursExercices() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<Answer>(emptyAnswer);
  const [validated, setValidated] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const total = STEPS.length;
  const finished = step >= total;
  const current = STEPS[step];

  function scrollToTop() {
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Réinit à chaque étape (valeur de départ de la ligne, loin de la réponse)
  useEffect(() => {
    if (!current) return;
    if (current.type === "line") {
      const { yMin, yMax } = lineRange(current.ex);
      const start =
        current.ex.lineType === "support"
          ? yMin + (yMax - yMin) * 0.62
          : yMin + (yMax - yMin) * 0.38;
      setAnswer({ ...emptyAnswer, placed: round05(start) });
    } else {
      setAnswer(emptyAnswer);
    }
    setValidated(false);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (finished) {
    const score = results.filter(Boolean).length;
    const pct = Math.round((score / total) * 100);
    const wrongModules = results.some((r) => !r)
      ? ["Analyse technique · Trading"]
      : [];

    return (
      <div
        ref={cardRef}
        className="scroll-mt-24 rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm sm:p-10"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Résultat du parcours
        </div>
        <h3 className="mt-2 text-3xl font-semibold text-[var(--ink)]">
          {score} / {total} bonnes décisions
        </h3>
        <p className="mt-1 text-base text-[var(--muted)]">
          Support/résistance, lecture graphique et carnet d'ordre — {pct} %.
        </p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                results[i]
                  ? "border-green-500/40 bg-green-50 text-green-700"
                  : "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent-strong)]"
              }`}
            >
              <span>{results[i] ? "✓" : "✕"}</span>
              {i + 1}. {s.cat}
            </span>
          ))}
        </div>

        <YanAnalysis wrongModules={wrongModules} score={score} total={total} />

        <button
          onClick={() => {
            setStep(0);
            setResults([]);
            scrollToTop();
          }}
          className="mt-6 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
        >
          Refaire le parcours
        </button>
      </div>
    );
  }

  if (!current) return null;

  const progress = Math.round(((step + (validated ? 1 : 0)) / total) * 100);
  const score = results.filter(Boolean).length;

  // prompt / explication / hint selon le type
  const prompt =
    current.type === "line"
      ? current.ex.prompt
      : current.type === "chart"
        ? current.q.question
        : current.exo.prompt;
  const hint =
    current.type === "line"
      ? current.ex.hint
      : current.type === "chart"
        ? undefined
        : current.exo.hint;
  const explanation =
    current.type === "line"
      ? current.ex.explanation
      : current.type === "chart"
        ? current.q.explanation
        : current.exo.explanation;

  // peut-on valider ?
  const canValidate =
    current.type === "line"
      ? answer.placed != null
      : current.type === "chart"
        ? answer.selected != null
        : current.type === "domWall"
          ? answer.pickedPrice != null
          : answer.pickedBias != null;

  function computeCorrect(): boolean {
    if (current.type === "line") {
      return (
        answer.placed != null &&
        Math.abs(answer.placed - current.ex.target) <= current.ex.tolerance
      );
    }
    if (current.type === "chart") {
      return (
        answer.selected != null &&
        current.q.options[answer.selected]?.correct === true
      );
    }
    if (current.type === "domWall") {
      return answer.pickedPrice === current.exo.targetPrice;
    }
    return answer.pickedBias === current.exo.answer;
  }

  function validate() {
    if (validated || !canValidate) return;
    setValidated(true);
    setResults((r) => [...r, computeCorrect()]);
  }

  const lastCorrect = validated ? results[results.length - 1] : undefined;

  return (
    <div
      ref={cardRef}
      className="scroll-mt-24 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>
          Exercice {step + 1} / {total}
        </span>
        <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-[10px] text-[var(--muted)]">
          {current.cat}
        </span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[#7a0e12] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3
        key={step}
        className="fade-up text-xl font-semibold leading-snug text-[var(--ink)] sm:text-2xl"
      >
        {prompt}
      </h3>
      {hint && !validated && (
        <p className="mt-1 text-xs italic text-[var(--muted)]">💡 {hint}</p>
      )}

      {/* ---- WIDGET selon le type ---- */}
      <div className="fade-up mt-5">
        {current.type === "line" && (
          <LinePlacer
            ex={current.ex}
            placed={answer.placed}
            onChange={(v) => setAnswer((a) => ({ ...a, placed: v }))}
            validated={validated}
            good={lastCorrect === true}
          />
        )}

        {current.type === "chart" && (
          <>
            {current.q.staticChart ? (
              <ScalpStaticChart chart={current.q.staticChart} />
            ) : (
              <TradingViewChart
                symbol={current.q.symbol}
                interval={current.q.interval}
                id={current.q.id}
              />
            )}
            <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs leading-relaxed text-[var(--muted-strong)]">
              <span className="font-semibold text-[var(--ink)]">
                Contexte :{" "}
              </span>
              {current.q.context}
            </p>
          </>
        )}

        {current.type === "domWall" && (
          <DomLadder
            levels={current.exo.levels}
            side={current.exo.side}
            pickedPrice={answer.pickedPrice}
            onPick={(p) => setAnswer((a) => ({ ...a, pickedPrice: p }))}
            validated={validated}
            targetPrice={current.exo.targetPrice}
            clickable
          />
        )}

        {current.type === "domBias" && (
          <DomLadder
            levels={current.exo.levels}
            side="bid"
            pickedPrice={null}
            onPick={() => {}}
            validated={validated}
            clickable={false}
          />
        )}
      </div>

      {/* ---- REPONSES pour chart (QCM) et domBias (long/short) ---- */}
      {current.type === "chart" && (
        <div className="mt-5 grid gap-2.5">
          {current.q.options.map((opt, i) => {
            const isSelected = answer.selected === i;
            const isCorrect = opt.correct;
            let cls =
              "border-[var(--border)] bg-white hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/40";
            if (validated) {
              if (isCorrect)
                cls = "border-green-500/50 bg-green-50 text-[var(--ink)]";
              else if (isSelected)
                cls =
                  "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--ink)]";
              else cls = "border-[var(--border)] bg-white opacity-60";
            } else if (isSelected) {
              cls = "border-[var(--accent)] bg-[var(--accent-soft)]/40";
            }
            return (
              <button
                key={opt.label}
                onClick={() =>
                  !validated && setAnswer((a) => ({ ...a, selected: i }))
                }
                disabled={validated}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${cls} disabled:cursor-default`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border)] bg-white"
                  } text-[10px]`}
                >
                  {isSelected ? "✓" : ""}
                </span>
                <span className="flex-1">{opt.label}</span>
                {validated && isCorrect && (
                  <span className="text-xs font-semibold text-green-600">
                    Bonne réponse
                  </span>
                )}
                {validated && isSelected && !isCorrect && (
                  <span className="text-xs font-semibold text-[var(--accent)]">
                    À revoir
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {current.type === "domBias" && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {(["long", "short"] as const).map((side) => {
            const isSelected = answer.pickedBias === side;
            const isCorrect = current.exo.answer === side;
            let cls =
              "border-[var(--border)] bg-white hover:border-[var(--accent)]";
            if (validated) {
              if (isCorrect) cls = "border-green-500/50 bg-green-50";
              else if (isSelected)
                cls = "border-[var(--accent)]/40 bg-[var(--accent-soft)]";
              else cls = "border-[var(--border)] bg-white opacity-60";
            } else if (isSelected) {
              cls = "border-[var(--accent)] bg-[var(--accent-soft)]/40";
            }
            return (
              <button
                key={side}
                onClick={() =>
                  !validated &&
                  setAnswer((a) => ({ ...a, pickedBias: side }))
                }
                disabled={validated}
                className={`rounded-2xl border px-4 py-4 text-center text-sm font-semibold transition ${cls} disabled:cursor-default`}
              >
                {side === "long" ? "📈 Long (achat)" : "📉 Short (vente)"}
              </button>
            );
          })}
        </div>
      )}

      {/* ---- FEEDBACK ---- */}
      {validated && (
        <div
          className={`fade-up mt-5 rounded-2xl border p-4 text-sm ${
            lastCorrect
              ? "border-green-500/40 bg-green-50 text-[var(--ink)]"
              : "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--ink)]"
          }`}
        >
          <div
            className={`text-[10px] font-semibold uppercase tracking-widest ${
              lastCorrect ? "text-green-600" : "text-[var(--accent)]"
            }`}
          >
            {lastCorrect ? "Bien joué" : "À revoir"}
          </div>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {/* ---- ACTIONS ---- */}
      <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="text-xs text-[var(--muted)]">
          Score en cours : <strong>{score}</strong> /{" "}
          {step + (validated ? 1 : 0)}
        </div>
        {!validated ? (
          <button
            onClick={validate}
            disabled={!canValidate}
            className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-2"
          >
            Valider
          </button>
        ) : (
          <button
            onClick={() => {
              setStep((s) => s + 1);
              scrollToTop();
            }}
            className="w-full rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent)] sm:w-auto sm:py-2"
          >
            {step + 1 < total ? "Exercice suivant →" : "Voir l'analyse de Yan"}
          </button>
        )}
      </div>
    </div>
  );
}
