/* Phrases des rappels du mode scalping : les mêmes que la fonction scalp-rappel
   d'Axone (et que src/journal/components/settings/PhrasesScalping.tsx dans
   c4march). Une liste vide chez l'élève = ces phrases-là. */

export type PhrasesScalp = {
  pourTous?: boolean; // super-admin seulement (lu par scalp-rappel)
  ouverture?: string;
  perte?: string[];
  gain?: string[];
  calme?: string[]; // avant le premier trade
  neutre?: string[]; // après un trade neutre (± 5 $)
  rythme?: number; // minutes entre deux rappels
  prioritaires?: string[]; // phrases ⭐ : un rappel sur deux
  souffles?: string[];
  respiration?: boolean;
};

export type Liste = "calme" | "neutre" | "perte" | "gain" | "souffles";

export const PHRASES_DEFAUT: { ouverture: string } & Record<Liste, string[]> = {
  ouverture: "Respire. Pas de décision hâtive, un setup A+ ou rien.",
  perte: [
    "Respire. Une perte fait partie du jeu, la vengeance non.",
    "Inspire. Le prochain trade ne répare pas le précédent.",
    "Ne cherche pas à te refaire : le marché ne te doit rien.",
    "Stop touché = plan respecté. Tu n'as rien à prouver.",
    "Réduis la taille, jamais ta discipline.",
    "Accepte la perte et garde ton calme : c'est ça, le métier.",
    "Pas de décision hâtive. Attends que le prix revienne à ton niveau.",
  ],
  gain: [
    "Belle exécution. Ne laisse pas l'euphorie augmenter ta taille.",
    "Protège tes gains : savoir s'arrêter fait partie d'un bon jour.",
    "Reste humble, le marché reprend vite à ceux qui s'emballent.",
    "Même process, même risque. Rien ne change parce que tu gagnes.",
    "Respire. Tu n'as pas besoin d'un trade de plus pour valider ta journée.",
  ],
  calme: [
    "Respire. Le marché sera encore là dans 2 minutes.",
    "Pas de décision hâtive : laisse le prix venir à toi.",
    "Tu n'es pas payé pour trader souvent, tu es payé pour trader juste.",
    "Un setup A+ ou rien.",
    "Le meilleur trade est parfois celui que tu ne prends pas.",
    "Patience. Le prix montre ses cartes à ceux qui savent attendre.",
    "Ton plan d'abord. Les mains loin de la souris tant que ton signal n'est pas là.",
  ],
  neutre: [
    "Respire. Le marché sera encore là dans 2 minutes.",
    "Pas de décision hâtive : laisse le prix venir à toi.",
    "Tu n'es pas payé pour trader souvent, tu es payé pour trader juste.",
    "Un setup A+ ou rien.",
    "Le meilleur trade est parfois celui que tu ne prends pas.",
    "Patience. Le prix montre ses cartes à ceux qui savent attendre.",
    "Ton plan d'abord. Les mains loin de la souris tant que ton signal n'est pas là.",
  ],
  souffles: [
    "Respiration carrée : inspire 4 s, bloque 4 s, expire 4 s, bloque 4 s, 4 fois.",
    "Cohérence cardiaque : inspire 5 s, expire 5 s, pendant 1 minute.",
    "Soupir physiologique : deux inspirations par le nez, une longue expiration par la bouche, 3 fois.",
    "Expiration longue : inspire 4 s, expire 8 s, 5 fois.",
  ],
};

export const LISTES: { cle: Liste; titre: string; aide: string }[] = [
  { cle: "calme", titre: "Avant le premier trade", aide: "Tant que tu n'as pas encore tradé dans la session." },
  { cle: "neutre", titre: "Après un trade neutre", aide: "Quand ton dernier trade est à l'équilibre (± 5 $)." },
  { cle: "perte", titre: "Après une perte", aide: "Quand ton dernier trade est perdant." },
  { cle: "gain", titre: "Après un gain", aide: "Quand ton dernier trade est gagnant." },
  { cle: "souffles", titre: "Respiration", aide: "La ligne 🫁 sous chaque rappel." },
];

export const versTexte = (l?: string[]) => (l ?? []).join("\n");
export const versListe = (t: string) =>
  t.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 50).map((s) => s.slice(0, 200));

export const RYTHMES = [1, 2, 3, 5, 10, 15, 30];
