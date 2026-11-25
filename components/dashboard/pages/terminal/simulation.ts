// Marché simulé du terminal d'entraînement : un Nasdaq (NQ) fictif.
// Tout est déterministe : le tick n donne toujours le même prix, quel que soit
// l'appareil ou le nombre de rechargements de la page.

export type Bougie = { o: number; h: number; l: number; c: number };

export const PAS = 0.25; // un tick NQ = 0,25 point
export const TICKS_PAR_BOUGIE = 6;
/** Les ticks déjà « écoulés » à l'ouverture : 50 bougies d'historique. */
export const TICK_DEPART = 50 * TICKS_PAR_BOUGIE;
const PRIX_INITIAL = 21_480;

/** Les deux contrats proposés. Valeur d'un point en $ pour 1 contrat. */
export const CONTRATS = {
  MNQ: { nom: "Micro Nasdaq (MNQ)", parPoint: 2 },
  NQ: { nom: "E-mini Nasdaq (NQ)", parPoint: 20 },
} as const;
export type Contrat = keyof typeof CONTRATS;

/** Pseudo-aléatoire stable : même entrée, même sortie (0 ≤ x < 1). */
function hash(n: number, sel = 0): number {
  let x = (n * 374761393 + sel * 668265263) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

const arrondi = (p: number) => Math.round(p / PAS) * PAS;

// Cache des prix déjà calculés (la marche aléatoire dépend du prix précédent).
const prix: number[] = [PRIX_INITIAL];

/** Prix au tick n. */
export function prixAuTick(n: number): number {
  while (prix.length <= n) {
    const i = prix.length;
    const precedent = prix[i - 1];
    const bruit = (hash(i) - 0.5) * 7; // ± 3,5 points
    const tendance = Math.sin(i / 70) * 0.9 + Math.sin(i / 23) * 0.5;
    const rappel = (PRIX_INITIAL - precedent) * 0.004; // évite de partir à l'infini
    prix.push(arrondi(precedent + bruit + tendance + rappel));
  }
  return prix[n];
}

/** Les bougies jusqu'au tick n inclus (la dernière est en formation). */
export function bougiesAuTick(n: number, nombre = 48): Bougie[] {
  const derniere = Math.floor(n / TICKS_PAR_BOUGIE);
  const premiere = Math.max(0, derniere - nombre + 1);
  const out: Bougie[] = [];
  for (let b = premiere; b <= derniere; b++) {
    const debut = b * TICKS_PAR_BOUGIE;
    const fin = Math.min(n, debut + TICKS_PAR_BOUGIE - 1);
    const o = b === 0 ? prixAuTick(0) : prixAuTick(debut - 1);
    let h = o, l = o;
    for (let t = debut; t <= fin; t++) {
      const p = prixAuTick(t);
      h = Math.max(h, p);
      l = Math.min(l, p);
    }
    out.push({ o, h, l, c: prixAuTick(fin) });
  }
  return out;
}

export type Niveau = { prix: number; acheteurs: number; vendeurs: number };

/** Carnet d'ordres simplifié autour du prix : 6 niveaux de chaque côté. */
export function carnetAuTick(n: number): { niveaux: Niveau[]; bid: number; ask: number } {
  const bid = prixAuTick(n);
  const ask = bid + PAS;
  const niveaux: Niveau[] = [];
  for (let k = 6; k >= 1; k--) {
    const p = ask + (k - 1) * PAS;
    niveaux.push({ prix: p, acheteurs: 0, vendeurs: Math.round(4 + hash(n * 13 + k, 1) * 26 + k * 3) });
  }
  for (let k = 1; k <= 6; k++) {
    const p = bid - (k - 1) * PAS;
    niveaux.push({ prix: p, acheteurs: Math.round(4 + hash(n * 13 + k, 2) * 26 + k * 3), vendeurs: 0 });
  }
  return { niveaux, bid, ask };
}

/** Heure fictive de la séance (ouverture US 15:30, 10 s par tick). */
export function heureAuTick(n: number): string {
  const secondes = 15 * 3600 + 30 * 60 + (n - TICK_DEPART) * 10;
  const h = Math.floor(secondes / 3600) % 24;
  const m = Math.floor((secondes % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
