import type { Archetype } from "./quiz";

type Reply = { match: RegExp; answer: string };

const COMMON: Reply[] = [
  {
    match: /(d[ée]bute|d[ée]butant|commence(r)?|niveau z[ée]ro|jamais trad[ée])/i,
    answer:
      "Top, tu pars d'une page blanche, c'est un avantage. Chez Xeilos on commence toujours par les fondations : marchés, vocabulaire, gestion du risque. Le MBA Trading est conçu pour ça, et il est finançable CPF. Tu veux que je te détaille le parcours ?",
  },
  {
    match: /(cpf|finan(c|ç)e|prix|tarif|co[uû]t|rncp|qualiopi|certif)/i,
    answer:
      "Toutes les formations Xeilos sont certifiantes (RNCP), reconnues par l'État et finançables via le CPF. Selon ton solde CPF, le reste à charge peut être nul. Le détail tarifaire se construit avec un conseiller, je peux t'orienter vers la bonne formation d'abord ?",
  },
  {
    match: /(temps|combien.*temps|rentab|combien.*gagn)/i,
    answer:
      "Pas de promesse de gains : devenir constant prend généralement 12 à 24 mois de pratique sérieuse, avec un capital de test. Xeilos t'apprend à protéger ton capital d'abord, puis à construire une méthode reproductible. C'est moins sexy que les promesses qu'on voit ailleurs, mais c'est ce qui marche.",
  },
  {
    match: /(scalp|day.?trad|intraday)/i,
    answer:
      "Le scalping et le day trading demandent du temps écran et un mental solide. On les enseigne dans le parcours MBA Trading, avec un focus prop firm pour ceux qui veulent trader avec le capital d'une firme. Tu as déjà du matériel multi-écrans ?",
  },
  {
    match: /(swing|position|moyen.?terme)/i,
    answer:
      "Le swing trading, c'est ma reco quand on a un job à côté. 1h par jour suffit. Le Master Trading – Swing & Position couvre l'analyse multi-timeframes, les setups récurrents et la gestion du risque. C'est cadré, méthodique.",
  },
  {
    match: /(crypto|bitcoin|btc|eth|defi|blockchain|web3|altcoin)/i,
    answer:
      "Pour la crypto on a une formation dédiée : Cryptomonnaies, Blockchain & DeFi. On y voit la sécurité des wallets (souvent négligée), les cycles BTC, et comment lire le on-chain sans se faire piéger par les narratives.",
  },
  {
    match: /(action|etf|dividende|long.?terme|investi)/i,
    answer:
      "Profil investisseur : on a un programme Investissement & Marchés Financiers axé actions, ETF, dividendes et construction de portefeuille. Approche posée, peu chronophage, basée sur les fondamentaux.",
  },
  {
    match: /(prop.?firm)/i,
    answer:
      "Les prop firms permettent de trader avec un capital qui n'est pas le tien, moyennant un challenge à passer. Xeilos t'entraîne spécifiquement à ces challenges (drawdown, daily loss, objectifs de gain). Beaucoup d'élèves passent leur funded en quelques mois.",
  },
  {
    match: /(mat[ée]riel|setup|[ée]cran|ordi|hardware)/i,
    answer:
      "Pour démarrer : un bon laptop suffit. Si tu pars sur du scalping, deux écrans deviennent vite indispensables. Xeilos te conseille selon le style, pas besoin d'investir 3000 € avant d'avoir trouvé ta méthode.",
  },
  {
    match: /(risque|stop.?loss|gestion|drawdown|psycho)/i,
    answer:
      "La gestion du risque c'est 80% du métier. Règle d'or : ne jamais risquer plus de 1 à 2% du capital par trade. C'est un module central de toutes nos formations, la psycho et le risk management sont enseignés avant les setups.",
  },
  {
    match: /(diff[ée]rence|compar|vs|ou bien)/i,
    answer:
      "Bonne question. La principale différence entre styles : l'horizon de temps et donc l'exposition mentale. Scalping = secondes/minutes, swing = jours/semaines, investissement = mois/années. Plus l'horizon est court, plus la charge mentale est élevée. Quel style te tente le plus ?",
  },
  {
    match: /(formation|programme|cours|cursus|catalogue)/i,
    answer:
      "On a 4 grandes familles : MBA Trading (complet, day trading + prop firm), Master Swing & Position, Investissement & Marchés Financiers, et Crypto/DeFi. Toutes certifiantes RNCP. Sur quel style tu veux que je creuse ?",
  },
  {
    match: /(coach|prof|formateur|qui enseigne|équipe)/i,
    answer:
      "Les formateurs Xeilos sont d'anciens traders de salles européennes. Pas de gourous Insta, des pros qui ont géré du capital institutionnel. Tu accèdes aussi à un Discord actif pour échanger en continu.",
  },
  {
    match: /(merci|super|cool|parfait|ok)/i,
    answer:
      "Avec plaisir 🙌 N'hésite pas si tu veux qu'on creuse un sujet en particulier, méthode, parcours, financement, je suis là.",
  },
  {
    match: /(salut|bonjour|hello|hey|coucou)/i,
    answer:
      "Salut 👋 Pose-moi tes questions sur le trading ou les formations Xeilos, je suis là pour t'orienter.",
  },
];

const ARCHETYPE_HINTS: Record<Archetype, string> = {
  scalper:
    "Vu ton profil scalpeur, je te suggère de regarder en priorité le MBA Trading avec module prop firm. ",
  swing:
    "Vu ton profil swing, le Master Swing & Position est taillé pour toi. ",
  investor:
    "Vu ton profil investisseur, le programme Investissement & Marchés Financiers correspond mieux. ",
  crypto:
    "Vu ton profil crypto-native, la formation Cryptomonnaies, Blockchain & DeFi est faite pour toi. ",
};

const FALLBACKS = [
  "Bonne question. Je peux t'orienter sur la formation, le financement CPF, les styles de trading ou la méthode pédagogique Xeilos. Sur quoi tu veux qu'on creuse ?",
  "Je t'avoue que je suis spécialisé sur l'orientation formation Xeilos. Reformule-moi ta question côté trading, parcours ou financement et je te réponds direct.",
  "Précise un peu, tu cherches une formation, des conseils de méthode, ou de l'info sur le financement ?",
];

export function scriptedReply(
  userMessage: string,
  archetype: Archetype | null,
  turnIndex: number,
): string {
  for (const r of COMMON) {
    if (r.match.test(userMessage)) {
      const prefix =
        archetype && turnIndex === 0 ? ARCHETYPE_HINTS[archetype] : "";
      return prefix + r.answer;
    }
  }
  return FALLBACKS[turnIndex % FALLBACKS.length];
}
