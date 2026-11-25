/* ------------------------------------------------------------------ */
/*  Contexte de marché : scénarios guidés en 3 étapes + décision        */
/*  01 Contexte général → 02 Activité du marché → 03 Carnet d'ordres   */
/*  → « Je trade / Je ne trade pas »                                    */
/* ------------------------------------------------------------------ */

export type Bar = { o: number; h: number; l: number; c: number; v: number };
export type DomRow = { price: number; bid: number; ask: number };

export type Choice = { id: string; label: string; detail?: string };

export type Etape = {
  question: string;
  choices: Choice[];
  answer: string;
  explication: string;
};

export type Scenario = {
  id: string;
  titre: string;
  marche: string;
  session: string;
  bars: Bar[];
  /** Étape 1 : niveaux proposés sur le graphique (id = prix en texte) */
  niveaux: number[];
  zone: number;
  contexte: Etape;
  activite: Etape;
  carnet: Etape & { dom: DomRow[]; prix: number };
  decision: Etape;
  aRetenir: string;
};

/* --- générateur déterministe ------------------------------------- */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tick = (p: number) => Math.round(p * 4) / 4; // NQ : pas de 0,25

/**
 * Construit des bougies 1 minute qui passent par des points de passage.
 * `pts` : [index, prix, multiplicateur de volume pour le segment qui y mène]
 */
function bougies(seed: number, start: number, pts: [number, number, number][], bruit: number, volBase: number): Bar[] {
  const r = rng(seed);
  const bars: Bar[] = [];
  let prev = start;
  let i0 = 0;
  let p0 = start;
  for (const [i1, p1, vm] of pts) {
    for (let i = i0 + 1; i <= i1; i++) {
      const cible = p0 + ((p1 - p0) * (i - i0)) / (i1 - i0);
      const c = tick(i === i1 ? p1 : cible + (r() - 0.5) * bruit * 2);
      const o = tick(prev);
      const h = tick(Math.max(o, c) + r() * bruit * 0.8);
      const l = tick(Math.min(o, c) - r() * bruit * 0.8);
      const v = Math.round(volBase * vm * (0.65 + r() * 0.7) * (1 + Math.abs(c - o) / (bruit * 4)));
      bars.push({ o, h, l, c, v });
      prev = c;
    }
    i0 = i1;
    p0 = p1;
  }
  return bars;
}

/* --- scénarios ---------------------------------------------------- */

const OPTIONS_ACTIVITE: Choice[] = [
  { id: "active", label: "Active et régulière", detail: "Du volume, des bougies nettes, des mouvements lisibles." },
  { id: "calme", label: "Trop calme", detail: "Peu d'échanges, petites bougies, le prix tourne en rond." },
  { id: "folle", label: "Désordonnée", detail: "Pics de volume, bougies géantes, mouvements imprévisibles." },
];

const OPTIONS_CARNET: Choice[] = [
  { id: "acheteurs", label: "Des acheteurs attendent", detail: "Grosses quantités à l'achat (bid) sur la zone." },
  { id: "vendeurs", label: "Des vendeurs attendent", detail: "Grosses quantités à la vente (ask) sur la zone." },
  { id: "personne", label: "Personne", detail: "Carnet léger, petites quantités, des trous entre les prix." },
];

const OPTIONS_DECISION: Choice[] = [
  { id: "achat", label: "Je cherche un achat", detail: "Les conditions sont réunies pour acheter sur la zone." },
  { id: "vente", label: "Je cherche une vente", detail: "Les conditions sont réunies pour vendre sur la zone." },
  { id: "rien", label: "Je ne trade pas", detail: "Les conditions ne sont pas réunies : j'attends." },
];

/** Carnet : `top` = prix de la première ligne, puis un tick (0,25) par ligne. */
const dom = (top: number, rows: [number, number][]): DomRow[] =>
  rows.map(([bid, ask], i) => ({ price: tick(top - i * 0.25), bid, ask }));

