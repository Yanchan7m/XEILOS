type Reply = { match: RegExp; answer: string };

/**
 * Réponses de secours de Xeilosia, la tutrice IA de Xeilos Trading Academy,
 * quand le vrai modèle n'est pas joignable. Elles couvrent les modules du
 * parcours trading : gestion du risque, analyse technique, carnet d'ordres,
 * scalping, psychologie, prop firms. Jamais de promesse de gain.
 */
const COMMON: Reply[] = [
  {
    match: /(stop.*trop serr|serr[ée].*stop)/i,
    answer:
      "Sur ton dernier trade NASDAQ, ton stop était collé à ton entrée, dans le bruit normal du marché : une simple respiration du prix l'a touché avant que ton idée ait le temps de jouer. Place-le là où ton idée devient fausse (sous le dernier creux, par exemple), puis réduis ta taille de position pour garder le même risque en $. Un stop plus large ne veut pas dire risquer plus.",
  },
  {
    match: /(bloc ?2|r[ée]vis)/i,
    answer:
      "Bloc 2, Structure de marché. Trois questions pour réviser :\n1. Une tendance haussière, c'est quoi ? (des sommets et des creux de plus en plus hauts)\n2. Une résistance cassée devient souvent… ? (un support)\n3. Range calme, sans volume : que fais-tu ? (souvent rien, tu attends une cassure franche)\nTu veux aller plus loin ? Fais la page Contexte de marché, situation 1.",
  },
  {
    match: /(analyse.*semaine|ma semaine|bilan)/i,
    answer:
      "Ta semaine, sur le compte démo : ta méthode tient (56 % de réussite pour un seuil de rentabilité autour de 47 %) et ton risque est maîtrisé (drawdown max 2 %). Ton point faible : tu coupes tes gagnants trop tôt, ton gain moyen ne vaut que 1,1 fois ta perte moyenne alors que ton plan vise 1:1,8. Objectif de la semaine prochaine : laisser au moins un trade aller jusqu'à son objectif.",
  },
  {
    match: /(absorb|absorption)/i,
    answer:
      "L'absorption, c'est quand beaucoup d'ordres frappent un prix sans réussir à le faire bouger. Exemple : des vendeurs vendent au marché, mais à chaque fois de nouveaux acheteurs reviennent dans le carnet et le prix ne recule pas. Les acheteurs « absorbent » la pression. Si les vendeurs s'épuisent, le prix peut ensuite monter vite. Ce n'est jamais un signal automatique : attends que le prix confirme et garde ton stop. Entraîne-toi dans l'onglet Exercices, « L'absorption ».",
  },
  {
    match: /(garanti|combien.*(gagn|mois|semaine)|rentab|devenir riche|vivre du trading|taux de r[ée]ussite)/i,
    answer:
      "Personne ne peut te garantir un gain, et méfie-toi de ceux qui le font. Selon l'AMF, environ 9 particuliers sur 10 perdent de l'argent sur les CFD et le forex. Ici, on travaille la méthode et la discipline, en argent fictif d'abord. Ce qu'on peut viser, c'est de perdre peu quand on a tort.",
  },
  {
    match: /(par o[uù] (je )?commence|d[ée]but|d[ée]butant|je connais rien|premier pas)/i,
    answer:
      "Commence par la Formation, bloc 1 : la gestion du risque. Ensuite, fais la page Contexte de marché : tu y lis un marché en 3 étapes avant de décider. Et garde le lexique ouvert pour les mots techniques. Pas d'argent réel tant que tu n'as pas un plan écrit.",
  },
  {
    match: /(stop.?loss|\bstop\b|\bsl\b)/i,
    answer:
      "Le stop loss est l'ordre qui coupe ta position automatiquement si le prix va contre toi. Tu le places AVANT d'entrer, à l'endroit où ton idée devient fausse (par exemple sous un support). Exemple : achat à 100, stop à 98 : tu acceptes de perdre 2 points, pas plus.",
  },
  {
    match: /(risque|1 ?%|2 ?%|taille de position|lot|money management)/i,
    answer:
      "La règle de base : ne risque pas plus de 1 % de ton compte par trade. Sur 10 000 $, c'est 100 $ maximum entre ton entrée et ton stop. Tu calcules ta taille de position à partir de ça, jamais l'inverse. En challenge prop firm, reste même sous 1 % : la perte journalière maximale arrive vite.",
  },
  {
    match: /(prop.?firm|challenge|funded|financ[ée]|drawdown|perte journali)/i,
    answer:
      "Une prop firm te confie un compte si tu réussis un challenge : atteindre un objectif sans dépasser deux limites, la perte du jour (souvent 5 %) et le drawdown maximal (souvent 10 %). Le piège, c'est la perte du jour : avec 2 % de risque par trade, trois pertes suffisent à échouer. Vise 0,5 à 1 % par trade.",
  },
  {
    match: /(levier|x ?\d{2,3}|leverage)/i,
    answer:
      "Le levier te permet de prendre une position plus grosse que ton capital. Il multiplie les gains ET les pertes. Avec un levier de 500, un mouvement de 0,2 % contre toi peut effacer tout ton compte. C'est le premier facteur de pertes chez les débutants : pense en risque par trade, pas en levier.",
  },
  {
    match: /(support|r[ée]sistance)/i,
    answer:
      "Un support est une zone où les acheteurs ont déjà arrêté la baisse ; une résistance, une zone où les vendeurs ont arrêté la hausse. Ce sont des zones, pas des lignes exactes. Une résistance cassée devient souvent un support : c'est la situation 1 de la page Contexte de marché.",
  },
  {
    match: /(carnet|order ?book|\bdom\b|bid|ask|mur)/i,
    answer:
      "Le carnet d'ordres montre les ordres en attente : à l'achat (bid) sous le prix, à la vente (ask) au-dessus. Un gros bloc peut freiner le prix, mais il peut aussi être retiré à tout moment. Il confirme ou contredit ce que dit le graphique : c'est l'étape 3 de la page Contexte de marché.",
  },
  {
    match: /(range|consolidation|tendance|breakout|cassure)/i,
    answer:
      "Une tendance fait des sommets et des creux de plus en plus hauts (ou bas). Un range, c'est un prix qui fait des allers-retours entre deux bornes. Dans un range calme et sans volume, la meilleure décision est souvent de ne pas trader : attends une cassure franche, avec du volume.",
  },
  {
    match: /(scalp|scalping|futures|nasdaq|\bnq\b)/i,
    answer:
      "Le scalping, ce sont des trades de quelques minutes qui visent de petits mouvements. Ça demande de la rigueur : frais, vitesse, stress. Concentre-toi sur les heures actives (ouverture de New York, 15h30 à Paris) et évite midi et les annonces économiques.",
  },
  {
    match: /(revenge|peur|stress|[ée]motion|tilt|perdu|me refaire|frustr)/i,
    answer:
      "Après une perte, l'envie de « se refaire » vite est le piège le plus coûteux. Fixe-toi une règle simple : après 2 pertes d'affilée, tu arrêtes pour la journée. Note ce que tu ressens dans le journal de trading : c'est comme ça qu'on repère ses mauvais réflexes.",
  },
  {
    match: /(journal)/i,
    answer:
      "Le journal de trading, c'est ton outil de progrès : pour chaque trade, note pourquoi tu es entré, si tu as respecté ton plan, et ce que tu ressentais. Au bout de 20 trades, tes erreurs répétées sautent aux yeux. Un simple carnet ou un tableur suffit pour commencer.",
  },
  {
    match: /(pip|tick|point)/i,
    answer:
      "Un pip ou un tick, c'est le plus petit mouvement de prix d'un actif. Sur le Nasdaq futures (NQ), un tick vaut 0,25 point, soit 5 $ par contrat. Ce qui compte, ce n'est pas le nombre de pips, mais combien de dollars tu risques si ton stop est touché.",
  },
  {
    match: /(merci|super|cool|parfait|ok|ça marche)/i,
    answer:
      "Avec plaisir 🙌 Tu veux enchaîner sur un QCM, ou relire une situation dans Contexte de marché ?",
  },
  {
    match: /(salut|bonjour|hello|hey|coucou|wesh|wsh)/i,
    answer:
      "Bonjour 👋 Je suis Xeilosia. Pose-moi une question sur le risque, les graphiques, le carnet d'ordres ou les prop firms. Si tu débutes, demande-moi « par où je commence ? ».",
  },
];

const FALLBACKS = [
  "Je n'ai pas de réponse toute prête à ça. Essaie avec un mot-clé : stop loss, risque, prop firm, carnet d'ordres, support, range, levier, journal…",
  "Précise un peu : tu veux comprendre une notion, refaire un QCM, ou savoir par où commencer ?",
  "Bonne question. Pour l'instant, je peux t'expliquer le risque par trade, les supports et résistances, le carnet d'ordres ou les règles d'un challenge prop firm.",
];

export function scriptedReply(userMessage: string, turnIndex: number): string {
  for (const r of COMMON) {
    if (r.match.test(userMessage)) {
      return r.answer;
    }
  }
  return FALLBACKS[turnIndex % FALLBACKS.length];
}
