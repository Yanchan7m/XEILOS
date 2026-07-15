export type ScalpingOption = {
  label: string;
  correct: boolean;
};

/** Bougie avec volume, pour les graphiques statiques dessinés (pas de live). */
export type ScalpCandle = {
  o: number;
  h: number;
  l: number;
  c: number;
  /** Volume relatif de la bougie (échelle libre). */
  v: number;
};

/** Unités de temps proposées sur le graphique interactif. */
export type ScalpTimeframe = "M5" | "M15" | "H1";

/** Une vue (un timeframe) du même scénario. */
export type ScalpChartView = {
  tf: ScalpTimeframe;
  candles: ScalpCandle[];
  /** Borne basse du range (ligne repère). */
  rangeLow: number;
  /** Borne haute du range (ligne repère). */
  rangeHigh: number;
  /** Index de la bougie de gap à annoter (optionnel). */
  gapIndex?: number;
  /** Nombre de bougies visibles par défaut (fenêtre de panoramique). */
  window: number;
};

/**
 * Scénario dessiné à la place d'un graphique live TradingView : le chart
 * illustre exactement la situation décrite dans la question (gap, range,
 * volume…), ce qu'un flux temps réel ne peut pas garantir. Interactif :
 * on peut le faire glisser (pan) et basculer entre plusieurs timeframes.
 */
export type ScalpStaticChart = {
  /** Libellé de l'instrument affiché en tête (ex. "NAS100 · Session NY"). */
  label: string;
  /** Une entrée par timeframe (M5, M15, H1…). */
  views: ScalpChartView[];
};

/* ------------------------------------------------------------------ */
/*  Génération du scénario NAS100 (gap up → consolidation → cassure)   */
/*  On dessine une série M5 déterministe puis on l'agrège en M15 / H1  */
/*  pour garantir la cohérence entre les timeframes.                   */
/* ------------------------------------------------------------------ */

/** PRNG déterministe (pas de Math.random → même rendu SSR et client). */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function aggregateCandles(base: ScalpCandle[], n: number): ScalpCandle[] {
  const out: ScalpCandle[] = [];
  for (let i = 0; i < base.length; i += n) {
    const g = base.slice(i, i + n);
    out.push({
      o: g[0].o,
      c: g[g.length - 1].c,
      h: Math.max(...g.map((x) => x.h)),
      l: Math.min(...g.map((x) => x.l)),
      v: g.reduce((s, x) => s + x.v, 0),
    });
  }
  return out;
}

function buildNas100Views(): ScalpChartView[] {
  const rnd = lcg(20260715);
  const r1 = (v: number) => Math.round(v * 10) / 10;

  // Trajectoire M5 : 12 bougies de pré-marché, le gap (idx 12), une
  // consolidation à volume décroissant, la cassure (idx 36), puis la
  // continuation haussière. Le gap est calé sur idx 12 pour tomber sur
  // une frontière de bougie en M15 (×3) et H1 (×12).
  const closes = [
    18406, 18401, 18404, 18399, 18403, 18398, 18402, 18400, 18397, 18401,
    18399, 18402, // pré-marché (0–11)
    18476, // gap up (12)
    18470, 18463, 18468, 18472, 18466, 18461, 18467, 18463, 18469, 18465,
    18471, 18464, 18468, 18462, 18469, 18466, 18463, 18470, 18467, 18461,
    18468, 18465, 18472, // consolidation (13–35)
    18489, // cassure (36)
    18496, 18505, 18500, 18512, 18519, 18514, 18526, 18533, 18528, 18538,
    18545, 18540, 18549, 18543, 18551, 18547, 18556, 18550, 18559, 18554,
    18562, 18557, 18565, // continuation (37–59)
  ];
  const GAP = 12;
  const BREAK = 36;

  const wickFor = (i: number) =>
    i === GAP ? 7 : i === BREAK ? 9 : i < GAP ? 3.5 : i < BREAK ? 5 : 6;

  const volFor = (i: number) => {
    if (i < GAP) return 34 + rnd() * 12;
    if (i === GAP) return 96;
    if (i < BREAK) {
      const t = (i - GAP) / (BREAK - GAP);
      return 80 - t * 54 + rnd() * 4; // 80 → ~26 : volume décroissant
    }
    if (i === BREAK) return 92;
    const t = (i - BREAK) / (closes.length - BREAK);
    return 68 - t * 26 + rnd() * 6;
  };

  const m5: ScalpCandle[] = [];
  let prev = 18404;
  closes.forEach((c, i) => {
    const o = i === 0 ? 18404 : i === GAP ? 18456 : prev;
    const wick = wickFor(i);
    const h = Math.max(o, c) + rnd() * wick;
    const l = Math.min(o, c) - rnd() * wick;
    m5.push({ o: r1(o), h: r1(h), l: r1(l), c: r1(c), v: Math.round(volFor(i)) });
    prev = c;
  });

  const common = { rangeLow: 18450, rangeHigh: 18480 };
  return [
    { tf: "M5", candles: m5, gapIndex: 12, window: 24, ...common },
    { tf: "M15", candles: aggregateCandles(m5, 3), gapIndex: 4, window: 16, ...common },
    { tf: "H1", candles: aggregateCandles(m5, 12), gapIndex: 1, window: 5, ...common },
  ];
}

