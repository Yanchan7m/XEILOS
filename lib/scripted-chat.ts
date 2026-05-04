type Reply = { match: RegExp; answer: string };

/**
 * Yan est le tuteur IA du Master Xeilos.
 * Il connaît les modules réels du Master : Stratégie d'entreprise,
 * Diagnostic de performance, Fonctions économiques, Parties prenantes,
 * Optimisation des processus, Planification, KPI, Structure & organigramme.
 */
const COMMON: Reply[] = [
  {
    match: /(swot|forces.*faibless|opportunit[ée]s.*menac)/i,
    answer:
      "L'analyse SWOT couvre 4 dimensions : Forces et Faiblesses (internes à l'entreprise), Opportunités et Menaces (externes). C'est l'outil central du module Stratégie. À la différence du PESTEL (externe uniquement) ou des 5 Forces de Porter (concurrentiel), elle croise interne ET externe.",
  },
  {
    match: /(pestel|macro.?environnement)/i,
    answer:
      "PESTEL = Politique, Économique, Social, Technologique, Environnemental, Légal. C'est un outil d'analyse macro-environnementale (externe uniquement). Vu au module Stratégie. Souvent utilisé en complément de SWOT et des 5 Forces de Porter.",
  },
  {
    match: /(porter|5.?forces)/i,
    answer:
      "Les 5 Forces de Porter analysent l'intensité concurrentielle d'un secteur : 1) Rivalité entre concurrents existants, 2) Pouvoir de négociation des clients, 3) Pouvoir de négociation des fournisseurs, 4) Menace de nouveaux entrants, 5) Menace de produits de substitution. Module Stratégie d'entreprise.",
  },
  {
    match: /(strat[ée]gie|generic|differenciation|domination|focalisation|niche)/i,
    answer:
      "Le module Stratégie distingue 4 types génériques : Croissance (interne ou externe via M&A), Différenciation (premium par l'innovation), Domination par les coûts (volume + prix bas), Focalisation (niche). Le choix dépend de l'avantage concurrentiel visé.",
  },
  {
    match: /(parties? prenantes?|stakeholder)/i,
    answer:
      "Deux grandes catégories : internes (employés, managers, actionnaires, conseil d'administration) et externes (clients, fournisseurs, régulateurs, communautés). On les classe ensuite sur la matrice influence × intérêt pour prioriser l'engagement. Vu en partie 1/2 du module Management & Gouvernance.",
  },
  {
    match: /(kpi|indicateur|smart|tableau de bord|dashboard)/i,
    answer:
      "Les KPI doivent être SMART : Spécifiques, Mesurables, Atteignables, Pertinents, Temporellement définis. On distingue KPI financiers (ROI, marge), opérationnels (taux de défaut), processus (cycle time) et stratégiques (part de marché). Outils : Excel, Power BI, Tableau. Module dédié au pilotage de la performance.",
  },
  {
    match: /(balanced.?scorecard|kaplan|norton|bsc)/i,
    answer:
      "Le Balanced Scorecard de Kaplan & Norton évalue la performance selon 4 perspectives : Financière, Clients, Processus internes, Apprentissage & Croissance. Vu au module Diagnostic de performance, c'est une réponse aux limites des KPI purement financiers.",
  },
  {
    match: /(dmaic|six.?sigma)/i,
    answer:
      "DMAIC = Define, Measure, Analyze, Improve, Control. C'est la méthode structurante de Six Sigma pour réduire la variabilité d'un processus. À ne pas confondre avec PDCA (Plan-Do-Check-Act) qui est associé au Lean. Module Optimisation des processus.",
  },
  {
    match: /(lean|pdca|kaizen|5s|gaspillage)/i,
    answer:
      "Lean = élimination des gaspillages (les 7 mudas) pour fluidifier les processus. Outils clés : 5S (organisation poste), Value Stream Mapping, PDCA (Plan-Do-Check-Act), Kaizen (amélioration continue). Souvent combiné avec Six Sigma → Lean Six Sigma. Module Optimisation des processus.",
  },
  {
    match: /(cha[iî]ne de valeur|value chain)/i,
    answer:
      "La chaîne de valeur de Porter décompose l'entreprise en activités principales (logistique entrante, production, logistique sortante, marketing/ventes, services) et activités de soutien (RH, R&D, achats, infrastructure). Objectif : identifier où se crée la valeur ajoutée.",
  },
  {
    match: /(planification|plan.{0,10}terme|gantt|jalons|roadmap)/i,
    answer:
      "Le module Planification distingue 3 horizons : court terme (< 1 an : budget, stocks, campagnes), moyen terme (1-3 ans : nouveaux produits, expansion), long terme (> 3 ans : diversification, vision). L'enjeu : aligner les 3 horizons pour éviter les contradictions.",
  },
  {
    match: /(organigramme|structure|fonctionn|division|matrici|hi[ée]rarch)/i,
    answer:
      "Cinq grandes structures organisationnelles : fonctionnelle (par métier), divisionnelle (par produit/géographie), matricielle (double rattachement), en réseau (externalisée), horizontale (peu de niveaux). Chacune a ses avantages selon la taille, la stratégie et la culture. Module Structure & Organigramme.",
  },
  {
    match: /(fonctions? [ée]conomiques?|production|distribution)/i,
    answer:
      "Les fonctions économiques de l'entreprise : Production (transformer inputs en outputs), Distribution (acheminer aux clients), Gestion financière (allouer les ressources). Le module utilise la chaîne de valeur de Porter et les 4P du marketing pour structurer l'analyse.",
  },
  {
    match: /(qcm|quiz|test|évaluation|examen|carte.?flip)/i,
    answer:
      "Les QCM tournent sur deux rythmes : un QCM hebdo léger (5 questions, mémorisation) et un QCM de fin de module (20 questions, validation). Si tu rates une question, je la repose à 3 jours, 7 jours puis 1 mois (répétition espacée). Les cartes flip servent à mémoriser le vocabulaire (SWOT, PESTEL, KPI, DMAIC...).",
  },
  {
    match: /(galère|comprend|compris|bloque|difficile|j.?arrive pas|coince)/i,
    answer:
      "Ok, on décompose. Dis-moi sur quel concept précis tu coinces (SWOT ? Balanced Scorecard ? KPI ?) et je te le re-explique avec un exemple concret. Je peux aussi te générer un mini-QCM ciblé pour vérifier ce qui est ancré.",
  },
  {
    match: /(module|programme|chapitre|cursus|catalogue|contenu)/i,
    answer:
      "Le Master Xeilos couvre 8 grands modules : 1) Stratégie d'entreprise, 2) Diagnostic de performance, 3) Fonctions économiques, 4) Parties prenantes & gouvernance, 5) Optimisation des processus, 6) Planification, 7) KPI & pilotage, 8) Structure & organigramme. Sur lequel veux-tu travailler ?",
  },
  {
    match: /(planning|temps|combien.*temps|durée|rythme|finir|terminer)/i,
    answer:
      "Le Master se boucle en moyenne en 4 à 6 mois à raison de 5-7h par semaine. Tu peux accélérer ou étaler. L'important c'est la régularité, pas la vitesse. Je peux te proposer un plan hebdo si tu me dis ton temps dispo.",
  },
  {
    match: /(rappel|notif|spaced|espac|r[ée]p[ée]tition)/i,
    answer:
      "Je gère tes rappels automatiquement : J+3 sur les questions ratées, J+7 sur celles ré-validées, J+30 pour ancrage long terme. Tu peux ajuster le rythme dans tes préférences. C'est le principe de la répétition espacée.",
  },
  {
    match: /(cpf|finan(c|ç)e|prix|tarif|co[uû]t|rncp|qualiopi|certif)/i,
    answer:
      "Le Master Xeilos est certifiant (RNCP, Qualiopi) et finançable CPF. Selon ton solde, le reste à charge peut être nul. Pour les détails tarifaires, un conseiller Xeilos te répond mieux que moi. Côté pédagogique, je suis là.",
  },
  {
    match: /(coach|prof|formateur|qui enseigne|équipe|humain)/i,
    answer:
      "Les formateurs du Master sont des praticiens du management et de la finance d'entreprise. Moi, je suis ton tuteur IA H24 pour les questions de méthode, les QCM et la révision. Pour les sessions live et le coaching humain, c'est l'équipe Xeilos via Discord.",
  },
  {
    match: /(merci|super|cool|parfait|ok|ça marche)/i,
    answer:
      "Avec plaisir 🙌 Dis-moi quand tu veux qu'on enchaîne sur le module suivant ou un nouveau QCM.",
  },
  {
    match: /(salut|bonjour|hello|hey|coucou|hi)/i,
    answer:
      "Salut 👋 Prêt·e à avancer sur le Master ? Tu peux me demander un QCM, une révision (SWOT, PESTEL, KPI...) ou de l'aide sur un concept précis.",
  },
];

const FALLBACKS = [
  "Je suis spécialisé sur les modules du Master Xeilos : stratégie, diagnostic de performance, parties prenantes, KPI, optimisation des processus. Reformule dans ce cadre et je te réponds direct.",
  "Précise un peu : tu veux travailler un module, refaire un QCM, ou t'organiser un planning de révision ?",
  "Bonne question, mais je n'ai pas l'info sous la main. Je peux te générer un QCM ou te résumer un module si ça t'aide.",
];

export function scriptedReply(userMessage: string, turnIndex: number): string {
  for (const r of COMMON) {
    if (r.match.test(userMessage)) {
      return r.answer;
    }
  }
  return FALLBACKS[turnIndex % FALLBACKS.length];
}
