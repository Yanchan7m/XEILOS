# Quiz & Exercices — Xeilos × Ask Amélie

Ce document décrit les deux briques pédagogiques « évaluation » de la démo :
le **QCM** (choix de réponse) et les **Exercices interactifs** (action directe
sur le graphique). Les deux vivent sur la page `/demo`.

---

## 1. QCM · modules du Mastère

L'apprenant lit une question et choisit une (ou plusieurs) réponse(s).
Certaines questions embarquent un graphique en chandeliers japonais.

- **Composant** : `components/MasterQCM.tsx`
- **Données** : `lib/master-qcm.ts` (`MASTER_QCM`)
- **Graphique** : `components/CandlestickChart.tsx` (statique, lecture seule)
- **Feedback final** : `components/YanAnalysis.tsx` + performance par module

C'est le format « je reconnais / je choisis ».

---

## 2. Exercices interactifs · lecture graphique  ← nouvelle feature

Ici l'apprenant **ne choisit plus une réponse** : il agit directement sur le
graphique. L'app corrige la position et Yan analyse le résultat.

- **Composant** : `components/InteractiveChartExercise.tsx`
- **Données** : `lib/exercises.ts` (`EXERCISES`)
- **Intégration** : bloc 3 de `app/demo/page.tsx`

### Deux types d'interaction

| Type    | Geste de l'apprenant                                  | Correction                                   |
| ------- | ----------------------------------------------------- | -------------------------------------------- |
| `line`  | Fait **glisser** une ligne horizontale (drag / ▲▼)    | `\|placé − cible\| ≤ tolerance` (en prix)     |
| `pick`  | **Clique** sur la bougie clé                          | `\|index − cible\| ≤ tolerance` (en bougies)  |

- **Mobile & desktop** : le drag utilise les *pointer events* (`touchAction:
  "none"`), avec des boutons ▲ / ▼ pour un réglage précis au clavier/tactile.
- **Révélation** : après validation, la bonne ligne (verte = support, rouge =
  résistance) ou la bonne bougie (halo vert) s'affiche à côté de la réponse de
  l'apprenant, avec l'écart mesuré.
- **Score & feedback** : récap par exercice + analyse de Yan réutilisée du QCM.

### Exercices livrés (`EXERCISES`)

1. **Placer le support** d'un range (`line`, cible 102, ±1.2)
2. **Placer la résistance** qui plafonne le prix (`line`, cible 104, ±1.2)
3. **Cliquer sur la bougie de breakout** (`pick`, index 10, repère résistance à 104)
4. **Cliquer sur le point de retournement** en V (`pick`, index 6, ±1 bougie)

### Ajouter un exercice

Ajoute une entrée dans `EXERCISES` (`lib/exercises.ts`).

**Type `line`** :

```ts
{
  kind: "line",
  id: "ex-mon-support",
  module: "Analyse technique · Trading",
  prompt: "Fais glisser la ligne pour marquer le SUPPORT.",
  hint: "Le support est le niveau bas où le prix rebondit.",
  data: MES_CANDLES,          // Candle[] = { o, h, l, c }
  lineType: "support",        // "support" | "resistance"
  target: 102,                // prix correct
  tolerance: 1.2,             // marge d'erreur en prix
  explanation: "…",
}
```

**Type `pick`** :

```ts
{
  kind: "pick",
  id: "ex-mon-breakout",
  module: "Analyse technique · Trading",
  prompt: "Clique sur la bougie qui casse la résistance.",
  data: MES_CANDLES,
  targetIndex: 10,            // index de la bonne bougie
  tolerance: 0,               // ± bougies acceptées (défaut 0)
  guide: { resistance: 104 }, // lignes repères optionnelles
  explanation: "…",
}
```

Aucun autre fichier à toucher : le composant itère sur `EXERCISES` et gère
progression, score et feedback automatiquement.

### Idées d'extension

- Nouveau type `trend` : tracer une droite de tendance (2 points glissables).
- Nouveaux modules (KPI, finance) avec d'autres formes de graphiques
  (courbes, barres, camemberts) — voir `lib/exercises.ts` pour le patron de
  données.
- Génération des jeux de bougies depuis le contenu réel des cours.