const NAS100_SCENARIO: ScalpStaticChart = {
  label: "NAS100 · Session New York",
  views: buildNas100Views(),
};

export type ScalpingQuestion = {
  id: string;
  question: string;
  /** Symbole TradingView, ex. "OANDA:XAUUSD". */
  symbol: string;
  /** Second graphique optionnel (ex. corrélation SP500 / NAS100). */
  symbol2?: string;
  /** Timeframe TradingView : "1", "5", "15"… */
  interval: string;
  /**
   * Si présent, on dessine ce scénario statique au lieu d'un graphique live.
   * Utile quand la question décrit une configuration précise (gap + range +
   * volume) qu'un flux temps réel n'afficherait pas.
   */
  staticChart?: ScalpStaticChart;
  context: string;
  options: ScalpingOption[];
  explanation: string;
};

/**
 * QCM de scalping (source : Scalping-Technique.md).
 * Analyse technique pure sur timeframes courts (1min–15min) :
 * liquidités, breakout, sessions, corrélations.
 */
export const SCALPING_QCM: ScalpingQuestion[] = [
  {
    id: "scalp-gold-hlhl",
    question:
      "Le Gold montre une structure HH/HL claire sur le 5min. Le prix vient de faire un nouveau HL à 4214. Où placer votre entrée en scalp achat ?",
    symbol: "OANDA:XAUUSD",
    interval: "5",
    context:
      "XAUUSD 5min/H1 — 13 novembre 2025. Le Gold fait des Higher Highs et Higher Lows. Tendance haussière en cours. Observez la structure HH/HL.",
    options: [
      { label: "Acheter immédiatement au marché", correct: false },
      {
        label:
          "Attendre la confirmation du nouveau HH au-dessus de 4215, entrer vers 4221",
        correct: true,
      },
      { label: "Vendre car le prix est trop haut", correct: false },
      { label: "Attendre un retour à 4205 pour acheter", correct: false },
    ],
    explanation:
      "Trade réel #18 : Buy @4221, SL @4214, TP1 4225 / TP2 4228 / TP3 4235. +140 pips. En scalping continuation HH/HL, on entre sur la confirmation du nouveau HH avec le SL sous le dernier HL.",
  },
  {
    id: "scalp-nas-liquidity",
    question:
      "Quelle méthode est la plus appropriée pour entrer sur ce type de setup en scalping ?",
    symbol: "PEPPERSTONE:NAS100",
    interval: "5",
    context:
      "NAS100 5min — Concentrez-vous sur la structure de marché et les points pivots.",
    options: [
      { label: "Prise de liquidités", correct: true },
      { label: "Break out", correct: false },
      { label: "Distribution", correct: false },
      { label: "Accumulation", correct: false },
    ],
    explanation:
      "La prise de liquidités est la méthode clé : le prix vient chercher les stops sous un niveau clé avant de repartir dans le sens du flux.",
  },
  {
    id: "scalp-nas-trades-count",
    question: "Combien de trades pouvaient être pris sur ce chart ?",
    symbol: "PEPPERSTONE:NAS100",
    interval: "5",
    context:
      "NAS100 5min — 4 trades potentiels sur la journée. Sessions Tokyo / London / New York.",
    options: [
      { label: "1", correct: false },
      { label: "2", correct: false },
      { label: "3", correct: false },
      { label: "4", correct: true },
    ],
    explanation:
      "4 trades identifiables :\n1. Londres prend la liquidité au Sud de Tokyo\n2. Break Out avec momentum\n3. Londres au Nord de Tokyo\n4. Réaction sur Point Pivot S1",
  },
  {
    id: "scalp-spx-nas-divergence",
    question:
      "Quand le SP500 et le NAS100 divergent sur le 15min, que faut-il faire ?",
    symbol: "PEPPERSTONE:SPX500",
    symbol2: "PEPPERSTONE:NAS100",
    interval: "15",
    context:
      "SP500 + NAS100 en 15min. Analysez la corrélation entre les deux indices.",
    options: [
      { label: "Trader dans le sens du NAS100 uniquement", correct: false },
      { label: "Attendre la re-corrélation avant d'entrer", correct: true },
      { label: "Trader les deux en même temps", correct: false },
      { label: "Ignorer la divergence", correct: false },
    ],
    explanation:
      "Quand les indices divergent, c'est un signal de prudence. Attendre qu'ils se ré-alignent avant de prendre position réduit le risque de faux signal.",
  },
  {
    id: "scalp-nas-ny-open",
    question:
      "Dans les 5 premières minutes de l'ouverture NY, quelle est la meilleure approche ?",
    symbol: "PEPPERSTONE:NAS100",
    interval: "1",
    context:
      "NAS100 1min — Ouverture de la session New York. Fort volume attendu.",
    options: [
      {
        label: "Entrer immédiatement dans le sens du premier mouvement",
        correct: false,
      },
      {
        label:
          "Attendre 5-15min pour laisser la volatilité d'ouverture se calmer",
        correct: true,
      },
      { label: "Placer des ordres limites des deux côtés", correct: false },
      {
        label:
          "Ne pas trader les 5 premières minutes mais se positionner après la première bougie H1",
        correct: false,
      },
    ],
    explanation:
      "Les premières minutes de NY sont extrêmement volatiles avec des faux mouvements. Attendre que la direction se clarifie (5-15min) est la meilleure stratégie pour éviter les stops inutiles.",
  },
  {
    id: "scalp-gold-range",
    question:
      "Le Gold est en range étroit sur le 5min. Les volumes sont en baisse. Quelle approche de scalping ?",
    symbol: "OANDA:XAUUSD",
    interval: "5",
    context:
      "Gold 5min — Le prix oscille dans un range de 10$ depuis 2h. Session de Londres.",
    options: [
      {
        label: "Scalper les bornes du range (acheter en bas, vendre en haut)",
        correct: true,
      },
      {
        label: "Attendre un break out du range avec volume pour entrer",
        correct: false,
      },
      { label: "Ne pas trader, le Gold est mort", correct: false },
      { label: "Entrer à contre-tendance sur chaque bougie", correct: false },
    ],
    explanation:
      "En scalping, un range clair avec des bornes bien définies est idéal pour du range trading : acheter près du support, vendre près de la résistance, avec des stops serrés hors du range.",
  },
  {
    id: "scalp-dax-gap",
    question:
      "Le DAX ouvre avec un gap up de 50 points. Sur le 5min, le prix hésite au-dessus du gap. Quelle stratégie ?",
    symbol: "PEPPERSTONE:GER40",
    interval: "5",
    context:
      "DAX 5min — Ouverture de Francfort, 9h00. Gap haussier de 50 points.",
    options: [
      { label: "Shorter immédiatement car le gap va se combler", correct: false },
      {
        label:
          "Attendre 15min pour voir si le gap tient, puis trader dans le sens du gap",
        correct: true,
      },
      {
        label: "Acheter immédiatement pour profiter du momentum",
        correct: false,
      },
      { label: "Les gaps sur le DAX ne se comblent jamais", correct: false },
    ],
    explanation:
      "Les 15 premières minutes après l'ouverture de Francfort sont décisives. Si le gap tient (pas de retour sous le niveau de clôture précédent), le biais haussier est confirmé.",
  },
  {
    id: "scalp-btc-flag",
    question:
      "Le BTC fait un spike de 500$ puis consolide en flag. En scalping, comment réagir ?",
    symbol: "BITSTAMP:BTCUSD",
    interval: "5",
    context:
      "Bitcoin 5min — Mouvement impulsif de 500$ en 3 minutes suivi d'une consolidation.",
    options: [
      {
        label: "Entrer en achat sur le break du flag dans le sens du spike",
        correct: true,
      },
      { label: "Shorter car le spike va se retracer complètement", correct: false },
      { label: "Attendre un retracement de 100% du spike", correct: false },
      { label: "Ignorer, le BTC est trop volatil pour le scalp", correct: false },
    ],
    explanation:
      "Un spike suivi d'un flag (consolidation en drapeau) est un pattern de continuation classique. L'entrée se fait sur la cassure du flag dans le sens du mouvement initial.",
  },
  {
    id: "scalp-nas-gap-consolidation",
    question:
      "Le NAS100 consolide dans un range de 30 points après un gap up. Le volume baisse. Quel scalp ?",
    symbol: "PEPPERSTONE:NAS100",
    interval: "5",
    // Graphique dessiné et interactif (pas de live) : il montre le gap up, le
    // range 18450–18480 et le volume qui décroît — exactement la situation de
    // l'énoncé. On peut le faire glisser et basculer entre M5 / M15 / H1.
    staticChart: NAS100_SCENARIO,
    context:
      "NAS100 — Session New York (bascule M5 / M15 / H1, glisse pour te déplacer). Le NAS100 a ouvert en gap up et consolide dans un range serré autour de 18450-18480. Volume en baisse pendant la consolidation.",
    options: [
      { label: "Acheter au milieu du range", correct: false },
      {
        label:
          "Attendre le break au-dessus de 18480 avec confirmation de volume pour un scalp achat",
        correct: true,
      },
      { label: "Shorter car le gap va se combler", correct: false },
      { label: "Scalper les bornes du range sans stop loss", correct: false },
    ],
    explanation:
      "Après un gap up, une consolidation avec baisse de volume = accumulation. Le break du range haut avec retour de volume confirme la continuation. SL sous le range low.",
  },
  {
    id: "scalp-eurusd-crt",
    question:
      "L'EUR/USD sweep sous 1.0800 puis forme un CRT haussier. Comment entrer en scalp ?",
    symbol: "OANDA:EURUSD",
    interval: "5",
    context:
      "EUR/USD 5min/M30 — Session Londres. EUR/USD forme un CRT (Candle Range Theory) après une prise de liquidité sous 1.0800.",
    options: [
      { label: "Vendre car le support est cassé", correct: false },
      {
        label:
          "Acheter sur la clôture du CRT au-dessus de 1.0805 avec SL sous le sweep",
        correct: true,
      },
      { label: "Attendre un retest de 1.0800", correct: false },
      { label: "Le CRT ne fonctionne pas sur le forex", correct: false },
    ],
    explanation:
      "Le CRT (Candle Range Theory) après un liquidity sweep est un signal de retournement. On entre sur la clôture de la bougie CRT au-dessus du niveau, SL sous la mèche du sweep.",
  },
];
