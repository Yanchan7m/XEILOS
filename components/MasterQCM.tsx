"use client";

import { useState } from "react";
import { MASTER_QCM, type QcmQuestion } from "@/lib/master-qcm";
import CandlestickChart from "@/components/CandlestickChart";
import YanAnalysis from "@/components/YanAnalysis";

type State = {
  step: number;
  selected: number[];
  validated: boolean;
  score: number;
  wrongIds: string[];
};

const initial: State = {
  step: 0,
  selected: [],
  validated: false,
  score: 0,
  wrongIds: [],
};

export default function MasterQCM() {
  const [state, setState] = useState<State>(initial);

  const total = MASTER_QCM.length;
  const finished = state.step >= total;
  const q: QcmQuestion | undefined = MASTER_QCM[state.step];
  const progress = finished
    ? 100
    : Math.round(((state.step + (state.validated ? 1 : 0)) / total) * 100);

  function toggle(i: number) {
    if (state.validated || !q) return;
    if (q.multi) {
      setState((s) => ({
        ...s,
        selected: s.selected.includes(i)
          ? s.selected.filter((x) => x !== i)
          : [...s.selected, i],
      }));
    } else {
      setState((s) => ({ ...s, selected: [i] }));
    }
  }

  function validate() {
    if (!q || state.selected.length === 0) return;
    const correctIdx = q.options
      .map((o, i) => (o.correct ? i : -1))
      .filter((i) => i >= 0);
    const isCorrect =
      correctIdx.length === state.selected.length &&
      correctIdx.every((i) => state.selected.includes(i));
    setState((s) => ({
      ...s,
      validated: true,
      score: s.score + (isCorrect ? 1 : 0),
      wrongIds: isCorrect ? s.wrongIds : [...s.wrongIds, q.id],
    }));
  }

  function next() {
    setState((s) => ({
      step: s.step + 1,
      selected: [],
      validated: false,
      score: s.score,
      wrongIds: s.wrongIds,
    }));
  }

  function reset() {
    setState(initial);
  }

  if (finished) {
    const pct = Math.round((state.score / total) * 100);
    const wrongModules = Array.from(
      new Set(
        state.wrongIds
          .map((id) => MASTER_QCM.find((qq) => qq.id === id)?.module)
          .filter((m): m is string => Boolean(m)),
      ),
    );

    return (
      <div className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm sm:p-10">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Résultat du QCM
        </div>
        <h3 className="mt-2 text-3xl font-semibold text-[var(--ink)]">
          {state.score} / {total} bonnes réponses
        </h3>
        <p className="mt-1 text-base text-[var(--muted)]">
          Soit {pct} % sur ce mini-test des modules du Master.
        </p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
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
          Refaire le QCM
        </button>
      </div>
    );
  }

  if (!q) return null;

  const correctSet = new Set(
    q.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0),
  );

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>
          Question {state.step + 1} / {total}
        </span>
        <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-[10px] text-[var(--muted)]">
          {q.module}
        </span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[#7a0e12] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 key={q.id} className="fade-up text-xl font-semibold leading-snug text-[var(--ink)] sm:text-2xl">
        {q.question}
      </h3>
      {q.multi && (
        <p className="mt-1 text-xs italic text-[var(--muted)]">
          Plusieurs réponses possibles.
        </p>
      )}

      {q.chart && (
        <div className="fade-up mt-5">
          <CandlestickChart
            data={q.chart.data}
            support={q.chart.support}
            resistance={q.chart.resistance}
            caption={q.chart.caption}
          />
        </div>
      )}

      <div className="mt-6 grid gap-2.5">
        {q.options.map((opt, i) => {
          const isSelected = state.selected.includes(i);
          const isCorrect = correctSet.has(i);
          let stateClass =
            "border-[var(--border)] bg-white hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/40";
          if (state.validated) {
            if (isCorrect) {
              stateClass = "border-green-500/50 bg-green-50 text-[var(--ink)]";
            } else if (isSelected) {
              stateClass = "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--ink)]";
            } else {
              stateClass = "border-[var(--border)] bg-white opacity-60";
            }
          } else if (isSelected) {
            stateClass = "border-[var(--accent)] bg-[var(--accent-soft)]/40";
          }
          return (
            <button
              key={opt.label}
              onClick={() => toggle(i)}
              disabled={state.validated}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${stateClass} disabled:cursor-default`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-${q.multi ? "md" : "full"} border ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-white"
                } text-[10px]`}
              >
                {isSelected ? "✓" : ""}
              </span>
              <span className="flex-1">{opt.label}</span>
              {state.validated && isCorrect && (
                <span className="text-xs font-semibold text-green-600">Bonne réponse</span>
              )}
              {state.validated && isSelected && !isCorrect && (
                <span className="text-xs font-semibold text-[var(--accent)]">À revoir</span>
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
          <p className="mt-1 leading-relaxed">{q.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-[var(--muted)]">
          Score en cours : <strong>{state.score}</strong> / {state.step + (state.validated ? 1 : 0)}
        </div>
        {!state.validated ? (
          <button
            onClick={validate}
            disabled={state.selected.length === 0}
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Valider
          </button>
        ) : (
          <button
            onClick={next}
            className="rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent)]"
          >
            {state.step + 1 < total ? "Question suivante →" : "Voir le résultat"}
          </button>
        )}
      </div>
    </div>
  );
}