export const SCENARIOS: Scenario[] = [
  {
    id: "retest",
    titre: "Le retour sur l'ancienne résistance",
    marche: "Nasdaq futures (NQ)",
    session: "1 minute · 10 h 20, New York",
    bars: bougies(
      7,
      21420,
      [
        [14, 21480, 1],
        [21, 21462, 0.9],
        [27, 21480.5, 1],
        [33, 21467, 0.85],
        [45, 21531, 1.7],
        [59, 21482, 0.75],
      ],
      3.2,
      900,
    ),
    niveaux: [21505, 21480, 21430],
    zone: 21480,
    contexte: {
      question: "Quel marché ai-je devant moi ? Clique la zone à surveiller.",
      choices: [],
      answer: "21480",
      explication:
        "Tendance haussière. 21 480 a bloqué le prix deux fois, puis a été cassé avec force. Le marché revient maintenant dessus : l'ancienne résistance peut devenir un support. C'est LA zone à surveiller.",
    },
    activite: {
      question: "Ce n'est pas seulement une question de prix. Comment est l'activité ?",
      choices: OPTIONS_ACTIVITE,
      answer: "active",
      explication:
        "Le volume monte sur la cassure et baisse pendant le retour vers la zone : les vendeurs ne poussent pas fort. Les bougies sont nettes, la volatilité est normale. Le marché est tradable.",
    },
    carnet: {
      question: "Le prix arrive sur 21 480. Qui attend à l'achat ? Qui attend à la vente ?",
      choices: OPTIONS_CARNET,
      answer: "acheteurs",
      explication:
        "Un gros bloc d'achat de plus de 600 lots est posé à 21 480, pile sur la zone, alors qu'à la vente les quantités sont normales. Des acheteurs défendent le niveau.",
      prix: 21482,
      dom: dom(21483.5, [
        [0, 71], [0, 66], [0, 80], [0, 62], [0, 75], [0, 58], [57, 64],
        [61, 0], [55, 0], [68, 0], [72, 0], [59, 0], [83, 0], [94, 0], [648, 0], [101, 0],
      ]),
    },
    decision: {
      question: "Avant de chercher une entrée… les conditions sont-elles réunies ?",
      choices: OPTIONS_DECISION,
      answer: "achat",
      explication:
        "Les trois feux sont au vert : tendance haussière et zone claire, activité saine, acheteurs visibles au carnet. On peut chercher un achat sur la zone, avec un stop sous le bloc d'achat.",
    },
    aRetenir: "Contexte, activité et carnet disent la même chose : c'est seulement là que je cherche une entrée.",
  },
  {
    id: "midi",
    titre: "Le marché de midi",
    marche: "Nasdaq futures (NQ)",
    session: "1 minute · 12 h 40, New York",
    bars: bougies(
      23,
      21502,
      [
        [8, 21506, 0.3],
        [16, 21494, 0.25],
        [25, 21505.5, 0.3],
        [33, 21495, 0.22],
        [42, 21506, 0.25],
        [50, 21497, 0.2],
        [59, 21504, 0.22],
      ],
      1.4,
      900,
    ),
    niveaux: [21540, 21506, 21470],
    zone: 21506,
    contexte: {
      question: "Quel marché ai-je devant moi ? Clique la zone à surveiller.",
      choices: [],
      answer: "21506",
      explication:
        "Pas de tendance : le prix fait des allers-retours dans un petit range de 12 points. La seule zone utile est le haut du range, 21 506, touché trois fois. Les autres niveaux sont loin de tout.",
    },
    activite: {
      question: "Ce n'est pas seulement une question de prix. Comment est l'activité ?",
      choices: OPTIONS_ACTIVITE,
      answer: "calme",
      explication:
        "C'est la pause de midi à New York : le volume est environ quatre fois plus faible que d'habitude et les bougies font 1 à 2 points. Il n'y a ni dynamique ni participants.",
    },
    carnet: {
      question: "Le prix est sous 21 506. Qui attend à l'achat ? Qui attend à la vente ?",
      choices: OPTIONS_CARNET,
      answer: "personne",
      explication:
        "Des quantités de 1 à 7 lots et des prix sans aucun ordre : le carnet est léger. Personne ne défend rien, quelques ordres suffisent à faire sauter le prix de plusieurs ticks.",
      prix: 21504,
      dom: dom(21506, [
        [0, 4], [0, 0], [0, 7], [0, 2], [0, 0], [0, 5], [0, 3], [0, 6], [2, 3],
        [3, 0], [0, 0], [5, 0], [1, 0], [0, 0], [4, 0], [2, 0],
      ]),
    },
    decision: {
      question: "Avant de chercher une entrée… les conditions sont-elles réunies ?",
      choices: OPTIONS_DECISION,
      answer: "rien",
      explication:
        "Range sans tendance, marché endormi, carnet vide : aucune condition n'est réunie. Un trade ici, c'est du hasard. La meilleure décision est de ne pas trader et d'attendre la reprise de l'activité.",
    },
    aRetenir: "Un niveau sur le graphique ne suffit pas. Sans activité ni intervenants, je ne trade pas.",
  },
  {
    id: "contradiction",
    titre: "Le graphique dit oui, le carnet dit non",
    marche: "Nasdaq futures (NQ)",
    session: "1 minute · 10 h 50, New York",
    bars: bougies(
      41,
      21430,
      [
        [18, 21600, 1.2],
        [27, 21548, 1],
        [35, 21566, 0.9],
        [44, 21555, 0.9],
        [59, 21597, 1.3],
      ],
      3.6,
      900,
    ),
    niveaux: [21600, 21560, 21450],
    zone: 21600,
    contexte: {
      question: "Quel marché ai-je devant moi ? Clique la zone à surveiller.",
      choices: [],
      answer: "21600",
      explication:
        "Forte tendance haussière, mais le prix revient sur 21 600, le plus haut où il a déjà été rejeté. Le prochain mouvement se joue sur ce niveau : cassure ou nouveau rejet.",
    },
    activite: {
      question: "Ce n'est pas seulement une question de prix. Comment est l'activité ?",
      choices: OPTIONS_ACTIVITE,
      answer: "active",
      explication:
        "Le volume est présent et régulier, les bougies sont franches sans être démesurées. L'activité permet de trader.",
    },
    carnet: {
      question: "Le prix arrive sur 21 600. Qui attend à l'achat ? Qui attend à la vente ?",
      choices: OPTIONS_CARNET,
      answer: "vendeurs",
      explication:
        "Un mur de vente de plus de 800 lots est posé à 21 600, et les prix juste en dessous sont aussi chargés à la vente (150 à 230 lots, au lieu de 50 à 70 d'habitude). Les vendeurs attendent le prix.",
      prix: 21597,
      dom: dom(21600.75, [
        [0, 58], [0, 61], [0, 74], [0, 842], [0, 233], [0, 198], [0, 176], [0, 161],
        [0, 149], [0, 127], [0, 118], [0, 96], [0, 88], [0, 81], [0, 69], [41, 52],
      ]),
    },
    decision: {
      question: "Avant de chercher une entrée… les conditions sont-elles réunies ?",
      choices: OPTIONS_DECISION,
      answer: "rien",
      explication:
        "Le graphique pousse à acheter, mais le carnet montre de gros vendeurs pile sur le niveau. Les signaux se contredisent : acheter, c'est acheter sous un mur ; vendre, c'est aller contre la tendance. Je ne trade pas et j'attends que le niveau soit cassé ou qu'il rejette clairement.",
    },
    aRetenir: "Quand le contexte et le carnet ne disent pas la même chose, les conditions ne sont pas réunies.",
  },
];
