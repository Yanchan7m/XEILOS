import { BriefingXeilosia } from "@/components/dashboard/variantes/Effets";
import { STATS, seuilRentabilite } from "@/lib/dashboard-demo";

// Le briefing de Xeilosia, écrit à partir des chiffres du compte (version 5).
export default function BriefingDuJour({ pnl }: { pnl: number }) {
  const seuil = seuilRentabilite(STATS);
  const ratio = STATS.avgWin / STATS.avgLoss;
  const f1 = (x: number) => x.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
  const f2 = (x: number) => x.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  const texte =
    `{salut}. Ton compte est à ${pnl >= 0 ? "+" : "−"}${Math.abs(pnl).toLocaleString("fr-FR")} $ depuis le départ, ta méthode tient. ` +
    `Un seul point avant la séance de New York : tu coupes tes gagnants trop tôt. Aujourd’hui, laisse courir un trade jusqu’à 1:${f1(STATS.avgRR)}.`;
  const constats = [
    { titre: "Méthode rentable", detail: `${f1(STATS.winRate)} % de réussite pour un seuil de rentabilité à ${f1(seuil)} %.`, ton: "vert" as const },
    { titre: "Gagnants coupés tôt", detail: `Gain moyen = ${f2(ratio)} × la perte moyenne, alors que ton plan vise 1:${f1(STATS.avgRR)}.`, ton: "orange" as const },
    { titre: "Risque maîtrisé", detail: `Drawdown max ${f1(STATS.maxDrawdown)} % : loin de la limite de 10 % d’un challenge.`, ton: "vert" as const },
  ];
  return <BriefingXeilosia texte={texte} constats={constats} />;
}
