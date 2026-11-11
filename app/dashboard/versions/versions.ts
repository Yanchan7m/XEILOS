// Les 6 versions du tableau de bord élève, dans l'ordre du sélecteur.
export const VERSIONS = [
  { n: 1, nom: "Référence", ajout: "Le tableau de bord actuel, tel quel : la base commune aux cinq autres." },
  { n: 2, nom: "Chiffre vivant", ajout: "La balance défile jusqu’à sa valeur, la courbe se trace, un point vert bat « compte synchronisé » et les derniers trades défilent." },
  { n: 3, nom: "Objectif funded", ajout: "Un anneau de progression vers le compte financé, et trois jauges : perte du jour, drawdown max, jours tradés." },
  { n: 4, nom: "Bento", ajout: "Tous les blocs en cartes, plus un calendrier de P&L jour par jour et la série de jours verts." },
  { n: 5, nom: "Xeilosia en tête", ajout: "Le briefing du jour s’écrit sous tes yeux, avec trois constats tirés de tes vrais chiffres et des questions prêtes." },
  { n: 6, nom: "Séance du jour", ajout: "Les sessions Asie, Londres, New York avec l’heure en direct, le compte à rebours de l’ouverture US et la checklist avant de trader." },
] as const;
