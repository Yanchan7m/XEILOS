/**
 * Petit bus d'événements pour la démo : les exercices publient chaque réponse,
 * le tableau de bord formateur les affiche en direct, sans couplage entre les
 * composants.
 */

export type AnswerEvent = {
  /** Bloc d'où vient la réponse (QCM, parcours, scalping…). */
  source: string;
  /** Module ou catégorie pédagogique. */
  module: string;
  correct: boolean;
  at: number;
};

const EVENT = "xeilos:answer";

export function publishAnswer(e: Omit<AnswerEvent, "at">) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AnswerEvent>(EVENT, { detail: { ...e, at: Date.now() } }),
  );
}

export function onAnswer(handler: (e: AnswerEvent) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (ev: Event) => handler((ev as CustomEvent<AnswerEvent>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
