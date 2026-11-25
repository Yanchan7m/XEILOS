// Le lexique du trader débutant, en phrases simples.
// Utilisé par l'onglet Lexique (/dashboard/lexique) et la page Formation.

export const CATEGORIES = [
  "Les bases",
  "Gestion du risque",
  "Ordres et exécution",
  "Lecture du marché",
  "Prop firms",
  "Psychologie",
] as const;

export type Categorie = (typeof CATEGORIES)[number];

export type Terme = {
  /** Identifiant stable (ancre, clé React). */
  id: string;
  terme: string;
  categorie: Categorie;
  /** Définition en une ou deux phrases simples, au tutoiement. */
  definition: string;
  /** Petit exemple concret (chiffres d'exemple, jamais une promesse). */
  exemple?: string;
  /** Ids d'autres termes à lire ensuite. */
  voirAussi?: string[];
};

export const LEXIQUE: Terme[] = [
  /* ---------------------------- Les bases ---------------------------- */
  {
    id: "long-short",
    terme: "Long / Short",
    categorie: "Les bases",
    definition: "Être long, c'est acheter en pariant que le prix va monter. Être short, c'est vendre en pariant qu'il va baisser. Sur les futures et les CFD, tu peux faire les deux aussi facilement.",
    exemple: "Short à 100, rachat à 97 : tu gagnes 3 points.",
  },
  {
    id: "pip",
    terme: "Pip",
    categorie: "Les bases",
    definition: "Le plus petit mouvement « habituel » d'une paire de devises, souvent le 4e chiffre après la virgule. Il sert à mesurer la distance d'un stop ou d'un objectif.",
    exemple: "EUR/USD passe de 1,0850 à 1,0860 : il a bougé de 10 pips.",
    voirAussi: ["tick", "lot"],
  },
  {
    id: "tick",
    terme: "Tick",
    categorie: "Les bases",
    definition: "Le plus petit écart de prix possible sur un contrat à terme (futures). Chaque tick a une valeur fixe en dollars.",
    exemple: "Sur le Nasdaq (NQ), un tick = 0,25 point = 5 $ par contrat. Sur le micro (MNQ), 0,50 $.",
    voirAussi: ["futures"],
  },
  {
    id: "lot",
    terme: "Lot",
    categorie: "Les bases",
    definition: "L'unité de taille d'une position. Plus tu prends de lots, plus chaque mouvement du prix pèse sur ton compte, dans un sens comme dans l'autre.",
    exemple: "Sur le forex, 1 lot standard = 100 000 unités de devise ; 0,01 lot = un micro-lot.",
    voirAussi: ["taille-position"],
  },
  {
    id: "futures",
    terme: "Futures (contrat à terme)",
    categorie: "Les bases",
    definition: "Un contrat qui suit le prix d'un actif (indice, pétrole, or...) et s'échange sur une bourse réglementée. Chaque contrat a une taille fixe et une date d'échéance.",
    exemple: "Le NQ suit le Nasdaq 100 ; le MNQ en est la version 10 fois plus petite.",
  },
  {
    id: "cfd",
    terme: "CFD",
    categorie: "Les bases",
    definition: "« Contract for Difference » : un produit qui te fait gagner ou perdre la variation d'un prix sans posséder l'actif. Il utilise presque toujours un effet de levier.",
    exemple: "Selon l'AMF, environ 9 particuliers sur 10 perdent de l'argent sur les CFD.",
    voirAussi: ["levier"],
  },
  {
    id: "pnl",
    terme: "P&L",
    categorie: "Les bases",
    definition: "« Profit and Loss » : le résultat de tes trades, positif ou négatif. Le P&L réalisé concerne les positions fermées, le latent celles encore ouvertes.",
  },
  {
    id: "compte-demo",
    terme: "Compte démo",
    categorie: "Les bases",
    definition: "Un compte avec de l'argent fictif, sur de vrais prix. C'est là qu'on teste une méthode avant de risquer un euro. Attention : sans enjeu, les émotions sont plus faibles qu'en réel.",
  },
  {
    id: "session",
    terme: "Session de marché",
    categorie: "Les bases",
    definition: "Les grandes plages horaires d'activité : Asie, Londres, New York. Le volume et les mouvements changent beaucoup d'une session à l'autre.",
    exemple: "L'ouverture de la bourse de New York, à 15h30 heure de Paris, est souvent le moment le plus agité de la journée.",
  },

  /* ------------------------ Gestion du risque ------------------------ */
  {
    id: "stop-loss",
    terme: "Stop loss",
    categorie: "Gestion du risque",
    definition: "Un ordre qui coupe ta position automatiquement si le prix va contre toi jusqu'à un niveau choisi à l'avance. C'est ta perte maximale prévue sur le trade. Tu le places avant d'entrer.",
    exemple: "Tu achètes à 100 avec un stop loss à 98 : si le prix touche 98, tu sors avec une perte limitée.",
    voirAussi: ["r", "slippage"],
  },
  {
    id: "take-profit",
    terme: "Take profit",
    categorie: "Gestion du risque",
    definition: "Un ordre qui ferme ta position automatiquement quand le prix atteint ton objectif. Il t'évite d'hésiter au moment de sortir.",
    exemple: "Achat à 100, take profit à 104 : la position se ferme seule à 104.",
  },
  {
    id: "r",
    terme: "R (risque)",
    categorie: "Gestion du risque",
    definition: "L'unité de risque d'un trade : 1 R, c'est la somme que tu acceptes de perdre si ton stop loss est touché. On mesure les résultats en R plutôt qu'en euros.",
    exemple: "Tu risques 50 $. Un gain de 100 $ vaut +2 R, une perte au stop vaut −1 R.",
    voirAussi: ["rr", "regle-1"],
  },
  {
    id: "rr",
    terme: "Ratio risque / rendement (R:R)",
    categorie: "Gestion du risque",
    definition: "Ce que tu peux gagner comparé à ce que tu risques. Un bon ratio ne suffit pas : il faut aussi que l'objectif soit réaliste.",
    exemple: "Stop à 20 points, objectif à 40 points : R:R de 1:2.",
    voirAussi: ["taux-reussite"],
  },
  {
    id: "regle-1",
    terme: "Règle du 1 %",
    categorie: "Gestion du risque",
    definition: "Ne jamais risquer plus de 1 % de ton compte sur un seul trade. Même dix pertes d'affilée ne te coûtent alors qu'environ 10 %.",
    exemple: "Compte de 10 000 $ : 100 $ maximum entre ton entrée et ton stop.",
    voirAussi: ["taille-position"],
  },
  {
    id: "taille-position",
    terme: "Taille de position",
    categorie: "Gestion du risque",
    definition: "Le nombre de lots ou de contrats que tu prends. On la calcule à partir du risque accepté et de la distance du stop, jamais au feeling.",
    exemple: "100 $ de risque, stop à 10 points sur MNQ (2 $ le point) : 100 ÷ (10 × 2) = 5 contrats.",
  },
  {
    id: "levier",
    terme: "Levier",
    categorie: "Gestion du risque",
    definition: "Il te permet de prendre une position plus grosse que ton capital. Il multiplie les gains ET les pertes : c'est la première cause de comptes vidés chez les débutants.",
    exemple: "Avec un levier de 100, un mouvement de 1 % contre toi efface 100 % de la mise.",
    voirAussi: ["marge", "cfd"],
  },
  {
    id: "marge",
    terme: "Marge",
    categorie: "Gestion du risque",
    definition: "L'argent bloqué par le courtier pour garder ta position ouverte. Si tes pertes la grignotent trop, le courtier peut fermer ta position de force (appel de marge).",
  },
  {
    id: "drawdown",
    terme: "Drawdown",
    categorie: "Gestion du risque",
    definition: "La baisse de ton capital depuis son plus haut. Il montre combien tu as « rendu » avant de remonter, et c'est souvent lui qui fait échouer un challenge.",
    exemple: "Ton compte monte à 10 500 $ puis redescend à 10 000 $ : drawdown de 500 $.",
    voirAussi: ["perte-journaliere"],
  },
  {
    id: "taux-reussite",
    terme: "Taux de réussite (win rate)",
    categorie: "Gestion du risque",
    definition: "Le pourcentage de trades gagnants. Seul, il ne veut rien dire : on peut gagner avec 40 % de réussite si les gains sont plus grands que les pertes, et perdre avec 80 %.",
    voirAussi: ["rr", "esperance"],
  },
  {
    id: "esperance",
    terme: "Espérance",
    categorie: "Gestion du risque",
    definition: "Ce que rapporte un trade en moyenne, sur un grand nombre de trades. Si elle est négative, aucune gestion du risque ne sauvera la méthode.",
    exemple: "50 % de réussite, gain moyen 2 R, perte moyenne 1 R : (0,5 × 2) − (0,5 × 1) = +0,5 R par trade.",
  },

  /* ----------------------- Ordres et exécution ----------------------- */
  {
    id: "ordre-marche",
    terme: "Ordre au marché",
    categorie: "Ordres et exécution",
    definition: "Un ordre exécuté tout de suite, au meilleur prix disponible. Rapide, mais le prix obtenu peut être un peu moins bon que celui affiché.",
    voirAussi: ["slippage"],
  },
  {
    id: "ordre-limite",
    terme: "Ordre limite",
    categorie: "Ordres et exécution",
    definition: "Un ordre qui ne s'exécute qu'à ton prix ou mieux. Tu contrôles le prix, mais il peut ne jamais être exécuté si le marché n'y va pas.",
    exemple: "Le prix est à 105, tu places un achat limite à 100 : tu n'achètes que si le prix redescend à 100.",
  },
  {
    id: "bid-ask",
    terme: "Bid / Ask",
    categorie: "Ordres et exécution",
    definition: "Le bid est le meilleur prix auquel quelqu'un veut acheter, l'ask le meilleur prix auquel quelqu'un veut vendre.",
    exemple: "Bid 1,0850 / Ask 1,0851 : spread de 1 pip.",
    voirAussi: ["spread"],
  },
  {
    id: "spread",
    terme: "Spread",
    categorie: "Ordres et exécution",
    definition: "L'écart entre le bid et l'ask. C'est un coût caché : chaque trade commence légèrement en perte. Il s'élargit souvent pendant les annonces et la nuit.",
  },
  {
    id: "slippage",
    terme: "Slippage",
    categorie: "Ordres et exécution",
    definition: "La différence entre le prix voulu et le prix obtenu. Il arrive surtout quand le marché va vite : ton stop peut alors être exécuté plus loin que prévu.",
    exemple: "Stop à 98, exécuté à 97,5 pendant une annonce : 0,5 point de slippage.",
  },
  {
    id: "frais",
    terme: "Commissions et frais",
    categorie: "Ordres et exécution",
    definition: "Ce que te prend le courtier à chaque trade. En scalping, où les gains visés sont petits, ils peuvent manger une grosse partie du résultat.",
  },
  {
    id: "carnet-ordres",
    terme: "Carnet d'ordres",
    categorie: "Ordres et exécution",
    definition: "La liste des ordres d'achat et de vente en attente, prix par prix. Il montre où se trouvent les acheteurs et les vendeurs juste au-dessus et en dessous du prix actuel. Un gros ordre peut être retiré à tout moment.",
    voirAussi: ["liquidite", "absorption"],
  },
  {
    id: "absorption",
    terme: "Absorption",
    categorie: "Ordres et exécution",
    definition: "Quand beaucoup d'ordres frappent un niveau de prix sans réussir à le faire bouger, parce qu'en face d'autres ordres les encaissent. Ce n'est pas le nombre de vendeurs qui compte, c'est leur capacité à faire reculer le prix.",
    exemple: "Des vendeurs frappent 21 450,50 trois fois, mais de nouveaux acheteurs reviennent à chaque fois et le prix ne recule pas : les ventes sont absorbées. Ce n'est pas un signal d'achat automatique, attends que le prix confirme.",
    voirAussi: ["carnet-ordres", "ordre-marche", "liquidite"],
  },
  {
    id: "liquidite",
    terme: "Liquidité",
    categorie: "Ordres et exécution",
    definition: "La facilité à acheter ou vendre sans faire bouger le prix. Un marché liquide a beaucoup d'ordres, un spread serré et peu de slippage.",
  },

  /* ------------------------ Lecture du marché ------------------------ */
  {
    id: "tendance",
    terme: "Tendance",
    categorie: "Lecture du marché",
    definition: "Une direction nette du prix. Haussière : des sommets et des creux de plus en plus hauts. Baissière : de plus en plus bas.",
    voirAussi: ["range"],
  },
  {
    id: "range",
    terme: "Range",
    categorie: "Lecture du marché",
    definition: "Une période où le prix fait des allers-retours entre un plafond et un plancher, sans vraie tendance. Dans un range calme, ne pas trader est souvent la bonne décision.",
    voirAussi: ["breakout"],
  },
  {
    id: "support-resistance",
    terme: "Support / Résistance",
    categorie: "Lecture du marché",
    definition: "Un support est une zone où le prix a déjà rebondi vers le haut ; une résistance, une zone où il a déjà été repoussé vers le bas. Ce sont des zones, pas des lignes exactes.",
    exemple: "Une résistance cassée devient souvent un support.",
  },
  {
    id: "breakout",
    terme: "Breakout",
    categorie: "Lecture du marché",
    definition: "La cassure d'un niveau important (le haut ou le bas d'un range, une résistance...). Une cassure peut échouer : on parle alors de fausse cassure.",
  },
  {
    id: "volume",
    terme: "Volume",
    categorie: "Lecture du marché",
    definition: "La quantité échangée sur une période. Un mouvement avec du volume est plus crédible qu'un mouvement sans personne derrière.",
  },
  {
    id: "volatilite",
    terme: "Volatilité",
    categorie: "Lecture du marché",
    definition: "L'ampleur des mouvements du prix. Plus elle est forte, plus ton stop doit être large, donc plus ta taille de position doit être petite.",
    voirAussi: ["taille-position"],
  },
  {
    id: "bougie",
    terme: "Bougie (chandelier)",
    categorie: "Lecture du marché",
    definition: "La représentation du prix sur une période : ouverture, plus haut, plus bas, clôture. Le corps montre l'écart ouverture-clôture, les mèches les extrêmes.",
  },
  {
    id: "unite-temps",
    terme: "Unité de temps",
    categorie: "Lecture du marché",
    definition: "La durée de chaque bougie (1 minute, 1 heure, 1 jour...). On regarde d'abord une grande unité pour le contexte, puis une petite pour entrer.",
  },
  {
    id: "annonce",
    terme: "Annonce économique",
    categorie: "Lecture du marché",
    definition: "Un chiffre publié à heure fixe (emploi, inflation, taux...) qui peut faire bouger le marché violemment en quelques secondes. Débutant : ne sois pas en position pendant.",
    voirAussi: ["slippage", "spread"],
  },
  {
    id: "scalping",
    terme: "Scalping",
    categorie: "Lecture du marché",
    definition: "Des trades de quelques secondes à quelques minutes qui visent de petits mouvements. Ça demande de la rigueur : les frais et le stress pèsent lourd.",
    voirAussi: ["frais"],
  },

  /* ---------------------------- Prop firms --------------------------- */
  {
    id: "prop-firm",
    terme: "Prop firm",
    categorie: "Prop firms",
    definition: "Une société qui te confie un compte de trading si tu réussis son évaluation, en échange d'un partage des gains. Tu paies en général des frais pour passer le test.",
    voirAussi: ["challenge"],
  },
  {
    id: "challenge",
    terme: "Challenge",
    categorie: "Prop firms",
    definition: "L'évaluation payante d'une prop firm : atteindre un objectif sans dépasser une perte par jour ni une perte totale maximale. Beaucoup de candidats échouent : traite-le comme un examen, pas comme un pari.",
    voirAussi: ["perte-journaliere", "drawdown"],
  },
  {
    id: "perte-journaliere",
    terme: "Perte journalière maximale",
    categorie: "Prop firms",
    definition: "La perte à ne jamais dépasser dans une journée, souvent autour de 5 % en challenge. La dépasser fait échouer immédiatement, même si le compte est en gain au total.",
    exemple: "Avec 2 % de risque par trade, trois pertes d'affilée suffisent presque à l'atteindre.",
  },
  {
    id: "trailing-drawdown",
    terme: "Drawdown suiveur (trailing)",
    categorie: "Prop firms",
    definition: "Une limite de perte qui monte avec ton plus haut. Chaque gain remonte le plancher : il faut lire les règles exactes de chaque prop firm.",
    exemple: "Plancher à 48 000 $ sur un compte de 50 000 $. Tu montes à 51 000 $ : le plancher passe à 49 000 $.",
  },
  {
    id: "partage-gains",
    terme: "Partage des gains",
    categorie: "Prop firms",
    definition: "La part des gains que la prop firm te reverse sur un compte financé (souvent 80 à 90 %). Elle ne s'applique qu'aux gains, et les retraits ont des conditions.",
  },

  /* ---------------------------- Psychologie -------------------------- */
  {
    id: "plan-trading",
    terme: "Plan de trading",
    categorie: "Psychologie",
    definition: "Tes règles écrites à l'avance : quoi trader, quand, comment entrer, où mettre le stop, combien risquer, quand t'arrêter. Il décide à ta place quand l'émotion monte.",
  },
  {
    id: "revenge-trading",
    terme: "Revenge trading",
    categorie: "Psychologie",
    definition: "Reprendre un trade vite, souvent plus gros, pour « se refaire » après une perte. C'est l'erreur la plus coûteuse chez les débutants.",
    exemple: "Règle simple : après 2 pertes d'affilée, tu arrêtes pour la journée.",
  },
  {
    id: "fomo",
    terme: "FOMO",
    categorie: "Psychologie",
    definition: "« Fear Of Missing Out » : la peur de rater un mouvement, qui pousse à entrer trop tard et sans plan. Un trade raté ne coûte rien ; un mauvais trade, si.",
  },
  {
    id: "overtrading",
    terme: "Overtrading",
    categorie: "Psychologie",
    definition: "Trader trop souvent, par ennui ou par envie d'agir. Chaque trade de trop ajoute des frais et des erreurs. Fixe-toi un nombre maximal de trades par jour.",
  },
  {
    id: "journal",
    terme: "Journal de trading",
    categorie: "Psychologie",
    definition: "Le carnet où tu notes chaque trade : pourquoi tu es entré, si tu as suivi ton plan, ce que tu ressentais. Au bout de 20 trades, tes erreurs répétées sautent aux yeux.",
  },
];

/** Retrouve un terme par son id. */
export const TERME = Object.fromEntries(LEXIQUE.map((t) => [t.id, t])) as Record<string, Terme>;
