export type Candle = { o: number; h: number; l: number; c: number };

/**
 * Exercice « ligne » : l'apprenant fait glisser une ligne horizontale
 * pour marquer un support ou une résistance sur le graphique.
 */
export type LineExercise = {
  kind: "line";
  id: string;
  module: string;
  prompt: string;
  data: Candle[];
  lineType: "support" | "resistance";
  /** Niveau de prix correct. */
  target: number;
  /** Marge d'erreur acceptée (en prix) autour de la cible. */
  tolerance: number;
  explanation: string;
  hint?: string;
};

/**
 * Exercice « bougie » : l'apprenant clique sur la bougie qui correspond
 * à un événement (cassure, retournement…).
 */
export type PickExercise = {
  kind: "pick";
  id: string;
  module: string;
  prompt: string;
  data: Candle[];
  /** Index de la bougie correcte. */
  targetIndex: number;
  /** Nombre de bougies d'écart tolérées de part et d'autre (défaut 0). */
  tolerance?: number;
  /** Lignes d'aide affichées en repère (support/résistance connus). */
  guide?: { support?: number; resistance?: number };
  explanation: string;
  hint?: string;
};

export type Exercise = LineExercise | PickExercise;

/** Range borné ~102–108 : les creux rebondissent régulièrement sur 102. */
const RANGE_CANDLES: Candle[] = [
  { o: 104, h: 107, l: 102.2, c: 106 },
  { o: 106, h: 108, l: 105, c: 104 },
  { o: 104, h: 106, l: 102, c: 105 },
  { o: 105, h: 107.5, l: 104, c: 107 },
  { o: 107, h: 108, l: 105.5, c: 106 },
  { o: 106, h: 107, l: 102.3, c: 103 },
  { o: 103, h: 105, l: 102, c: 104.5 },
  { o: 104.5, h: 107, l: 104, c: 106 },
  { o: 106, h: 108, l: 105, c: 105 },
  { o: 105, h: 106, l: 102.1, c: 103 },
  { o: 103, h: 105, l: 102, c: 105 },
  { o: 105, h: 107, l: 104, c: 106 },
  { o: 106, h: 108, l: 105, c: 107 },
  { o: 107, h: 107.8, l: 105, c: 106 },
  { o: 106, h: 107, l: 102.4, c: 103 },
  { o: 103, h: 105, l: 102, c: 104 },
  { o: 104, h: 106.5, l: 103, c: 106 },
  { o: 106, h: 108, l: 105, c: 107 },
];

/** Consolidation serrée sous une résistance nette à 104. */
const CEILING_CANDLES: Candle[] = [
  { o: 101, h: 103, l: 100, c: 102 },
  { o: 102, h: 104, l: 101, c: 103 },
  { o: 103, h: 104, l: 102, c: 102 },
  { o: 102, h: 103.8, l: 101, c: 103.5 },
  { o: 103.5, h: 104, l: 102.5, c: 103 },
  { o: 103, h: 103.5, l: 101.5, c: 102 },
  { o: 102, h: 104, l: 101, c: 103.5 },
  { o: 103.5, h: 104, l: 102.5, c: 103 },
  { o: 103, h: 103.8, l: 101.5, c: 102 },
  { o: 102, h: 104, l: 101, c: 103 },
  { o: 103, h: 103.9, l: 102, c: 103.5 },
  { o: 103.5, h: 104, l: 102.5, c: 103 },
];

