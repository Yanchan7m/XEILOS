"use client";

import { useState } from "react";
import { Archetype, PROFILES, QUIZ, scoreAnswers } from "@/lib/quiz";

type Props = {
  onResult: (archetype: Archetype) => void;
};

export default function Quiz({ onResult }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Archetype[]>([]);
  const [result, setResult] = useState<Archetype | null>(null);

  const total = QUIZ.length;
  const progress = result ? 100 : Math.round((step / total) * 100);

  function pick(archetype: Archetype) {
    const next = [...answers, archetype];
    setAnswers(next);
    if (step + 1 >= total) {
      const r = scoreAnswers(next);
      setResult(r);
      onResult(r);
    } else {
      setStep(step + 1);
    }
  }

  function reset() {
    setStep(0);
    setAnswers([]);
    setResult(null);
  }

  if (result) {
    const profile = PROFILES[result];
    return (
      <div className="fade-up rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              Ton profil
            </div>
            <h3 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
              <span aria-hidden>{profile.emoji}</span> {profile.name}
            </h3>
            <p className="mt-1 text-lg text-[var(--accent)]">{profile.tagline}</p>
          </div>
          <button
            onClick={reset}
            className="shrink-0 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
          >
            Refaire
          </button>
        </div>

        <p className="mt-6 text-base leading-relaxed text-[var(--foreground)]/85">
          {profile.description}
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Tes forces
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              {profile.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              À surveiller
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              {profile.watchouts.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-5">
          <div className="text-xs uppercase tracking-widest text-[var(--accent)]">
            Formation Xeilos recommandée
          </div>
          <div className="mt-1 text-lg font-medium">{profile.recommendedFormation}</div>
          <div className="mt-3 text-sm text-[var(--muted)]">
            👉 Discute avec ton coach IA juste à côté pour creuser ton plan d’apprentissage.
          </div>
        </div>
      </div>
    );
  }

  const q = QUIZ[step];

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
      <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>
          Question {step + 1} / {total}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 key={q.id} className="fade-up text-2xl font-semibold leading-snug sm:text-3xl">
        {q.question}
      </h3>

      <div className="mt-8 grid gap-3">
        {q.options.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => pick(opt.archetype)}
            className="fade-up group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="text-base">{opt.label}</span>
            <span className="text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
