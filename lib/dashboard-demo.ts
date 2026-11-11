import type { EquityPoint } from "@/components/dashboard/EquityChart";
import type { TradeStats } from "@/components/dashboard/PerformancePanel";

// Les données de démo du tableau de bord élève, partagées par /dashboard et
// ses 6 versions (/dashboard/versions/1 à 6) : toutes montrent le même élève.

export const START_CAPITAL = 10_000;

/** Courbe de capital de démo : 120 jours déterministes (même rendu à chaque build). */
export function demoEquity(): EquityPoint[] {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const end = new Date("2026-10-20T00:00:00Z").getTime();
  let balance = START_CAPITAL;
  return Array.from({ length: 120 }, (_, i) => {
    if (i > 0) balance += (rand() - 0.44) * 140;
    return {
      date: new Date(end - (119 - i) * 86_400_000).toISOString(),
      balance: Math.round(balance),
    };
  });
}

export const STATS: TradeStats = {
  trades: 64,
  winRate: 56.3,
  profitFactor: 1.62,
  avgWin: 118,
  avgLoss: 92,
  maxDrawdown: 3.4,
  bestDay: 412,
  avgRR: 1.8,
};

export const COACH = { rating: 4.2, notedTrades: 12 };
export const FORMATION = { watched: 18, total: 109, nextBlock: "Bloc 1", nextVideo: "Les règles des prop firms" };

/** Le challenge prop firm de démo (version 3). */
export const CHALLENGE = {
  nom: "Challenge 10 000 $ · Phase 1",
  objectifPct: 12,
  perteJourMaxPct: 5,
  drawdownMaxPct: 10,
  joursMin: 10,
  joursTrades: 8,
  perteDuJour: 64,
};

export type Resume = {
  points: EquityPoint[];
  balance: number;
  pnl: number;
  pnlPct: number;
  formationPct: number;
};

export function resume(): Resume {
  const points = demoEquity();
  const balance = points[points.length - 1].balance;
  const pnl = balance - START_CAPITAL;
  return {
    points,
    balance,
    pnl,
    pnlPct: (pnl / START_CAPITAL) * 100,
    formationPct: Math.round((FORMATION.watched / FORMATION.total) * 100),
  };
}

/** Le P&L de chaque jour (différence avec la veille), pour le calendrier. */
export function pnlParJour(points: EquityPoint[]): { date: string; pnl: number }[] {
  return points.slice(1).map((p, i) => ({ date: p.date, pnl: p.balance - points[i].balance }));
}

/** La plus longue série de jours gagnants de la période. */
export function serieGagnante(jours: { pnl: number }[]): number {
  let meilleure = 0, n = 0;
  for (const j of jours) {
    n = j.pnl > 0 ? n + 1 : 0;
    meilleure = Math.max(meilleure, n);
  }
  return meilleure;
}

/** Le taux de réussite minimum pour être rentable avec ces gains et pertes moyens. */
export function seuilRentabilite(s: TradeStats): number {
  return (s.avgLoss / (s.avgWin + s.avgLoss)) * 100;
}
