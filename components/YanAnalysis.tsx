"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MODULE_HINTS: Record<string, string> = {
  "Stratégie d'entreprise":
    "revoir la SWOT (interne + externe), le PESTEL (macro externe) et les 5 Forces de Porter (concurrentiel)",
  "Optimisation des processus":
    "creuser la différence DMAIC (Six Sigma) vs PDCA (Lean) et revoir les 7 mudas",
  "Parties prenantes":
    "réviser la classification interne/externe et la matrice influence × intérêt",
  "Diagnostic de performance":
    "approfondir le Balanced Scorecard et ses 4 perspectives (Financière, Clients, Processus, Apprentissage)",
  "Analyse technique · Trading":
    "retravailler la lecture des structures de prix : range, tendance, breakout",
  "KPI & pilotage":
    "consolider les critères SMART et les types de KPI (financiers, opérationnels, processus, stratégiques)",
};

function buildAnalysisText(
  wrongModules: string[],
  score: number,
  total: number,
): string {
  if (score === total) {
    return "Excellent. Tu as tout validé du premier coup. Je programme quand même un rappel J+30 sur l'ensemble des notions pour garantir l'ancrage long terme. Ravi de bosser avec un profil sérieux comme le tien.";
  }

  if (wrongModules.length === 0) {
    return "Bon score global. Je vais quand même resservir les questions limites dans 3 jours pour consolider.";
  }

  const intro =
    score >= total / 2
      ? "OK, tu as la majorité des notions, mais j'ai repéré quelques zones à renforcer."
      : "On a du boulot. J'ai analysé tes réponses et je vois où ça coince.";

  const lines = wrongModules
    .map((m) => {
      const hint = MODULE_HINTS[m];
      return hint ? `• Module ${m} : ${hint}.` : `• Module ${m} : à retravailler.`;
    })
    .join("\n");

  const outro = `\n\nJe te programme un rappel à J+3 sur ces questions, puis J+7 et J+30 si validées. On peut aussi enchaîner direct sur un mini-QCM ciblé si tu veux : dis-moi.`;

  return `${intro}\n\n${lines}${outro}`;
}

type Props = {
  wrongModules: string[];
  score: number;
  total: number;
};

export default function YanAnalysis({ wrongModules, score, total }: Props) {
  const [phase, setPhase] = useState<"thinking" | "typing" | "done">("thinking");
  const [shown, setShown] = useState("");
  const fullText = buildAnalysisText(wrongModules, score, total);

  // Phase 1 → Phase 2 (after a "thinking" delay)
  useEffect(() => {
    const t = setTimeout(() => setPhase("typing"), 1900);
    return () => clearTimeout(t);
  }, []);

  // Typewriter on Phase 2
  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    let cancelled = false;
    function tick() {
      if (cancelled) return;
      i++;
      setShown(fullText.slice(0, i));
      if (i >= fullText.length) {
        setPhase("done");
        return;
      }
      const ch = fullText[i - 1];
      const delay = ch === "\n" ? 90 : ch === " " ? 8 : 14 + Math.random() * 14;
      setTimeout(tick, delay);
    }
    tick();
    return () => {
      cancelled = true;
    };
  }, [phase, fullText]);

  return (
    <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`h-10 w-10 overflow-hidden rounded-full ring-2 ring-[var(--accent)]/40 ${
              phase === "thinking" ? "agent-ring" : ""
            }`}
          >
            <Image
              src="/agent-face.png"
              alt="Yan, tuteur IA"
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)] bg-[var(--success)]" />
        </div>
        <div className="flex flex-col">
          <div className="text-sm font-semibold text-[var(--ink)]">Yan</div>
          <div className="text-[11px] text-[var(--muted)]">
            {phase === "thinking"
              ? "analyse tes réponses…"
              : phase === "typing"
                ? "rédige sa recommandation…"
                : "recommandation prête"}
          </div>
        </div>
      </div>

      <div className="mt-4 min-h-[120px] rounded-2xl border border-[var(--border)] bg-white p-4 text-sm leading-relaxed text-[var(--ink)]">
        {phase === "thinking" ? (
          <ThinkingDots />
        ) : (
          <pre className="whitespace-pre-wrap break-words font-sans">
            {shown}
            {phase === "typing" && <Caret />}
          </pre>
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-2 text-[var(--muted)]">
      <span className="text-xs italic">Yan réfléchit</span>
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)]" />
      </span>
    </div>
  );
}

function Caret() {
  return (
    <span className="ml-0.5 inline-block h-3.5 w-[2px] -translate-y-[1px] animate-pulse bg-[var(--accent)]" />
  );
}
