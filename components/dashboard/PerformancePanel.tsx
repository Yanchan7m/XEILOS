"use client";

import { useState } from "react";
import EquityChart, { type EquityPoint } from "./EquityChart";

export type TradeStats = {
  trades: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  bestDay: number;
  avgRR: number;
};

const money = (n: number) =>
  `${n >= 0 ? "" : "−"}${Math.abs(n).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} $`;

export default function PerformancePanel({
  points,
  startCapital,
  stats,
}: {
  points: EquityPoint[];
  startCapital: number;
  stats: TradeStats;
}) {
  const [tab, setTab] = useState<"evolution" | "stats">("evolution");

  const tiles = [
    { label: "Trades", value: String(stats.trades) },
    { label: "Taux de réussite", value: `${stats.winRate.toLocaleString("fr-FR")} %` },
    { label: "Profit factor", value: stats.profitFactor.toLocaleString("fr-FR") },
    { label: "R:R moyen", value: `1:${stats.avgRR.toLocaleString("fr-FR")}` },
    { label: "Gain moyen", value: money(stats.avgWin), tone: "text-emerald-400" },
    { label: "Perte moyenne", value: money(-stats.avgLoss), tone: "text-[var(--accent)]" },
    { label: "Drawdown max", value: `${stats.maxDrawdown.toLocaleString("fr-FR")} %` },
    { label: "Meilleure journée", value: money(stats.bestDay), tone: "text-emerald-400" },
  ];

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Performance</h2>
        <div className="flex gap-2">
          {(
            [
              ["evolution", "Évolution"],
              ["stats", "Statistiques"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full border px-4 py-2 text-[13px] transition ${
                tab === key
                  ? "border-white/25 bg-white/[0.08] text-white"
                  : "border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 sm:mt-10">
        {tab === "evolution" ? (
          <EquityChart points={points} startCapital={startCapital} />
        ) : (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="bg-[#0f0f12] px-4 py-5 sm:px-5 sm:py-6">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 sm:text-[11px]">{t.label}</div>
                <div className={`mt-3 text-xl font-light sm:text-2xl tabular-nums ${t.tone ?? "text-white"}`}>{t.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
