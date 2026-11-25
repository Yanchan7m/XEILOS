"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProchainCall } from "@/components/dashboard/Blocs";

/* ------------------------------------------------------------------ */
/*  Données : fil d'exemple (pseudos inventés), ajout local seulement   */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["Questions débutants", "Analyse du jour", "Psychologie", "Prop firms"] as const;
type Categorie = (typeof CATEGORIES)[number];

const REACTIONS = [
  { id: "utile", emoji: "👍", label: "Utile" },
  { id: "merci", emoji: "🙏", label: "Merci" },
  { id: "idee", emoji: "💡", label: "Bonne idée" },
] as const;
type ReactionId = (typeof REACTIONS)[number]["id"];

type Reponse = { id: string; auteur: string; quand: string; texte: string; exemple: boolean };
type Discussion = {
  id: string;
  categorie: Categorie;
  auteur: string;
  quand: string;
  titre: string;
  texte: string;
  exemple: boolean;
  reactions: Record<ReactionId, number>;
  miennes: ReactionId[];
  reponses: Reponse[];
};

const r = (utile: number, merci: number, idee: number) => ({ utile, merci, idee });

const EXEMPLES: Discussion[] = [
  {
    id: "ex-1",
    categorie: "Questions débutants",
    auteur: "PetitPas",
    quand: "il y a 2 h",
    titre: "Mon stop loss, je le place où au début ?",
    texte: "Je mets toujours 10 pips « parce que ça fait propre », mais je me fais sortir tout le temps. Vous le placez comment ?",
    exemple: true,
    reactions: r(7, 2, 1),
    miennes: [],
    reponses: [
      {
        id: "ex-1-a",
        auteur: "Zen_Trader",
        quand: "il y a 1 h",
        texte: "Je le place là où mon idée devient fausse (sous la zone qui a fait rebondir le prix, par exemple), puis je calcule ma taille de position pour que ce stop ne me coûte que 1 R. Pas l'inverse.",
        exemple: true,
      },
      {
        id: "ex-1-b",
        auteur: "Carnet_Ouvert",
        quand: "il y a 45 min",
        texte: "Pareil. Le Bloc 2 de la formation explique bien le placement selon la structure.",
        exemple: true,
      },
    ],
  },
  {
    id: "ex-2",
    categorie: "Analyse du jour",
    auteur: "Carnet_Ouvert",
    quand: "il y a 3 h",
    titre: "Nasdaq ce matin : j'ai choisi de ne pas trader",
    texte: "Range serré avant les chiffres de l'emploi, carnet d'ordres très fin, spreads qui s'écartent. J'ai noté mes niveaux et j'ai attendu. Qu'est-ce que vous auriez regardé de plus ?",
    exemple: true,
    reactions: r(12, 3, 5),
    miennes: [],
    reponses: [
      {
        id: "ex-2-a",
        auteur: "Apprenti_NQ",
        quand: "il y a 2 h",
        texte: "Bonne lecture du contexte. J'aurais aussi regardé si le haut du range de la veille avait été testé.",
        exemple: true,
      },
    ],
  },
  {
    id: "ex-3",
    categorie: "Psychologie",
    auteur: "Lune_Rouge",
    quand: "hier",
    titre: "Trois pertes d'affilée et l'envie de « me refaire »",
    texte: "Je respecte mon plan pendant une heure, puis après la troisième perte j'ai envie de doubler la taille. Comment vous gérez ce moment ?",
    exemple: true,
    reactions: r(9, 6, 2),
    miennes: [],
    reponses: [
      {
        id: "ex-3-a",
        auteur: "Zen_Trader",
        quand: "hier",
        texte: "Règle écrite : après 2 pertes, je ferme la plateforme et je remplis mon journal. Ça ne règle pas tout, mais ça casse l'élan.",
        exemple: true,
      },
      {
        id: "ex-3-b",
        auteur: "PetitPas",
        quand: "hier",
        texte: "Merci de le partager, je pensais être le seul.",
        exemple: true,
      },
    ],
  },
  {
    id: "ex-4",
    categorie: "Prop firms",
    auteur: "Apprenti_NQ",
    quand: "il y a 2 j",
    titre: "Perte journalière max : sur le solde ou sur l'equity ?",
    texte: "Dans les règles de mon challenge ce n'est pas clair pour moi. Elle se calcule sur le solde de début de journée, ou en direct avec les positions ouvertes ?",
    exemple: true,
    reactions: r(5, 1, 0),
    miennes: [],
    reponses: [
      {
        id: "ex-4-a",
        auteur: "Bougie_Verte",
        quand: "il y a 2 j",
        texte: "Ça change d'une prop firm à l'autre. Le plus sûr : relire leurs règles écrites et poser la question à leur support avant de trader.",
        exemple: true,
      },
    ],
  },
  {
    id: "ex-5",
    categorie: "Questions débutants",
    auteur: "Bougie_Verte",
    quand: "il y a 3 j",
    titre: "Pip, tick, point... c'est pareil ?",
    texte: "Je mélange tout entre le forex et les indices. Quelqu'un a une explication simple ?",
    exemple: true,
    reactions: r(4, 2, 0),
    miennes: [],
    reponses: [
      {
        id: "ex-5-a",
        auteur: "Lune_Rouge",
        quand: "il y a 3 j",
        texte: "Le pip, c'est pour les devises ; le tick, c'est le plus petit mouvement d'un contrat à terme. Le lexique de la page Formation les explique bien.",
        exemple: true,
      },
    ],
  },
];

