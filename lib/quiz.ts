export type Archetype = "scalper" | "swing" | "investor" | "crypto";

export type QuizQuestion = {
  id: string;
  question: string;
  options: { label: string; archetype: Archetype }[];
};

export const QUIZ: QuizQuestion[] = [
  {
    id: "time",
    question: "Combien de temps peux-tu consacrer au trading chaque jour ?",
    options: [
      { label: "Plusieurs heures, écrans ouverts en continu", archetype: "scalper" },
      { label: "1 à 2 heures, posément, le matin ou le soir", archetype: "swing" },
      { label: "Quelques minutes, je vérifie mes positions de temps en temps", archetype: "investor" },
      { label: "À toute heure, le marché ne dort jamais", archetype: "crypto" },
    ],
  },
  {
    id: "horizon",
    question: "Quel horizon te parle le plus pour une position ?",
    options: [
      { label: "Quelques secondes à quelques minutes", archetype: "scalper" },
      { label: "Quelques jours à quelques semaines", archetype: "swing" },
      { label: "Plusieurs mois, voire des années", archetype: "investor" },
      { label: "Ça dépend du narrative et du token", archetype: "crypto" },
    ],
  },
  {
    id: "loss",
    question: "Tu encaisses une perte sèche. Tu fais quoi ?",
    options: [
      { label: "Je reprends une position immédiatement pour me refaire", archetype: "scalper" },
      { label: "Je relis mon plan de trade et je passe à la suivante", archetype: "swing" },
      { label: "Je garde mon cap, c’est du bruit sur le long terme", archetype: "investor" },
      { label: "Je DCA, c’est l’opportunité d’en racheter moins cher", archetype: "crypto" },
    ],
  },
  {
    id: "asset",
    question: "Quel actif te branche le plus ?",
    options: [
      { label: "Indices et futures (CAC, Nasdaq, DAX)", archetype: "scalper" },
      { label: "Forex et matières premières", archetype: "swing" },
      { label: "Actions, ETF, dividendes", archetype: "investor" },
      { label: "Bitcoin, Ethereum, altcoins, DeFi", archetype: "crypto" },
    ],
  },
  {
    id: "motivation",
    question: "Ton moteur principal, c’est :",
    options: [
      { label: "L’adrénaline, prendre des décisions rapides", archetype: "scalper" },
      { label: "Construire une méthode robuste, répétable", archetype: "swing" },
      { label: "Faire fructifier un capital sereinement", archetype: "investor" },
      { label: "Surfer sur l’innovation et les nouveaux marchés", archetype: "crypto" },
    ],
  },
  {
    id: "risk",
    question: "Ta tolérance au risque, en une phrase ?",
    options: [
      { label: "Élevée — sans risque, pas de rendement", archetype: "scalper" },
      { label: "Modérée — je veux du R/R favorable", archetype: "swing" },
      { label: "Faible — je préfère la régularité", archetype: "investor" },
      { label: "Très élevée — je vise des x10, j’assume les drawdowns", archetype: "crypto" },
    ],
  },
];

export type ArchetypeProfile = {
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  watchouts: string[];
  recommendedFormation: string;
  emoji: string;
  color: string;
};

export const PROFILES: Record<Archetype, ArchetypeProfile> = {
  scalper: {
    name: "Le Scalpeur",
    tagline: "Vitesse, précision, exécution.",
    description:
      "Tu es taillé pour le très court terme : indices, futures, lecture du carnet d’ordres. Tu prends des décisions à la milliseconde et tu sais sortir vite.",
    strengths: ["Sang-froid sous pression", "Exécution rapide", "Discipline du stop"],
    watchouts: ["Sur-trading", "Coûts de transaction", "Fatigue mentale"],
    recommendedFormation: "MBA Trading – parcours Day Trading & Scalping",
    emoji: "⚡",
    color: "#4cc9f0",
  },
  swing: {
    name: "Le Swing Trader",
    tagline: "Méthode, patience, R/R.",
    description:
      "Tu cherches les bons setups sur quelques jours à quelques semaines. Analyse technique, gestion du risque, et un plan de trade clair avant chaque entrée.",
    strengths: ["Discipline", "Lecture multi-timeframes", "Gestion du risque"],
    watchouts: ["Hésitation à l’entrée", "Sur-analyse", "Patience face aux gaps"],
    recommendedFormation: "Master Trading – Swing & Position Trading",
    emoji: "📈",
    color: "#f5c45a",
  },
  investor: {
    name: "L’Investisseur Long Terme",
    tagline: "Vision, fondamentaux, composé.",
    description:
      "Tu raisonnes en mois et en années. Tu privilégies les fondamentaux solides, les dividendes, la diversification et tu laisses le temps faire son œuvre.",
    strengths: ["Patience", "Analyse fondamentale", "Stratégie de portefeuille"],
    watchouts: ["Réagir aux news court terme", "Concentration sectorielle", "Inertie"],
    recommendedFormation: "Programme Investissement & Marchés Financiers",
    emoji: "🏛️",
    color: "#8be78b",
  },
  crypto: {
    name: "Le Crypto-Native",
    tagline: "24/7, on-chain, conviction.",
    description:
      "Tu vis dans le rythme des marchés crypto, tu suis les narratives, le on-chain et la DeFi. Volatilité élevée, opportunités fréquentes — il te faut un cadre.",
    strengths: ["Adaptabilité", "Veille permanente", "Tolérance à la volatilité"],
    watchouts: ["FOMO", "Sécurité des wallets", "Cycles émotionnels"],
    recommendedFormation: "Formation Cryptomonnaies, Blockchain & DeFi",
    emoji: "🪙",
    color: "#c084fc",
  },
};

export function scoreAnswers(answers: Archetype[]): Archetype {
  const counts: Record<Archetype, number> = { scalper: 0, swing: 0, investor: 0, crypto: 0 };
  for (const a of answers) counts[a]++;
  let best: Archetype = "swing";
  let bestScore = -1;
  (Object.keys(counts) as Archetype[]).forEach((k) => {
    if (counts[k] > bestScore) {
      best = k;
      bestScore = counts[k];
    }
  });
  return best;
}
