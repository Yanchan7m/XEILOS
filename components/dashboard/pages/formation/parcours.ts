// Le parcours de formation : 5 blocs, 109 leçons au total (cf. FORMATION dans
// lib/dashboard-demo.ts). Les vidéos ne sont pas encore tournées : chaque leçon
// s'affiche avec un bouton désactivé « Vidéo bientôt ».

export type Exercice = {
  titre: string;
  description: string;
  /** Absent = l'exercice n'existe pas encore (bouton désactivé « Bientôt »). */
  href?: string;
  /** Vrai si le lien quitte le tableau de bord (page démo sur fond clair). */
  horsTableau?: boolean;
  /** Une courte vidéo facultative sur la notion (une seule notion), s'il y en a une. */
  video?: string;
};

export type Bloc = {
  num: number;
  titre: string;
  resume: string;
  /** Nombre total de leçons du bloc. */
  total: number;
  /** Leçons déjà vues dans la progression d'exemple. */
  vues: number;
  /** Les leçons listées. Pour le bloc en cours, ce sont celles qui restent. */
  lecons: string[];
  exercices: Exercice[];
};

export const EXOS = {
  absorption: {
    titre: "L'absorption",
    description: "Plein de vendeurs, et le prix tient ? 3 situations sur un carnet d'ordres animé.",
    href: "/dashboard/exercices/absorption",
    video: "/dashboard/exercices/absorption#video",
  },
  contexte: {
    titre: "Lecture de marché en 3 étapes",
    description: "Contexte, activité, carnet d'ordres, puis décision : trader ou ne pas trader. 3 situations sur le Nasdaq.",
    href: "/dashboard/contexte",
  },
  qcmTrading: {
    titre: "QCM trading",
    description: "Gestion du risque, structure de marché et scalping, avec graphiques en chandeliers.",
    href: "/demo#qcm",
    horsTableau: true,
  },
  parcours: {
    titre: "Parcours de 7 exercices",
    description: "Placer des supports et résistances, lire un graphique, interpréter un carnet d'ordres.",
    href: "/demo#exercices",
    horsTableau: true,
  },
  qcmScalping: {
    titre: "QCM scalping",
    description: "Des setups de scalping (liquidités, breakout, sessions) sur de vrais graphiques.",
    href: "/demo#scalping",
    horsTableau: true,
  },
  cartes: {
    titre: "Cartes flip",
    description: "Les mots de base du trading (stop loss, levier, drawdown…) à retourner pour les mémoriser.",
    href: "/demo#cartes",
    horsTableau: true,
  },
} satisfies Record<string, Exercice>;

export const BLOCS: Bloc[] = [
  {
    num: 1,
    titre: "Prop firms et gestion du risque",
    resume: "Comprendre comment fonctionne un challenge et protéger ton capital avant de chercher le moindre gain.",
    total: 22,
    vues: 18,
    lecons: [
      "Les règles des prop firms",
      "Perte journalière et drawdown maximal : bien les lire",
      "Construire ton plan de risque pour un challenge",
      "Récap du bloc et quiz",
    ],
    exercices: [EXOS.qcmTrading],
  },
  {
    num: 2,
    titre: "Structure de marché",
    resume: "Lire une tendance, repérer les zones qui comptent et savoir quand le marché ne dit rien.",
    total: 24,
    vues: 0,
    lecons: [
      "Plus hauts, plus bas : lire une tendance",
      "Supports et résistances : des zones, pas des lignes",
      "Range ou tendance ?",
      "Cassures et fausses cassures",
      "L'analyse multi-unités de temps",
      "Où placer ton stop selon la structure",
    ],
    exercices: [EXOS.parcours, EXOS.qcmTrading],
  },
  {
    num: 3,
    titre: "Carnet d'ordres et contexte",
    resume: "Avant le prix, le contexte : session, actualité, volume, puis ce que montre le carnet d'ordres.",
    total: 22,
    vues: 0,
    lecons: [
      "Bid, ask et spread",
      "Lire un carnet d'ordres (DOM)",
      "Les gros ordres : murs réels ou leurres ?",
      "Sessions de marché et annonces économiques",
      "Le contexte avant le signal",
      "Savoir ne pas trader",
    ],
    exercices: [EXOS.absorption, EXOS.contexte, EXOS.parcours],
  },
  {
    num: 4,
    titre: "Scalping",
    resume: "Des trades courts, très encadrés : frais, spread et discipline pèsent encore plus lourd.",
    total: 23,
    vues: 0,
    lecons: [
      "Qu'est-ce que le scalping (et pour qui) ?",
      "Ticks, frais et spread : le vrai coût d'un trade court",
      "Les heures d'ouverture et la volatilité",
      "Setups de liquidité",
      "Gérer une position en quelques minutes",
      "Quand arrêter ta session",
    ],
    exercices: [EXOS.qcmScalping],
  },
  {
    num: 5,
    titre: "Psychologie",
    resume: "Le plan, le journal et les émotions : ce qui fait tenir sur la durée.",
    total: 18,
    vues: 0,
    lecons: [
      "Peur, avidité et revanche après une perte",
      "Écrire et respecter ton plan de trading",
      "Tenir un journal de trading",
      "Accepter les séries de pertes",
      "Ta routine avant et après la séance",
    ],
    exercices: [],
  },
];
