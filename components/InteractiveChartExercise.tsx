"use client";

import { useEffect, useRef, useState } from "react";
import { EXERCISES, type Exercise } from "@/lib/exercises";
import YanAnalysis from "@/components/YanAnalysis";

const W = 560;
const H = 260;
const PAD = { l: 40, r: 16, t: 16, b: 28 };
const INNER_W = W - PAD.l - PAD.r;
const INNER_H = H - PAD.t - PAD.b;

type Result = { id: string; correct: boolean };

/** Bornes verticales du graphique pour un exercice donné. */
function rangeFor(ex: Exercise) {
  const highs = ex.data.map((d) => d.h);
  const lows = ex.data.map((d) => d.l);
  const extra: number[] = [];
  if (ex.kind === "line") extra.push(ex.target);
  if (ex.kind === "pick" && ex.guide) {
    if (ex.guide.support != null) extra.push(ex.guide.support);
    if (ex.guide.resistance != null) extra.push(ex.guide.resistance);
  }
  const allHigh = Math.max(...highs, ...extra);
  const allLow = Math.min(...lows, ...extra);
  const margin = (allHigh - allLow) * 0.12 || 1;
  return { yMin: allLow - margin, yMax: allHigh + margin };
}

const round05 = (v: number) => Math.round(v * 2) / 2;

