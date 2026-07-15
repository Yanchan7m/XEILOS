export type DomLevel = {
  price: number;
  /** Taille cumulée à l'achat (bid) sur ce niveau, en contrats. */
  bid: number;
  /** Taille cumulée à la vente (ask) sur ce niveau, en contrats. */
  ask: number;
};

/**
 * Exercice « mur » : cliquer sur le niveau de prix qui porte le gros
 * mur de liquidité (grosse taille bid ou ask).
 */
export type WallExercise = {
  kind: "wall";
  id: string;
  instrument: string;
  prompt: string;
  hint?: string;
  levels: DomLevel[];
  /** Colonne où se trouve le mur. */
  side: "bid" | "ask";
  /** Prix du niveau correct. */
  targetPrice: number;
  explanation: string;
};

/**
 * Exercice « biais » : d'après le déséquilibre du carnet, choisir le
 * sens le plus probable du prochain mouvement.
 */
export type BiasExercise = {
  kind: "bias";
  id: string;
  instrument: string;
  prompt: string;
  hint?: string;
  levels: DomLevel[];
  answer: "long" | "short";
  explanation: string;
};

export type OrderBookExo = WallExercise | BiasExercise;

/** Carnet avec un gros mur d'achat (support) sous le prix courant. */
const BID_WALL_BOOK: DomLevel[] = [
  { price: 18461, bid: 38, ask: 210 },
  { price: 18460, bid: 45, ask: 165 },
  { price: 18459, bid: 52, ask: 120 },
  { price: 18458, bid: 60, ask: 88 }, // ~ prix courant
  { price: 18457, bid: 74, ask: 55 },
  { price: 18456, bid: 96, ask: 34 },
  { price: 18455, bid: 840, ask: 22 }, // ← MUR bid (support)
  { price: 18454, bid: 130, ask: 15 },
  { price: 18453, bid: 88, ask: 11 },
  { price: 18452, bid: 61, ask: 9 },
];

/** Carnet avec un gros mur de vente (résistance) au-dessus du prix. */
const ASK_WALL_BOOK: DomLevel[] = [
  { price: 5308, bid: 12, ask: 95 },
  { price: 5307, bid: 18, ask: 140 },
  { price: 5306, bid: 26, ask: 910 }, // ← MUR ask (résistance)
  { price: 5305, bid: 44, ask: 120 },
  { price: 5304, bid: 70, ask: 80 }, // ~ prix courant
  { price: 5303, bid: 92, ask: 58 },
  { price: 5302, bid: 110, ask: 40 },
  { price: 5301, bid: 138, ask: 28 },
];

/** Carnet nettement déséquilibré côté acheteur (bids >> asks). */
const BULLISH_BOOK: DomLevel[] = [
  { price: 18475, bid: 30, ask: 40 },
  { price: 18474, bid: 42, ask: 35 },
  { price: 18473, bid: 55, ask: 28 }, // ~ prix courant
  { price: 18472, bid: 190, ask: 20 },
  { price: 18471, bid: 240, ask: 16 },
  { price: 18470, bid: 320, ask: 12 },
  { price: 18469, bid: 280, ask: 9 },
  { price: 18468, bid: 210, ask: 7 },
];

export const ORDERBOOK_EXOS: OrderBookExo[] = [
  {
    kind: "wall",
    id: "dom-bid-wall",
    instrument: "NAS100 Futures (NQ) · carnet d'ordre",
    prompt: "Clique sur le MUR d'achat (gros bid) qui sert de support.",
    hint: "Cherche la ligne avec une taille bid énorme par rapport aux autres.",
    levels: BID_WALL_BOOK,
    side: "bid",
    targetPrice: 18455,
    explanation:
      "Le niveau 18455 affiche 840 contrats à l'achat, très au-dessus du reste du carnet : c'est un mur de liquidité qui agit comme support. En scalping futures, tant que ce mur tient, on privilégie les achats sur repli avec un stop juste sous le mur.",
  },
  {
    kind: "wall",
    id: "dom-ask-wall",
    instrument: "SP500 Futures (ES) · carnet d'ordre",
    prompt: "Clique sur le MUR de vente (gros ask) qui plafonne le prix.",
    hint: "Le mur peut aussi être côté vente : repère la plus grosse taille ask.",
    levels: ASK_WALL_BOOK,
    side: "ask",
    targetPrice: 5306,
    explanation:
      "Le niveau 5306 concentre 910 contrats à la vente : un mur d'offres qui fait résistance. Un scalp short peut se jouer sur le rejet de ce mur (stop juste au-dessus). Attention : si le mur est absorbé/retiré, c'est souvent le signal d'une cassure haussière.",
  },
  {
    kind: "bias",
    id: "dom-bias",
    instrument: "NAS100 Futures (NQ) · carnet d'ordre",
    prompt:
      "D'après le déséquilibre du carnet, quel est le biais le plus probable ?",
    hint: "Compare le total des bids et des asks proches du prix courant.",
    levels: BULLISH_BOOK,
    answer: "long",
    explanation:
      "Les tailles à l'achat (bids) dominent largement les tailles à la vente (asks) sur les niveaux proches : les acheteurs absorbent l'offre. Le biais est haussier (long). En scalping, on cherche une entrée à l'achat sur micro-repli, pas un short à contre-flux.",
  },
];
