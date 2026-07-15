export type QcmOption = {
  label: string;
  correct: boolean;
};

export type Candle = { o: number; h: number; l: number; c: number };

export type ChartSpec = {
  data: Candle[];
  support?: number;
  resistance?: number;
  caption?: string;
};

export type QcmQuestion = {
  id: string;
  module: string;
  question: string;
  multi: boolean;
  options: QcmOption[];
  explanation: string;
  chart?: ChartSpec;
};

const UPTREND_CANDLES: Candle[] = [
  { o: 95, h: 96, l: 94, c: 96 },
  { o: 96, h: 98, l: 95, c: 97 },
  { o: 97, h: 99, l: 96, c: 99 },
  { o: 99, h: 100, l: 98, c: 98 },
  { o: 98, h: 101, l: 97, c: 100 },
  { o: 100, h: 103, l: 99, c: 102 },
  { o: 102, h: 103, l: 100, c: 101 },
  { o: 101, h: 104, l: 100, c: 103 },
  { o: 103, h: 105, l: 102, c: 105 },
  { o: 105, h: 107, l: 104, c: 106 },
  { o: 106, h: 107, l: 104, c: 105 },
  { o: 105, h: 108, l: 104, c: 107 },
  { o: 107, h: 109, l: 106, c: 109 },
  { o: 109, h: 110, l: 107, c: 108 },
  { o: 108, h: 111, l: 107, c: 110 },
  { o: 110, h: 112, l: 109, c: 112 },
  { o: 112, h: 114, l: 111, c: 113 },
  { o: 113, h: 115, l: 112, c: 115 },
];

const BREAKOUT_CANDLES: Candle[] = [
  // Consolidation tight 100-104
  { o: 102, h: 104, l: 101, c: 103 },
  { o: 103, h: 104, l: 102, c: 102 },
  { o: 102, h: 103, l: 100, c: 101 },
  { o: 101, h: 103, l: 100, c: 103 },
  { o: 103, h: 104, l: 102, c: 102 },
  { o: 102, h: 104, l: 101, c: 103 },
  { o: 103, h: 104, l: 102, c: 104 },
  { o: 104, h: 104, l: 102, c: 103 },
  { o: 103, h: 104, l: 101, c: 102 },
  { o: 102, h: 104, l: 102, c: 104 },
  // Breakout above 104
  { o: 104, h: 107, l: 104, c: 107 },
  { o: 107, h: 109, l: 106, c: 108 },
  { o: 108, h: 111, l: 107, c: 110 },
  { o: 110, h: 112, l: 109, c: 111 },
  { o: 111, h: 113, l: 110, c: 113 },
  { o: 113, h: 114, l: 112, c: 113 },
  { o: 113, h: 115, l: 112, c: 114 },
  { o: 114, h: 116, l: 113, c: 115 },
];

/**
 * QCM de trading général (gestion du risque, analyse technique,
 * scalping/futures, psychologie). Quatre questions, dont deux sur
 * graphique en chandeliers.
 */
export const MASTER_QCM: QcmQuestion[] = [
  {
    id: "risk-sizing",
    module: "Gestion du risque",
    question:
      "Quelle règle de gestion du risque est la plus communément recommandée par trade ?",
    multi: false,
    options: [
      { label: "Risquer au maximum 1 à 2 % du capital par trade", correct: true },
      { label: "Risquer 50 % du capital pour maximiser les gains", correct: false },
      { label: "Ne jamais placer de stop loss", correct: false },
      { label: "Investir tout le capital sur le meilleur setup", correct: false },
    ],
    explanation:
      "La règle du 1-2 % protège le capital : même une série de pertes consécutives n'entame que faiblement le compte, ce qui laisse le temps aux setups gagnants de se matérialiser. Risquer une grosse part du capital ou trader sans stop est la première cause de ruine des comptes.",
  },
  {
    id: "ta-uptrend",
    module: "Analyse technique",
    question:
      "Quelle structure de marché reconnais-tu sur ce graphique ?",
    multi: false,
    options: [
      { label: "Range étroit", correct: false },
      { label: "Tendance baissière", correct: false },
      { label: "Distribution avant retournement", correct: false },
      { label: "Tendance haussière (higher highs + higher lows)", correct: true },
    ],
    explanation:
      "Chaque sommet est plus haut que le précédent, et chaque creux est plus haut que le précédent : c’est la définition d’une tendance haussière (higher highs + higher lows). Stratégie classique : chercher les pullbacks pour entrer dans le sens de la tendance.",
    chart: {
      data: UPTREND_CANDLES,
      caption: "Higher highs et higher lows : la tendance est ton amie.",
    },
  },
  {
    id: "scalp-breakout",
    module: "Scalping & futures",
    question:
      "Que vient-il de se passer sur ce graphique, et comment le scalper ?",
    multi: false,
    options: [
      { label: "Renversement baissier — il faut shorter", correct: false },
      { label: "Faux signal en range — rester à l'écart", correct: false },
      { label: "Continuation d'une tendance baissière", correct: false },
      {
        label:
          "Cassure de résistance après consolidation (breakout) — scalp achat sur le retest",
        correct: true,
      },
    ],
    explanation:
      "Les 10 premières bougies forment une consolidation serrée sous une résistance vers 104. La 11ᵉ bougie casse nettement ce niveau avec impulsion, suivie d'une continuation : c'est un breakout. En scalping sur futures (NAS100, ES…), on entre dans le sens de la cassure, idéalement sur le retest de l'ancienne résistance devenue support, stop sous le range.",
    chart: {
      data: BREAKOUT_CANDLES,
      resistance: 104,
      caption: "Cassure nette + continuation = breakout à scalper.",
    },
  },
  {
    id: "psycho-plan",
    module: "Psychologie de trading",
    question:
      "Après deux pertes consécutives, quelle est l'attitude d'un trader discipliné ?",
    multi: false,
    options: [
      {
        label:
          "S'en tenir à son plan et à sa gestion du risque, quitte à faire une pause",
        correct: true,
      },
      { label: "Doubler la taille de position pour se refaire (revenge trading)", correct: false },
      { label: "Retirer le stop loss pour laisser le trade « respirer »", correct: false },
      { label: "Tout miser sur le prochain signal", correct: false },
    ],
    explanation:
      "Le revenge trading, l'augmentation impulsive de la taille de position et le retrait du stop sont les premières causes de gros drawdowns. Un trader discipliné respecte son plan, garde un risque constant et sait s'arrêter quand l'émotion prend le dessus.",
  },
];