export default function InteractiveChartExercise() {
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const total = EXERCISES.length;
  const finished = step >= total;
  const ex = EXERCISES[step];

  function scrollToTop() {
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Réinitialise l'état à chaque changement d'exercice.
  useEffect(() => {
    if (!ex) return;
    if (ex.kind === "line") {
      const { yMin, yMax } = rangeFor(ex);
      // On démarre la ligne loin de la bonne réponse.
      const start =
        ex.lineType === "support"
          ? yMin + (yMax - yMin) * 0.62
          : yMin + (yMax - yMin) * 0.38;
      setPlaced(round05(start));
    } else {
      setPlaced(null);
    }
    setPicked(null);
    setValidated(false);
    setDragging(false);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (finished) {
    const score = results.filter((r) => r.correct).length;
    const pct = Math.round((score / total) * 100);
    const anyWrong = results.some((r) => !r.correct);
    const wrongModules = anyWrong ? ["Analyse technique · Trading"] : [];

    return (
      <div
        ref={cardRef}
        className="scroll-mt-24 rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm sm:p-10"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Résultat des exercices
        </div>
        <h3 className="mt-2 text-3xl font-semibold text-[var(--ink)]">
          {score} / {total} exercices réussis
        </h3>
        <p className="mt-1 text-base text-[var(--muted)]">
          Soit {pct} % sur la lecture graphique interactive.
        </p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {EXERCISES.map((e, i) => {
            const r = results[i];
            return (
              <span
                key={e.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                  r?.correct
                    ? "border-green-500/40 bg-green-50 text-green-700"
                    : "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                }`}
              >
                <span>{r?.correct ? "✓" : "✕"}</span>
                Exercice {i + 1}
              </span>
            );
          })}
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
          Refaire les exercices
        </button>
      </div>
    );
  }

  if (!ex) return null;

  const { yMin, yMax } = rangeFor(ex);
  const slot = INNER_W / ex.data.length;
  const candleW = Math.max(3, slot * 0.62);
  const xFor = (i: number) => PAD.l + slot * (i + 0.5);
  const yFor = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * INNER_H;

  const progress = Math.round(((step + (validated ? 1 : 0)) / total) * 100);
  const score = results.filter((r) => r.correct).length;

  function priceFromClientY(clientY: number): number {
    const svg = svgRef.current;
    if (!svg) return placed ?? yMin;
    const rect = svg.getBoundingClientRect();
    const yPx = ((clientY - rect.top) / rect.height) * H;
    const clamped = Math.min(PAD.t + INNER_H, Math.max(PAD.t, yPx));
    return yMin + (1 - (clamped - PAD.t) / INNER_H) * (yMax - yMin);
  }

  function nudge(delta: number) {
    if (validated || placed == null) return;
    setPlaced((p) => {
      const next = round05((p ?? yMin) + delta);
      return Math.min(yMax, Math.max(yMin, next));
    });
  }

  function validate() {
    if (validated) return;
    let correct = false;
    if (ex.kind === "line") {
      if (placed == null) return;
      correct = Math.abs(placed - ex.target) <= ex.tolerance;
    } else {
      if (picked == null) return;
      correct = Math.abs(picked - ex.targetIndex) <= (ex.tolerance ?? 0);
    }
    setValidated(true);
    setResults((r) => [...r, { id: ex.id, correct }]);
  }

  const lastResult = validated ? results[results.length - 1] : undefined;
  const isLineGood = ex.kind === "line" && lastResult?.correct;
  const lineColor =
    ex.kind === "line" && ex.lineType === "support" ? "#22c55e" : "#f87171";

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
          Interactif
        </span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[#7a0e12] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3
        key={ex.id}
        className="fade-up text-xl font-semibold leading-snug text-[var(--ink)] sm:text-2xl"
      >
        {ex.prompt}
      </h3>
      {ex.hint && !validated && (
        <p className="mt-1 text-xs italic text-[var(--muted)]">💡 {ex.hint}</p>
      )}

      {/* ---- GRAPHIQUE INTERACTIF ---- */}
      <div className="fade-up mt-5 rounded-2xl border border-[var(--border)] bg-[#0b1120] p-4 text-white shadow-sm">
        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
          <span>
            {ex.kind === "line"
              ? "Fais glisser la ligne à la bonne hauteur"
              : "Clique sur la bonne bougie"}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5">XEILOS</span>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label="Graphique en chandeliers japonais interactif"
          style={{ touchAction: "none" }}
        >
          {/* gridlines + labels Y */}
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

          {/* lignes repères (mode pick) */}
          {ex.kind === "pick" && ex.guide?.resistance != null && (
            <GuideLine
              y={yFor(ex.guide.resistance)}
              color="#d92128"
              label={`Résistance ${ex.guide.resistance}`}
            />
          )}
          {ex.kind === "pick" && ex.guide?.support != null && (
            <GuideLine
              y={yFor(ex.guide.support)}
              color="#16a34a"
              label={`Support ${ex.guide.support}`}
            />
          )}

          {/* bougies */}
          {ex.data.map((d, i) => {
            const cx = xFor(i);
            const isUp = d.c >= d.o;
            const color = isUp ? "#22c55e" : "#ef4458";
            const bodyTop = yFor(Math.max(d.o, d.c));
            const bodyBottom = yFor(Math.min(d.o, d.c));
            const bodyH = Math.max(1.5, bodyBottom - bodyTop);
            const isPicked = ex.kind === "pick" && picked === i;
            const isTarget = ex.kind === "pick" && ex.targetIndex === i;
            return (
              <g key={i}>
                {/* halo bougie sélectionnée / cible */}
                {ex.kind === "pick" && (isPicked || (validated && isTarget)) && (
                  <rect
                    x={cx - slot / 2}
                    y={PAD.t}
                    width={slot}
                    height={INNER_H}
                    rx="3"
                    fill={
                      validated && isTarget
                        ? "rgba(34,197,94,0.16)"
                        : "rgba(217,33,40,0.16)"
                    }
                    stroke={
                      validated && isTarget ? "#22c55e" : "#d92128"
                    }
                    strokeWidth="1"
                  />
                )}
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
                {/* zone cliquable (mode pick) */}
                {ex.kind === "pick" && !validated && (
                  <rect
                    x={cx - slot / 2}
                    y={PAD.t}
                    width={slot}
                    height={INNER_H}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setPicked(i)}
                  />
                )}
              </g>
            );
          })}

          {/* X axis baseline */}
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={H - PAD.b}
            y2={H - PAD.b}
            stroke="#1f2a3d"
          />

          {/* ---- MODE LINE : ligne placée par l'apprenant ---- */}
          {ex.kind === "line" && placed != null && (
            <g>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={yFor(placed)}
                y2={yFor(placed)}
                stroke={validated ? (isLineGood ? "#22c55e" : "#f59e0b") : "#facc15"}
                strokeWidth="2"
                strokeDasharray={validated ? "0" : "6 4"}
              />
              {/* poignée */}
              <circle
                cx={W - PAD.r - 10}
                cy={yFor(placed)}
                r="6"
                fill={validated ? (isLineGood ? "#22c55e" : "#f59e0b") : "#facc15"}
              />
              <rect
                x={PAD.l + 2}
                y={yFor(placed) - 16}
                width="52"
                height="14"
                rx="3"
                fill={validated ? (isLineGood ? "#22c55e" : "#f59e0b") : "#facc15"}
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

          {/* ---- MODE LINE : bonne réponse révélée après validation ---- */}
          {ex.kind === "line" && validated && (
            <g>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={yFor(ex.target)}
                y2={yFor(ex.target)}
                stroke={lineColor}
                strokeOpacity="0.9"
                strokeDasharray="6 5"
                strokeWidth="1.6"
              />
              <text
                x={W - PAD.r - 4}
                y={yFor(ex.target) - 4}
                fontSize="9"
                fill={lineColor}
                textAnchor="end"
              >
                {ex.lineType === "support" ? "Support" : "Résistance"} {ex.target}
              </text>
            </g>
          )}

          {/* overlay de drag (mode line, avant validation) — au-dessus de tout */}
          {ex.kind === "line" && !validated && (
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
                setPlaced(round05(priceFromClientY(e.clientY)));
              }}
              onPointerMove={(e) => {
                if (!dragging) return;
                setPlaced(round05(priceFromClientY(e.clientY)));
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

        {/* boutons de réglage fin (mode line) */}
        {ex.kind === "line" && !validated && (
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
        {ex.kind === "pick" && !validated && (
          <div className="mt-2 text-center text-[11px] text-white/50">
            {picked == null
              ? "Clique sur la bougie de ton choix."
              : `Bougie n°${picked + 1} sélectionnée.`}
          </div>
        )}
      </div>

      {/* ---- FEEDBACK ---- */}
      {validated && (
        <div
          className={`fade-up mt-5 rounded-2xl border p-4 text-sm ${
            lastResult?.correct
              ? "border-green-500/40 bg-green-50 text-[var(--ink)]"
              : "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--ink)]"
          }`}
        >
          <div
            className={`text-[10px] font-semibold uppercase tracking-widest ${
              lastResult?.correct ? "text-green-600" : "text-[var(--accent)]"
            }`}
          >
            {lastResult?.correct ? "Bien joué" : "À revoir"}
            {ex.kind === "line" &&
              !lastResult?.correct &&
              placed != null &&
              ` · écart de ${Math.abs(round05(placed - ex.target))} pt`}
          </div>
          <p className="mt-1 leading-relaxed">{ex.explanation}</p>
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
            disabled={ex.kind === "pick" && picked == null}
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
            {step + 1 < total ? "Exercice suivant →" : "Voir le résultat"}
          </button>
        )}
      </div>
    </div>
  );
}

function GuideLine({
  y,
  color,
  label,
}: {
  y: number;
  color: string;
  label: string;
}) {
  return (
    <g>
      <line
        x1={PAD.l}
        x2={W - PAD.r}
        y1={y}
        y2={y}
        stroke={color}
        strokeOpacity="0.55"
        strokeDasharray="6 5"
        strokeWidth="1.2"
      />
      <text
        x={W - PAD.r - 4}
        y={y - 4}
        fontSize="9"
        fill={color}
        textAnchor="end"
      >
        {label}
      </text>
    </g>
  );
}
