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

const DOWNTREND_CANDLES: Candle[] = [
  { o: 115, h: 116, l: 113, c: 113 },
  { o: 113, h: 114, l: 111, c: 112 },
  { o: 112, h: 113, l: 110, c: 110 },
  { o: 110, h: 112, l: 109, c: 111 },
  { o: 111, h: 111, l: 108, c: 108 },
  { o: 108, h: 109, l: 106, c: 107 },
  { o: 107, h: 108, l: 105, c: 105 },
  { o: 105, h: 106, l: 103, c: 104 },
  { o: 104, h: 105, l: 102, c: 102 },
  { o: 102, h: 104, l: 101, c: 103 },
  { o: 103, h: 103, l: 100, c: 100 },
  { o: 100, h: 101, l: 98, c: 98 },
  { o: 98, h: 99, l: 96, c: 96 },
  { o: 96, h: 97, l: 94, c: 95 },
  { o: 95, h: 96, l: 93, c: 93 },
  { o: 93, h: 94, l: 91, c: 91 },
  { o: 91, h: 92, l: 89, c: 90 },
  { o: 90, h: 91, l: 87, c: 87 },
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

const CONSOLIDATION_CANDLES: Candle[] = [
  { o: 105, h: 107, l: 103, c: 106 },
  { o: 106, h: 108, l: 105, c: 104 },
  { o: 104, h: 106, l: 103, c: 105 },
  { o: 105, h: 107, l: 104, c: 107 },
  { o: 107, h: 108, l: 105, c: 106 },
  { o: 106, h: 106.5, l: 103, c: 104 },
  { o: 104, h: 106, l: 102.5, c: 105 },
  { o: 105, h: 107, l: 104, c: 106 },
  { o: 106, h: 108, l: 105, c: 105 },
  { o: 105, h: 105.5, l: 102.5, c: 103 },
  { o: 103, h: 105, l: 102, c: 105 },
  { o: 105, h: 107, l: 104, c: 106 },
  { o: 106, h: 108, l: 105, c: 107 },
  { o: 107, h: 108, l: 105, c: 106 },
  { o: 106, h: 107, l: 103, c: 104 },
  { o: 104, h: 105, l: 102, c: 103 },
  { o: 103, h: 105, l: 102, c: 105 },
  { o: 105, h: 107, l: 104, c: 106 },
  { o: 106, h: 107.5, l: 105, c: 107 },
  { o: 107, h: 108, l: 105, c: 106 },
];

/**
 * QCM extraits du contenu réel du Mastère
 * (modules : Stratégie d'entreprise, Diagnostic de performance,
 * Parties prenantes, Optimisation des processus, KPI).
 */
export const MASTER_QCM: QcmQuestion[] = [
  {
    id: "strat-swot",
    module: "Stratégie d'entreprise",
    question:
      "Quel outil est utilisé pour analyser les facteurs internes ET externes influençant la stratégie d'une entreprise ?",
    multi: false,
    options: [
      { label: "Analyse SWOT", correct: true },
      { label: "Modèle des 5 Forces de Porter", correct: false },
      { label: "Analyse PESTEL", correct: false },
      { label: "Méthode Lean", correct: false },
    ],
    explanation:
      "La SWOT est le seul outil couvrant à la fois les facteurs internes (Forces, Faiblesses) et externes (Opportunités, Menaces). PESTEL n'analyse que le macro-environnement externe, les 5 Forces de Porter étudient la concurrence sectorielle, et le Lean est une approche d'optimisation opérationnelle.",
  },
  {
    id: "strat-types",
    module: "Stratégie d'entreprise",
    question: "Quels sont les types de stratégies d'entreprise ? (plusieurs réponses)",
    multi: true,
    options: [
      { label: "Stratégie de croissance", correct: true },
      { label: "Stratégie de différenciation", correct: true },
      { label: "Stratégie de domination par les coûts", correct: true },
      { label: "Stratégie de focalisation (niche)", correct: true },
      { label: "Stratégie de dilution", correct: false },
    ],
    explanation:
      "Les quatre premières sont les stratégies génériques étudiées dans le module : croissance (interne ou externe), différenciation, domination par les coûts et focalisation sur une niche. La « dilution » n'est pas une stratégie d'entreprise reconnue.",
  },
  {
    id: "ta-consolidation",
    module: "Analyse technique · Trading",
    question:
      "Sur ce graphique en chandeliers japonais, dans quelle phase est le prix ?",
    multi: false,
    options: [
      { label: "Tendance haussière", correct: false },
      { label: "Renversement de tendance", correct: false },
      { label: "Phase de consolidation (range)", correct: true },
      { label: "Tendance baissière", correct: false },
    ],
    explanation:
      "Le prix oscille dans un range borné par un support (~102) et une résistance (~108) sans tendance directionnelle claire. C’est une phase de consolidation, typique d’une accumulation/distribution avant un breakout. Module : analyse technique du Mastère.",
    chart: {
      data: CONSOLIDATION_CANDLES,
      support: 102,
      resistance: 108,
      caption: "Identifie la structure avant de prendre position.",
    },
  },
  {
    id: "ta-uptrend",
    module: "Analyse technique · Trading",
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
      "Chaque sommet est plus haut que le précédent, et chaque creux est plus haut que le précédent : c’est la définition académique d’une tendance haussière (higher highs + higher lows). Stratégie classique : chercher les pullbacks pour entrer dans le sens de la tendance.",
    chart: {
      data: UPTREND_CANDLES,
      caption: "Higher highs et higher lows : la tendance est ton ami.",
    },
  },
  {
    id: "perf-dmaic",
    module: "Optimisation des processus",
    question:
      "Le modèle DMAIC (Define, Measure, Analyze, Improve, Control) appartient à quelle approche ?",
    multi: false,
    options: [
      { label: "Lean Management", correct: false },
      { label: "Six Sigma", correct: true },
      { label: "Balanced Scorecard", correct: false },
      { label: "Analyse PESTEL", correct: false },
    ],
    explanation:
      "DMAIC est la méthode structurante de Six Sigma pour réduire la variabilité et améliorer la qualité d'un processus. Le Lean utilise plutôt le PDCA et la Value Stream Mapping.",
  },
  {
    id: "ta-downtrend",
    module: "Analyse technique · Trading",
    question:
      "Comment qualifierais-tu la dynamique du prix sur ce graphique ?",
    multi: false,
    options: [
      { label: "Consolidation latérale", correct: false },
      { label: "Tendance baissière (lower highs + lower lows)", correct: true },
      { label: "Pullback temporaire dans une tendance haussière", correct: false },
      { label: "Tendance haussière", correct: false },
    ],
    explanation:
      "On voit clairement des sommets de plus en plus bas et des creux de plus en plus bas : c’est une tendance baissière. Approches possibles : vendre les rallies (short), ou rester à l’écart si tu ne shortes pas. Ne jamais « rattraper le couteau qui tombe ».",
    chart: {
      data: DOWNTREND_CANDLES,
      caption: "Lower highs et lower lows : tendance baissière confirmée.",
    },
  },
  {
    id: "stake-internes",
    module: "Parties prenantes",
    question: "Lesquels sont des parties prenantes INTERNES ? (plusieurs réponses)",
    multi: true,
    options: [
      { label: "Employé", correct: true },
      { label: "Manager", correct: true },
      { label: "Actionnaire", correct: true },
      { label: "Client", correct: false },
      { label: "Régulateur", correct: false },
    ],
    explanation:
      "Les parties prenantes internes regroupent ceux qui font partie de l'organisation : employés, managers, conseil d'administration, actionnaires. Les clients, fournisseurs, régulateurs et communautés locales sont des parties prenantes externes.",
  },
  {
    id: "ta-breakout",
    module: "Analyse technique · Trading",
    question:
      "Que vient-il de se passer sur ce graphique ?",
    multi: false,
    options: [
      { label: "Renversement baissier", correct: false },
      { label: "Faux signal en range étroit", correct: false },
      { label: "Continuation d'une tendance baissière", correct: false },
      { label: "Cassure de résistance après consolidation (breakout)", correct: true },
    ],
    explanation:
      "Les 10 premières bougies forment une consolidation serrée sous une résistance vers 104. La 11ᵉ bougie casse nettement cette résistance avec impulsion, suivie d'une continuation haussière : c'est un breakout classique. L'ancienne résistance devient souvent un nouveau support (retest).",
    chart: {
      data: BREAKOUT_CANDLES,
      resistance: 104,
      caption: "Cassure nette de la résistance + continuation = breakout valide.",
    },
  },
  {
    id: "kpi-bsc",
    module: "Diagnostic de performance",
    question:
      "Combien de perspectives évalue le Balanced Scorecard de Kaplan & Norton ?",
    multi: false,
    options: [
      { label: "2", correct: false },
      { label: "3", correct: false },
      { label: "4", correct: true },
      { label: "5", correct: false },
    ],
    explanation:
      "Le Balanced Scorecard évalue la performance selon 4 perspectives : Financière, Clients, Processus internes, et Apprentissage & croissance.",
  },
];
