export type QcmOption = {
  label: string;
  correct: boolean;
};

export type QcmQuestion = {
  id: string;
  module: string;
  question: string;
  multi: boolean;
  options: QcmOption[];
  explanation: string;
};

/**
 * QCM extraits du contenu réel du Master Xeilos
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