/** Consolidation sous 104 (10 bougies) puis cassure franche à l'index 10. */
const BREAKOUT_CANDLES: Candle[] = [
  { o: 102, h: 104, l: 101, c: 103 },
  { o: 103, h: 104, l: 102, c: 102 },
  { o: 102, h: 103.5, l: 100.5, c: 101 },
  { o: 101, h: 103.5, l: 100.5, c: 103.5 },
  { o: 103.5, h: 104, l: 102.5, c: 103 },
  { o: 103, h: 104, l: 101.5, c: 103.5 },
  { o: 103.5, h: 104, l: 102.5, c: 104 },
  { o: 104, h: 104, l: 102.5, c: 103 },
  { o: 103, h: 104, l: 101.5, c: 102 },
  { o: 102, h: 104, l: 102, c: 104 },
  { o: 104, h: 107.5, l: 104, c: 107 }, // ← index 10 : cassure nette
  { o: 107, h: 109, l: 106, c: 108 },
  { o: 108, h: 111, l: 107, c: 110 },
  { o: 110, h: 112, l: 109, c: 111 },
  { o: 111, h: 113, l: 110, c: 113 },
  { o: 113, h: 114, l: 112, c: 113 },
];

/** Creux en « V » : baisse puis reprise, plus bas absolu à l'index 6. */
const REVERSAL_CANDLES: Candle[] = [
  { o: 114, h: 115, l: 112, c: 112 },
  { o: 112, h: 113, l: 110, c: 110 },
  { o: 110, h: 111, l: 108, c: 108 },
  { o: 108, h: 109, l: 106, c: 106 },
  { o: 106, h: 107, l: 104, c: 104 },
  { o: 104, h: 105, l: 101, c: 102 },
  { o: 102, h: 103, l: 100, c: 101 }, // ← index 6 : plus bas absolu (100)
  { o: 101, h: 104, l: 100.5, c: 103 },
  { o: 103, h: 106, l: 102, c: 105 },
  { o: 105, h: 108, l: 104, c: 107 },
  { o: 107, h: 110, l: 106, c: 109 },
  { o: 109, h: 112, l: 108, c: 111 },
];

/**
 * EUR/USD 5 min — scénario CRT (Candle Range Theory) sur session Londres.
 * Le prix consolide dans un range 1.0800 (liquidité basse) / 1.0812 (haut de
 * range). À l'index 7, une bougie balaie la liquidité sous 1.0800 (mèche à
 * 1.0793) puis referme en vert dans le range : c'est le sweep + retournement
 * (la bougie CRT). À l'index 9, une grande bougie clôture au-dessus du haut
 * de range : c'est la cassure qui lance l'expansion haussière.
 */
const EURUSD_CRT_CANDLES: Candle[] = [
  { o: 1.0806, h: 1.0812, l: 1.0802, c: 1.0808 },
  { o: 1.0808, h: 1.0811, l: 1.0801, c: 1.0803 },
  { o: 1.0803, h: 1.081, l: 1.08, c: 1.0807 },
  { o: 1.0807, h: 1.0812, l: 1.0803, c: 1.0804 },
  { o: 1.0804, h: 1.0809, l: 1.0801, c: 1.0808 },
  { o: 1.0808, h: 1.0812, l: 1.0802, c: 1.0805 },
  { o: 1.0805, h: 1.081, l: 1.0801, c: 1.0803 },
  { o: 1.0803, h: 1.0808, l: 1.0793, c: 1.0807 }, // ← index 7 : sweep sous 1.0800 + retournement (CRT)
  { o: 1.0807, h: 1.0812, l: 1.0805, c: 1.0811 },
  { o: 1.0811, h: 1.0823, l: 1.081, c: 1.0821 }, // ← index 9 : cassure du haut de range
  { o: 1.0821, h: 1.0829, l: 1.0819, c: 1.0827 },
  { o: 1.0827, h: 1.0833, l: 1.0824, c: 1.0831 },
];

const MODULE = "Analyse technique · Trading";

