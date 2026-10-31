import type { Candle } from "@/lib/exercises";
import type { QcmOption } from "@/lib/master-qcm";
import type { DomLevel } from "@/lib/orderbook";
import data from "@/lib/formation-exos.json";

/**
 * Compétences évaluées : chaque exercice en travaille une seule, ce qui
 * permet de suivre la maîtrise de l'apprenant compétence par compétence.
 */
export type Competence =
  | "regles-prop-firm"
  | "plateforme-execution"
  | "gestion-risque"
  | "macro-chiffres"
  | "horaires-sessions"
  | "structure-prix-zones"
  | "carnet-ordres"
  | "scalping-execution"
  | "psychologie-discipline"
  | "specificites-instrument";

/** 1 = notion de base, 2 = application, 3 = lecture fine d'une situation de marché. */
export type Difficulty = 1 | 2 | 3;

type ExoBase = {
  id: string;
  module: string;
  competence: Competence;
  difficulty: Difficulty;
  /** Vidéo de la formation dont l'exercice est tiré. */
  source: string;
  explanation: string;
  hint?: string;
};

export type FormationQcm = ExoBase & {
  type: "qcm";
  question: string;
  multi: boolean;
  options: QcmOption[];
};

/** Placer une ligne support/résistance (même mécanique que `LineExercise`). */
export type FormationLine = ExoBase & {
  type: "chart-line";
  prompt: string;
  lineType: "support" | "resistance";
  target: number;
  tolerance: number;
  data: Candle[];
};

/** Cliquer la bougie clé (même mécanique que `PickExercise`). */
export type FormationPick = ExoBase & {
  type: "chart-pick";
  prompt: string;
  targetIndex: number;
  tolerance?: number;
  guide?: { support?: number; resistance?: number };
  data: Candle[];
};

/** Cliquer le mur de liquidité (même mécanique que `WallExercise`). */
export type FormationWall = ExoBase & {
  type: "orderbook-wall";
  prompt: string;
  instrument: string;
  side: "bid" | "ask";
  targetPrice: number;
  levels: DomLevel[];
};

/** Biais d'après le carnet (même mécanique que `BiasExercise`). */
export type FormationBias = ExoBase & {
  type: "orderbook-bias";
  prompt: string;
  instrument: string;
  answer: "long" | "short";
  levels: DomLevel[];
};

export type FormationExo =
  | FormationQcm
  | FormationLine
  | FormationPick
  | FormationWall
  | FormationBias;

/**
 * Banque d'exercices générée à partir des transcriptions des 83 vidéos de
 * la formation (prop firms, scalping DAX/Bund/EuroStoxx/Russell/Nasdaq,
 * NFP, macro, carnets d'ordres). Chaque exercice cite sa vidéo source.
 */
export const FORMATION_EXOS = data as FormationExo[];

/** Réponse donnée par l'apprenant à un exercice de la banque. */
export type ExoAttempt = { id: string; correct: boolean };

export type Mastery = {
  competence: Competence;
  attempts: number;
  /** Estimation de maîtrise entre 0 et 1 (a priori 0,5 sans réponse). */
  score: number;
};

const COMPETENCES = [
  ...new Set(FORMATION_EXOS.map((e) => e.competence)),
] as Competence[];

const byId = new Map(FORMATION_EXOS.map((e) => [e.id, e]));

/**
 * Maîtrise par compétence. Une bonne réponse sur un exercice difficile
 * pèse plus qu'une bonne réponse sur une notion de base, et inversement
 * une erreur sur une notion de base pèse plus lourd.
 */
export function masteryByCompetence(history: ExoAttempt[]): Mastery[] {
  return COMPETENCES.map((competence) => {
    let won = 1;
    let total = 2; // a priori bêta(1, 1) → 0,5
    let attempts = 0;
    for (const a of history) {
      const exo = byId.get(a.id);
      if (!exo || exo.competence !== competence) continue;
      attempts++;
      const w = a.correct ? exo.difficulty : 4 - exo.difficulty;
      total += w;
      if (a.correct) won += w;
    }
    return { competence, attempts, score: won / total };
  });
}

/** Nombre de réponses minimum par compétence avant de cibler les faiblesses. */
const DIAGNOSTIC_ATTEMPTS = 2;

/**
 * Choisit le prochain exercice. D'abord un diagnostic (chaque compétence
 * est évaluée au moins deux fois), puis on cible la compétence la moins
 * maîtrisée, avec une difficulté adaptée à son niveau (1 sous 50 %, 2 sous
 * 80 %, 3 au-delà). On n'enchaîne jamais plus de deux exercices sur la même
 * compétence (pratique entrelacée). Renvoie `undefined` quand toute la
 * banque a été vue.
 */
export function nextExercise(history: ExoAttempt[]): FormationExo | undefined {
  const seen = new Set(history.map((a) => a.id));
  const unseen = FORMATION_EXOS.filter((e) => !seen.has(e.id));
  if (unseen.length === 0) return undefined;

  const last = history.slice(-2).map((a) => byId.get(a.id)?.competence);
  const blocked = last.length === 2 && last[0] === last[1] ? last[0] : undefined;
  const inDiagnostic = (m: Mastery) => (m.attempts < DIAGNOSTIC_ATTEMPTS ? 0 : 1);

  const ranked = masteryByCompetence(history)
    .filter((m) => m.competence !== blocked)
    .sort(
      (a, b) =>
        inDiagnostic(a) - inDiagnostic(b) ||
        a.score - b.score ||
        a.attempts - b.attempts,
    );
  for (const m of ranked) {
    const pool = unseen.filter((e) => e.competence === m.competence);
    if (pool.length === 0) continue;
    const target: Difficulty = m.score < 0.5 ? 1 : m.score < 0.8 ? 2 : 3;
    return pool.reduce((best, e) =>
      Math.abs(e.difficulty - target) < Math.abs(best.difficulty - target)
        ? e
        : best,
    );
  }
  return unseen[0];
}