const CLE = "xeilos-communaute-v1";

/** Ce que les règles interdisent et qu'on peut repérer simplement : liens et parrainage. */
const INTERDIT = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|fr|io|net)\b|parrain|code promo|affili)/i;

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

const carte = "rounded-2xl border border-white/[0.08] bg-white/[0.02]";

export default function Communaute() {
  const [fil, setFil] = useState<Discussion[]>(EXEMPLES);
  const [filtre, setFiltre] = useState<Categorie | "Tout">("Tout");

  // Restaure les messages ajoutés par l'élève (navigateur uniquement).
  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE);
      if (brut) {
        const sauve = JSON.parse(brut) as Discussion[];
        if (Array.isArray(sauve) && sauve.length > 0) setFil(sauve);
      }
    } catch {
      /* stockage indisponible : on garde le fil d'exemple */
    }
  }, []);

  const maj = (f: (d: Discussion[]) => Discussion[]) => {
    setFil((avant) => {
      const apres = f(avant);
      try {
        localStorage.setItem(CLE, JSON.stringify(apres));
      } catch {
        /* rien : l'ajout reste local à la page */
      }
      return apres;
    });
  };

  const visibles = useMemo(() => (filtre === "Tout" ? fil : fil.filter((d) => d.categorie === filtre)), [fil, filtre]);

  const publier = (categorie: Categorie, titre: string, texte: string) =>
    maj((f) => [
      {
        id: `moi-${Date.now()}`,
        categorie,
        auteur: "Toi",
        quand: "à l'instant",
        titre,
        texte,
        exemple: false,
        reactions: r(0, 0, 0),
        miennes: [],
        reponses: [],
      },
      ...f,
    ]);

  const reagir = (id: string, rid: ReactionId) =>
    maj((f) =>
      f.map((d) => {
        if (d.id !== id) return d;
        const deja = d.miennes.includes(rid);
        return {
          ...d,
          miennes: deja ? d.miennes.filter((x) => x !== rid) : [...d.miennes, rid],
          reactions: { ...d.reactions, [rid]: d.reactions[rid] + (deja ? -1 : 1) },
        };
      }),
    );

  const repondre = (id: string, texte: string) =>
    maj((f) =>
      f.map((d) =>
        d.id === id
          ? { ...d, reponses: [...d.reponses, { id: `moi-${Date.now()}`, auteur: "Toi", quand: "à l'instant", texte, exemple: false }] }
          : d,
      ),
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      {/* Colonne de droite (en premier sur mobile : les règles doivent se voir) */}
      <aside className="space-y-4 lg:order-2 lg:sticky lg:top-8 lg:self-start">
        <Regles />
        <div className={`${carte} p-5`}>
          <ProchainCall />
          <button
            type="button"
            disabled
            className="mt-4 min-h-10 w-full cursor-not-allowed rounded-full border border-white/10 px-4 text-[13px] text-white/40"
          >
            Rejoindre le call · Bientôt
          </button>
          <p className="mt-2 text-[12px] leading-relaxed text-white/45">Le lien de connexion apparaîtra ici le jour du call.</p>
        </div>
      </aside>

      <div className="min-w-0 lg:order-1">
        <Onglets filtre={filtre} setFiltre={setFiltre} fil={fil} />
        <div className="mt-5">
          <Composer publier={publier} categorieParDefaut={filtre === "Tout" ? "Questions débutants" : filtre} />
        </div>

        <p className="mt-6 text-[12px] text-white/45">
          Les discussions marquées « Exemple » sont fictives et servent à montrer l&apos;esprit de l&apos;espace.
        </p>

        <ul className="mt-3 space-y-3">
          {visibles.map((d) => (
            <DiscussionCarte key={d.id} d={d} reagir={reagir} repondre={repondre} />
          ))}
          {visibles.length === 0 && (
            <li className={`${carte} p-6 text-[14px] text-white/55`}>Pas encore de discussion ici. Lance la première !</li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Regles() {
  const regles = [
    ["Pas de signaux", "On partage un raisonnement, jamais un « achète ici, vends là » à copier."],
    ["Pas de promesses de gains", "Personne ne peut garantir un résultat, ni ici ni ailleurs."],
    ["Pas de captures de P&L pour frimer", "Montre ton analyse et tes erreurs, pas ton solde."],
    ["Pas de parrainage ni de lien d'affiliation", "Aucun code promo, aucun lien vers un broker ou une prop firm."],
    ["Bienveillance", "Chacun a débuté un jour. On corrige l'idée, pas la personne."],
  ];
  return (
    <section className="rounded-2xl border border-[var(--accent)]/35 bg-[var(--accent)]/[0.05] p-5">
      <h2 className="text-[12px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Règles de la communauté</h2>
      <ul className="mt-4 space-y-3">
        {regles.map(([t, d]) => (
          <li key={t} className="text-[13px] leading-relaxed">
            <span className="text-white">{t}.</span> <span className="text-white/55">{d}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-white/[0.08] pt-4 text-[12px] leading-relaxed text-white/60">
        Rappel : selon l&apos;AMF, la majorité des particuliers qui tradent des produits à effet de levier perdent de l&apos;argent.
        Ce qui est partagé ici n&apos;est pas un conseil en investissement.
      </p>
    </section>
  );
}

function Onglets({
  filtre,
  setFiltre,
  fil,
}: {
  filtre: Categorie | "Tout";
  setFiltre: (c: Categorie | "Tout") => void;
  fil: Discussion[];
}) {
  const options: (Categorie | "Tout")[] = ["Tout", ...CATEGORIES];
  return (
    <div role="tablist" aria-label="Catégories" className="flex flex-wrap gap-2">
      {options.map((c) => {
        const n = c === "Tout" ? fil.length : fil.filter((d) => d.categorie === c).length;
        const actif = filtre === c;
        return (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={actif}
            onClick={() => setFiltre(c)}
            className={`min-h-10 rounded-full border px-4 text-[13px] transition ${
              actif ? "border-white/60 bg-white text-black" : "border-white/15 text-white/70 hover:border-white/35 hover:text-white"
            }`}
          >
            {c} <span className={actif ? "text-black/50" : "text-white/40"}>{n}</span>
          </button>
        );
      })}
    </div>
  );
}

function Composer({
  publier,
  categorieParDefaut,
}: {
  publier: (c: Categorie, titre: string, texte: string) => void;
  categorieParDefaut: Categorie;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [categorie, setCategorie] = useState<Categorie>(categorieParDefaut);
  const [titre, setTitre] = useState("");
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => {
          setCategorie(categorieParDefaut);
          setOuvert(true);
        }}
        className={`${carte} flex min-h-12 w-full items-center gap-3 px-5 py-3 text-left text-[14px] text-white/50 transition hover:border-white/20 hover:text-white/70`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70">+</span>
        Pose une question ou partage ton analyse…
      </button>
    );
  }

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault();
    const t = titre.trim();
    const m = texte.trim();
    if (t.length < 5) return setErreur("Donne un titre d'au moins 5 caractères.");
    if (m.length < 10) return setErreur("Ton message est un peu court : explique ton contexte en une ou deux phrases.");
    if (INTERDIT.test(`${t} ${m}`)) return setErreur("Les liens, codes promo et parrainages ne sont pas autorisés (voir les règles).");
    publier(categorie, t, m);
    setTitre("");
    setTexte("");
    setErreur(null);
    setOuvert(false);
  };

  return (
    <form onSubmit={envoyer} className={`${carte} p-5`}>
      <div className="text-[12px] font-medium uppercase tracking-[0.3em] text-white/80">Nouveau message</div>
      <fieldset className="mt-4">
        <legend className="text-[12px] text-white/55">Catégorie</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={categorie === c}
              onClick={() => setCategorie(c)}
              className={`min-h-10 rounded-full border px-3.5 text-[12px] transition ${
                categorie === c ? "border-[var(--accent)] bg-[var(--accent)]/15 text-white" : "border-white/15 text-white/65 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="mt-4 block">
        <span className="text-[12px] text-white/55">Titre</span>
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          maxLength={120}
          placeholder="Ex. : Comment tu choisis ta taille de position ?"
          className="mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 text-[14px] text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
      </label>
      <label className="mt-3 block">
        <span className="text-[12px] text-white/55">Message</span>
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Explique ton raisonnement. Pas de signal, pas de lien, pas de capture de P&L."
          className="mt-1.5 w-full resize-y rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-[14px] leading-relaxed text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
      </label>
      {erreur && (
        <p role="alert" className="mt-2 text-[13px] text-[var(--accent)]">
          {erreur}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOuvert(false);
            setErreur(null);
          }}
          className="min-h-10 rounded-full px-4 text-[13px] text-white/60 hover:text-white"
        >
          Annuler
        </button>
        <button type="submit" className="min-h-10 rounded-full bg-white px-5 text-[13px] font-medium text-black hover:bg-white/90">
          Publier
        </button>
      </div>
    </form>
  );
}

function Auteur({ nom, quand, exemple }: { nom: string; quand: string; exemple: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/50">
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[11px] font-medium text-white/75"
      >
        {nom.slice(0, 1).toUpperCase()}
      </span>
      <span className="text-white/80">{nom}</span>
      <span>· {quand}</span>
      {exemple && (
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
          Exemple
        </span>
      )}
    </div>
  );
}

function DiscussionCarte({
  d,
  reagir,
  repondre,
}: {
  d: Discussion;
  reagir: (id: string, r: ReactionId) => void;
  repondre: (id: string, texte: string) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [brouillon, setBrouillon] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault();
    const t = brouillon.trim();
    if (t.length < 2) return setErreur("Écris ta réponse avant d'envoyer.");
    if (INTERDIT.test(t)) return setErreur("Les liens, codes promo et parrainages ne sont pas autorisés.");
    repondre(d.id, t);
    setBrouillon("");
    setErreur(null);
  };

  return (
    <li className={`${carte} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Auteur nom={d.auteur} quand={d.quand} exemple={d.exemple} />
        <span className="text-[11px] uppercase tracking-[0.15em] text-[var(--accent)]">{d.categorie}</span>
      </div>
      <h3 className="mt-3 break-words text-[17px] leading-snug text-white">{d.titre}</h3>
      <p className="mt-1.5 whitespace-pre-line break-words text-[14px] leading-relaxed text-white/60">{d.texte}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {REACTIONS.map((x) => {
          const actif = d.miennes.includes(x.id);
          return (
            <button
              key={x.id}
              type="button"
              aria-pressed={actif}
              aria-label={`${x.label} (${d.reactions[x.id]})`}
              onClick={() => reagir(d.id, x.id)}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-[12px] tabular-nums transition ${
                actif ? "border-[var(--accent)]/60 bg-[var(--accent)]/15 text-white" : "border-white/12 text-white/65 hover:border-white/30 hover:text-white"
              }`}
            >
              <span aria-hidden>{x.emoji}</span>
              <span className="hidden sm:inline">{x.label}</span>
              {d.reactions[x.id]}
            </button>
          );
        })}
        <button
          type="button"
          aria-expanded={ouvert}
          onClick={() => setOuvert(!ouvert)}
          className="ml-auto inline-flex min-h-10 items-center rounded-full px-3 text-[13px] text-white/75 hover:text-white"
        >
          {ouvert ? "Masquer" : "Répondre"} · {d.reponses.length}
        </button>
      </div>

      {ouvert && (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          {d.reponses.length > 0 && (
            <ul className="space-y-4">
              {d.reponses.map((rep) => (
                <li key={rep.id} className="border-l border-white/10 pl-4">
                  <Auteur nom={rep.auteur} quand={rep.quand} exemple={rep.exemple} />
                  <p className="mt-1.5 whitespace-pre-line break-words text-[14px] leading-relaxed text-white/65">{rep.texte}</p>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={envoyer} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label htmlFor={`rep-${d.id}`} className="sr-only">
              Ta réponse
            </label>
            <input
              id={`rep-${d.id}`}
              value={brouillon}
              onChange={(e) => setBrouillon(e.target.value)}
              maxLength={1000}
              placeholder="Ta réponse, avec bienveillance"
              className="h-11 min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.03] px-4 text-[14px] text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
            />
            <button type="submit" className="min-h-11 rounded-full bg-white px-5 text-[13px] font-medium text-black hover:bg-white/90">
              Envoyer
            </button>
          </form>
          {erreur && (
            <p role="alert" className="mt-2 text-[13px] text-[var(--accent)]">
              {erreur}
            </p>
          )}
          {d.categorie === "Questions débutants" && (
            <p className="mt-3 text-[12px] text-white/45">
              Un mot que tu ne comprends pas ?{" "}
              <Link href="/dashboard/lexique" className="text-white/70 underline underline-offset-2 hover:text-white">
                Ouvre le lexique
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </li>
  );
}