export const EXERCISES: Exercise[] = [
  {
    kind: "line",
    id: "ex-support",
    module: MODULE,
    prompt: "Fais glisser la ligne pour marquer le SUPPORT de ce range.",
    hint: "Le support est le niveau bas où le prix rebondit à répétition.",
    data: RANGE_CANDLES,
    lineType: "support",
    target: 102,
    tolerance: 1.2,
    explanation:
      "Le prix rebondit à plusieurs reprises autour de 102 sans jamais casser en dessous : c'est le support du range. Tant que ce niveau tient, un achat sur rebond (avec stop juste en dessous) offre un ratio risque/rendement favorable.",
  },
  {
    kind: "line",
    id: "ex-resistance",
    module: MODULE,
    prompt: "Place la ligne sur la RÉSISTANCE qui plafonne le prix.",
    hint: "La résistance est le niveau haut qui bloque les hausses successives.",
    data: CEILING_CANDLES,
    lineType: "resistance",
    target: 104,
    tolerance: 1.2,
    explanation:
      "Les mèches hautes butent toutes sur 104 : les vendeurs reprennent la main à ce niveau. C'est une résistance. Une cassure nette au-dessus (avec volume) ouvrirait un signal d'achat ; tant qu'elle tient, le biais reste vendeur dans le range.",
  },
  {
    kind: "pick",
    id: "ex-breakout",
    module: MODULE,
    prompt: "Clique sur la bougie qui CASSE la résistance (breakout).",
    hint: "Cherche la première bougie qui clôture franchement au-dessus de la ligne rouge.",
    data: BREAKOUT_CANDLES,
    targetIndex: 10,
    tolerance: 0,
    guide: { resistance: 104 },
    explanation:
      "Les 10 premières bougies butent sous 104. La 11ᵉ (celle-ci) clôture franchement au-dessus avec une grande bougie verte : c'est le breakout. L'ancienne résistance devient souvent un nouveau support lors du retest qui suit.",
  },
  {
    kind: "pick",
    id: "ex-reversal",
    module: MODULE,
    prompt: "Clique sur la bougie du POINT DE RETOURNEMENT (le plus bas).",
    hint: "Repère le creux le plus bas, juste avant que la tendance ne reparte à la hausse.",
    data: REVERSAL_CANDLES,
    targetIndex: 6,
    tolerance: 1,
    explanation:
      "Le plus bas absolu (~100) marque la fin de la tendance baissière. Juste après, les creux et sommets repartent à la hausse : c'est le retournement. Attendre la confirmation (un higher low après le point bas) évite de « rattraper le couteau qui tombe ».",
  },
  {
    kind: "pick",
    id: "ex-eurusd-reversal",
    module: MODULE,
    prompt:
      "EUR/USD balaie la liquidité sous 1.0800. Entoure la bougie de RETOURNEMENT (le sweep qui referme le CRT haussier).",
    hint: "Cherche la bougie dont la mèche perce sous 1.0800 mais qui clôture en vert de retour dans le range.",
    data: EURUSD_CRT_CANDLES,
    targetIndex: 7,
    tolerance: 0,
    guide: { support: 1.08 },
    explanation:
      "La bougie 8 (index 7) plonge sa mèche jusqu'à 1.0793 pour prendre la liquidité sous 1.0800, puis referme en vert dans le range : c'est le sweep + retournement, la bougie CRT. On surveille alors une cassure haussière pour entrer, avec un SL sous la mèche du sweep (1.0793).",
  },
  {
    kind: "pick",
    id: "ex-eurusd-break",
    module: MODULE,
    prompt:
      "Après le retournement, entoure la bougie qui CASSE le range (clôture au-dessus du haut de range).",
    hint: "Repère la première grande bougie verte qui clôture franchement au-dessus de la ligne rouge (1.0812).",
    data: EURUSD_CRT_CANDLES,
    targetIndex: 9,
    tolerance: 0,
    guide: { support: 1.08, resistance: 1.0812 },
    explanation:
      "La bougie 10 (index 9) clôture à 1.0821, franchement au-dessus du haut de range (1.0812) : c'est la cassure qui valide le CRT. L'entrée scalp se fait sur cette clôture au-dessus de 1.0805/1.0812, SL sous la mèche du sweep, pour viser l'expansion haussière qui suit.",
  },
];
