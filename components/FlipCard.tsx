"use client";

import { useState } from "react";

type Props = {
  question: string;
  answer: string;
  hint?: string;
};

export default function FlipCard({ question, answer, hint }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className="group relative h-40 w-full [perspective:1000px]"
      aria-label="Retourner la carte"
    >
      <div
        className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-4 text-left shadow-sm [backface-visibility:hidden] group-hover:border-[var(--accent)]/40">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
              Quiz flip · question
            </div>
            <div className="mt-2 text-sm font-medium leading-snug text-[var(--ink)]">
              {question}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>{hint ?? "Clique pour révéler"}</span>
            <span className="transition group-hover:translate-x-0.5">↻</span>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent-soft)] p-4 text-left shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
              Réponse
            </div>
            <div className="mt-2 text-sm leading-snug text-[var(--ink)]">{answer}</div>
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Bien retenu ? L’IA programme un rappel dans 3 jours.
          </div>
        </div>
      </div>
    </button>
  );
}
