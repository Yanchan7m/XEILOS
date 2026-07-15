"use client";

import { useRef, useState } from "react";
import { SCALPING_QCM, type ScalpingQuestion } from "@/lib/scalping-qcm";
import YanAnalysis from "@/components/YanAnalysis";

type State = {
  step: number;
  selected: number | null;
  validated: boolean;
  score: number;
  results: boolean[];
};

const initial: State = {
  step: 0,
  selected: null,
  validated: false,
  score: 0,
  results: [],
};

/**
 * On n'affiche que les 3 premiers setups, puis Yan analyse. Les 10 restent
 * dans les données (Scalping-Technique.md) pour extension ultérieure.
 */
const MAX_QUESTIONS = 3;
const QUESTIONS = SCALPING_QCM.slice(0, MAX_QUESTIONS);

/** Construit l'URL d'embed TradingView pour un symbole + timeframe. */
function tvUrl(symbol: string, interval: string, id: string) {
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
  return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
}

function TradingViewChart({
  symbol,
  interval,
  id,
}: {
  symbol: string;
  interval: string;
  id: string;
}) {
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
          src={tvUrl(symbol, interval, id)}
          title={`Graphique ${symbol}`}
          className="h-full w-full border-0"
          loading="lazy"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}

export default function ScalpingQCM() {
  const [state, setState] = useState<State>(initial);
  const cardRef = useRef<HTMLDivElement>(null);

  function scrollToTop() {
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const total = QUESTIONS.length;
  const finished = state.step >= total;
  const q: ScalpingQuestion | undefined = QUESTIONS[state.step];
  const progress = finished
    ? 100
    : Math.round(((state.step + (state.validated ? 1 : 0)) / total) * 100);

  function select(i: number) {
    if (state.validated) return;
    setState((s) => ({ ...s, selected: i }));
  }

  function validate() {
    if (!q || state.selected === null) return;
    const isCorrect = q.options[state.selected]?.correct === true;
    setState((s) => ({
      ...s,
      validated: true,
      score: s.score + (isCorrect ? 1 : 0),
      results: [...s.results, isCorrect],
    }));
  }

  function next() {
    setState((s) => ({
      ...s,
      step: s.step + 1,
      selected: null,
      validated: false,
    }));
    scrollToTop();
  }

  function reset() {
    setState(initial);
    scrollToTop();
  }

  if (finished) {
    const pct = Math.round((state.score / total) * 100);
    const anyWrong = state.results.some((r) => !r);
    const wrongModules = anyWrong ? ["Analyse technique · Trading"] : [];

    return (
      <div
        ref={cardRef}
        className="scroll-mt-24 rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm sm:p-10"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Résultat du QCM scalping
        </div>
        <h3 className="mt-2 text-3xl font-semibold text-[var(--ink)]">
          {state.score} / {total} bonnes réponses
        </h3>
        <p className="mt-1 text-base text-[var(--muted)]">
          Soit {pct} % sur les setups de scalping (liquidités, breakout,
          sessions).
        </p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {QUESTIONS.map((qq, i) => (
            <span
              key={qq.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                state.results[i]
                  ? "border-green-500/40 bg-green-50 text-green-700"
                  : "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent-strong)]"
              }`}
            >
              <span>{state.results[i] ? "✓" : "✕"}</span>
              Q{i + 1}
            </span>
          ))}
        </div>

        <YanAnalysis
          wrongModules={wrongModules}
          score={state.score}
          total={total}
        />

        <button
          onClick={reset}
          className="mt-6 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
        >
          Refaire le QCM scalping
        </button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div
      ref={cardRef}
      className="scroll-mt-24 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>
          Setup {state.step + 1} / {total}
        </span>
        <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-[10px] text-[var(--muted)]">
          Scalping · TF {q.interval}min
        </span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[#7a0e12] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3
        key={q.id}
        className="fade-up text-xl font-semibold leading-snug text-[var(--ink)] sm:text-2xl"
      >
        {q.question}
      </h3>

      {/* Graphique(s) TradingView */}
      <div className="fade-up mt-5 grid gap-3 lg:grid-cols-2">
        <div className={q.symbol2 ? "" : "lg:col-span-2"}>
          <TradingViewChart
            symbol={q.symbol}
            interval={q.interval}
            id={q.id}
          />
        </div>
        {q.symbol2 && (
          <TradingViewChart
            symbol={q.symbol2}
            interval={q.interval}
            id={`${q.id}-b`}
          />
        )}
      </div>

      <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs leading-relaxed text-[var(--muted-strong)]">
        <span className="font-semibold text-[var(--ink)]">Contexte : </span>
        {q.context}
      </p>

      <div className="mt-5 grid gap-2.5">
        {q.options.map((opt, i) => {
          const isSelected = state.selected === i;
          const isCorrect = opt.correct;
          let stateClass =
            "border-[var(--border)] bg-white hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/40";
          if (state.validated) {
            if (isCorrect) {
              stateClass = "border-green-500/50 bg-green-50 text-[var(--ink)]";
            } else if (isSelected) {
              stateClass =
                "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--ink)]";
            } else {
              stateClass = "border-[var(--border)] bg-white opacity-60";
            }
          } else if (isSelected) {
            stateClass = "border-[var(--accent)] bg-[var(--accent-soft)]/40";
          }
          return (
            <button
              key={opt.label}
              onClick={() => select(i)}
              disabled={state.validated}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${stateClass} disabled:cursor-default`}
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
              {state.validated && isCorrect && (
                <span className="text-xs font-semibold text-green-600">
                  Bonne réponse
                </span>
              )}
              {state.validated && isSelected && !isCorrect && (
                <span className="text-xs font-semibold text-[var(--accent)]">
                  À revoir
                </span>
              )}
            </button>
          );
        })}
      </div>

      {state.validated && (
        <div className="fade-up mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--ink)]">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            Explication
          </div>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed">
            {q.explanation}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="text-xs text-[var(--muted)]">
          Score en cours : <strong>{state.score}</strong> /{" "}
          {state.step + (state.validated ? 1 : 0)}
        </div>
        {!state.validated ? (
          <button
            onClick={validate}
            disabled={state.selected === null}
            className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-2"
          >
            Valider
          </button>
        ) : (
          <button
            onClick={next}
            className="w-full rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent)] sm:w-auto sm:py-2"
          >
            {state.step + 1 < total ? "Setup suivant →" : "Voir le résultat"}
          </button>
        )}
      </div>
    </div>
  );
}
