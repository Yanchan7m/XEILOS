"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Exercice interactif : le carnet joue une séquence, se met en       */
/*  pause, pose une question, puis montre la suite et explique.        */
/*  Carnet fictif (Nasdaq futures, pas de 0,25).                       */
/* ------------------------------------------------------------------ */

type Cote = Record<string, number>;
type Image = {
  bid?: Cote;
  ask?: Cote;
  prix?: number;
  frappe?: { sens: "vente" | "achat"; q: number; au: number };
  note?: string;
};
type Situation = {
  titre: string;
  consigne: string;
  niveaux: number[];
  depart: { bid: Cote; ask: Cote; prix: number };
  lecture: Image[];
  question: string;
  choix: string[];
  bonne: number;
  suite: Image[];
  explication: string;
};

const N = [21451.25, 21451.0, 21450.75, 21450.5, 21450.25, 21450.0];
const k = (p: number) => p.toFixed(2);
const MAX = 320;

const SITUATIONS: Situation[] = [
  {
    titre: "Situation 1",
    consigne: "Des vendeurs frappent le prix 21 450,50 plusieurs fois. Regarde ce qui se passe chez les acheteurs.",
    niveaux: N,
    depart: {
      ask: { "21451.25": 70, "21451.00": 85, "21450.75": 90 },
      bid: { "21450.50": 60, "21450.25": 75, "21450.00": 55 },
      prix: 21450.5,
    },
    lecture: [
      { frappe: { sens: "vente", q: 45, au: 21450.5 }, bid: { "21450.50": 15 } },
      { bid: { "21450.50": 70 } },
      { frappe: { sens: "vente", q: 55, au: 21450.5 }, bid: { "21450.50": 15 }, ask: { "21450.75": 120 } },
      { bid: { "21450.50": 75 } },
      { frappe: { sens: "vente", q: 60, au: 21450.5 }, bid: { "21450.50": 15 }, ask: { "21450.75": 140 } },
      { bid: { "21450.50": 70 } },
    ],
    question: "Les vendeurs ont frappé trois fois. Que se passe-t-il ?",
    choix: [
      "Les vendeurs dominent : le prix va baisser",
      "Les acheteurs absorbent les ventes : le prix tient",
      "Rien de particulier, il ne se passe rien",
    ],
    bonne: 1,
    suite: [
      { ask: { "21450.75": 60 } },
      { frappe: { sens: "achat", q: 60, au: 21450.75 }, ask: { "21450.75": 0 }, prix: 21450.75 },
      { frappe: { sens: "achat", q: 85, au: 21451.0 }, ask: { "21451.00": 0 }, prix: 21451.0, note: "Les vendeurs s'épuisent : le prix monte" },
    ],
    explication:
      "À chaque vente, de nouveaux acheteurs remplaçaient ceux qui avaient été servis (la ligne verte se remplissait à nouveau) et le prix ne reculait pas : c'est une absorption. Une fois les vendeurs épuisés, quelques achats ont suffi à faire monter le prix. Ce n'était pas garanti : c'est pour ça qu'on attend que le prix confirme avant d'agir.",
  },
  {
    titre: "Situation 2",
    consigne: "Même début : des vendeurs frappent 21 450,50. Regarde bien la ligne verte cette fois.",
    niveaux: N,
    depart: {
      ask: { "21451.25": 70, "21451.00": 85, "21450.75": 90 },
      bid: { "21450.50": 60, "21450.25": 75, "21450.00": 55 },
      prix: 21450.5,
    },
    lecture: [
      { frappe: { sens: "vente", q: 45, au: 21450.5 }, bid: { "21450.50": 15 } },
      { bid: { "21450.50": 20 } },
      { frappe: { sens: "vente", q: 50, au: 21450.5 }, bid: { "21450.50": 0 }, prix: 21450.25, ask: { "21450.50": 30 } },
      { frappe: { sens: "vente", q: 60, au: 21450.25 }, bid: { "21450.25": 15 } },
    ],
    question: "Les acheteurs ne reviennent pas et le prix a déjà reculé d'un tick. Que se passe-t-il ?",
    choix: [
      "C'est une absorption : le prix va repartir",
      "Les vendeurs font reculer le prix : pas d'absorption",
      "Le carnet ne dit rien d'utile",
    ],
    bonne: 1,
    suite: [
      { frappe: { sens: "vente", q: 40, au: 21450.25 }, bid: { "21450.25": 0 }, prix: 21450.0, ask: { "21450.25": 35 } },
      { frappe: { sens: "vente", q: 30, au: 21450.0 }, bid: { "21450.00": 25 }, note: "Personne n'encaisse : le prix descend" },
    ],
    explication:
      "Ici, la ligne verte ne se remplissait plus : personne ne remplaçait les acheteurs servis. Chaque vente faisait reculer le prix d'un tick. Beaucoup de vendeurs ET un prix qui recule : cette fois, ce sont bien eux qui gagnent.",
  },
  {
    titre: "Situation 3",
    consigne: "Un énorme bloc de 300 vendeurs apparaît à 21 451,00, juste au-dessus du prix.",
    niveaux: N,
    depart: {
      ask: { "21451.25": 70, "21451.00": 85, "21450.75": 60 },
      bid: { "21450.50": 70, "21450.25": 75, "21450.00": 55 },
      prix: 21450.5,
    },
    lecture: [
      { ask: { "21451.00": 300 } },
      { frappe: { sens: "achat", q: 60, au: 21450.75 }, ask: { "21450.75": 0 }, prix: 21450.75, bid: { "21450.50": 80 } },
    ],
    question: "Le prix s'approche de ce mur de 300 vendeurs. Va-t-il forcément bloquer la hausse ?",
    choix: [
      "Oui, 300 vendeurs, c'est un mur infranchissable",
      "Pas forcément : un ordre affiché peut être retiré à tout moment",
      "Oui, il faut vendre tout de suite",
    ],
    bonne: 1,
    suite: [
      { ask: { "21451.00": 20 }, note: "Le mur a été retiré" },
      { frappe: { sens: "achat", q: 20, au: 21451.0 }, ask: { "21451.00": 0 }, prix: 21451.0 },
      { frappe: { sens: "achat", q: 70, au: 21451.25 }, ask: { "21451.25": 0 }, prix: 21451.25 },
    ],
    explication:
      "Un gros ordre affiché n'est qu'une intention : il peut être annulé à tout moment, parfois juste pour impressionner. Ce qui compte, c'est ce qui s'échange vraiment et la réaction du prix, pas ce qui est affiché.",
  },
];

type Etat = { bid: Cote; ask: Cote; prix: number };

const appliquer = (e: Etat, im: Image): Etat => ({
  bid: { ...e.bid, ...im.bid },
  ask: { ...e.ask, ...im.ask },
  prix: im.prix ?? e.prix,
});

const fr = (p: number) => p.toLocaleString("fr-FR", { minimumFractionDigits: 2 });

function Carnet({ s, etat, image }: { s: Situation; etat: Etat; image?: Image }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-3 sm:p-4" aria-label="Carnet d'ordres">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
        <span className="text-emerald-400">Acheteurs</span>
        <span className="w-[92px] text-center text-white/45 sm:w-[110px]">Prix</span>
        <span className="text-right text-rose-400">Vendeurs</span>
      </div>
      <div className="space-y-1.5">
        {s.niveaux.map((p) => {
          const b = etat.bid[k(p)] ?? 0;
          const a = etat.ask[k(p)] ?? 0;
          const ici = etat.prix === p;
          const frappeIci = image?.frappe && image.frappe.au === p ? image.frappe : undefined;
          return (
            <div key={p} className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="relative flex h-9 items-center justify-end overflow-hidden rounded-md bg-white/[0.03]">
                <div
                  className="absolute inset-y-1 right-0 rounded-md bg-emerald-400/80 transition-all duration-300"
                  style={{ width: `${(b / MAX) * 100}%` }}
                />
                <span className="absolute left-2 text-[12px] tabular-nums text-white/80">{b || ""}</span>
                {frappeIci?.sens === "vente" && (
                  <span className="relative mr-2 animate-pulse rounded-full border border-rose-400 bg-[#0b0b0d] px-2 py-0.5 text-[11px] font-semibold text-rose-300">
                    ▼ vend {frappeIci.q}
                  </span>
                )}
              </div>
              <div
                className={`flex h-9 w-[92px] items-center justify-center rounded-md text-[12px] tabular-nums transition sm:w-[110px] sm:text-[13px] ${
                  ici ? "bg-white font-semibold text-black" : "text-white/70"
                }`}
              >
                {fr(p)}
              </div>
              <div className="relative flex h-9 items-center overflow-hidden rounded-md bg-white/[0.03]">
                <div
                  className="absolute inset-y-1 left-0 rounded-md bg-rose-400/80 transition-all duration-300"
                  style={{ width: `${(a / MAX) * 100}%` }}
                />
                <span className="absolute right-2 text-[12px] tabular-nums text-white/80">{a || ""}</span>
                {frappeIci?.sens === "achat" && (
                  <span className="relative ml-2 animate-pulse rounded-full border border-emerald-400 bg-[#0b0b0d] px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                    ▲ achète {frappeIci.q}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 min-h-5 text-center text-[13px] font-medium text-[var(--accent)]" aria-live="polite">
        {image?.note ?? ""}
      </div>
    </div>
  );
}

type Phase = "pret" | "lecture" | "question" | "suite";

export default function ExerciceAbsorption() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("pret");
  const [pas, setPas] = useState(0);
  const [reponse, setReponse] = useState<number | null>(null);
  const [score, setScore] = useState<boolean[]>([]);

  const s = SITUATIONS[i];
  const film = phase === "suite" ? [...s.lecture, ...s.suite] : s.lecture;
  const vus = phase === "pret" ? 0 : phase === "question" ? s.lecture.length : pas;
  const etat = film.slice(0, vus).reduce(appliquer, s.depart);
  const image = vus > 0 ? film[vus - 1] : undefined;

  // Le carnet avance d'une image toutes les 1,1 s pendant la lecture et la suite.
  useEffect(() => {
    if (phase !== "lecture" && phase !== "suite") return;
    const fin = phase === "lecture" ? s.lecture.length : s.lecture.length + s.suite.length;
    if (pas >= fin) {
      if (phase === "lecture") setPhase("question");
      return;
    }
    const t = setTimeout(() => setPas((x) => x + 1), 1100);
    return () => clearTimeout(t);
  }, [phase, pas, s]);

  const lancer = () => {
    setPas(0);
    setReponse(null);
    setPhase("lecture");
  };

  const repondre = (n: number) => {
    setReponse(n);
    setScore((sc) => [...sc.slice(0, i), n === s.bonne]);
    setPas(s.lecture.length);
    setPhase("suite");
  };

  const suivante = () => {
    setI((x) => x + 1);
    setPhase("pret");
    setPas(0);
    setReponse(null);
  };

  const termine = i === SITUATIONS.length - 1 && phase === "suite" && pas >= s.lecture.length + s.suite.length;
  const bons = score.filter(Boolean).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      <Carnet s={s} etat={etat} image={image} />

      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-white/55">
          {s.titre} sur {SITUATIONS.length}
          <span className="ml-auto flex gap-1" aria-hidden>
            {SITUATIONS.map((_, n) => (
              <span
                key={n}
                className={`h-1.5 w-6 rounded-full ${
                  score[n] === undefined ? (n === i ? "bg-white/50" : "bg-white/15") : score[n] ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
            ))}
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-white/85">{s.consigne}</p>

        {phase === "pret" && (
          <button
            type="button"
            onClick={lancer}
            className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-[14px] font-medium text-black hover:bg-white/90"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
            Lancer le carnet
          </button>
        )}

        {phase === "lecture" && <p className="mt-5 text-[13px] text-white/50">Observe le carnet…</p>}

        {(phase === "question" || phase === "suite") && (
          <fieldset className="mt-5" disabled={phase === "suite"}>
            <legend className="text-[15px] text-white">{s.question}</legend>
            <div className="mt-3 space-y-2">
              {s.choix.map((c, n) => {
                const choisi = reponse === n;
                const etatCl =
                  phase === "suite"
                    ? n === s.bonne
                      ? "border-emerald-400/70 bg-emerald-400/10 text-white"
                      : choisi
                        ? "border-rose-400/70 bg-rose-400/10 text-white/80"
                        : "border-white/10 text-white/40"
                    : "border-white/15 text-white/85 hover:border-white/40 hover:bg-white/[0.04]";
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => repondre(n)}
                    className={`flex min-h-11 w-full items-center rounded-xl border px-4 py-2 text-left text-[14px] transition ${etatCl}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {phase === "suite" && (
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className={`text-[13px] font-semibold ${reponse === s.bonne ? "text-emerald-400" : "text-rose-400"}`}>
              {reponse === s.bonne ? "Bien vu." : "Pas tout à fait."} Regarde la suite du carnet.
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-white/65">{s.explication}</p>
            {i < SITUATIONS.length - 1 ? (
              <button
                type="button"
                onClick={suivante}
                className="mt-4 inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 text-[13px] text-white hover:border-white/50"
              >
                Situation suivante →
              </button>
            ) : (
              termine && (
                <div className="mt-4 text-[14px] text-white">
                  Score : {bons} / {SITUATIONS.length}.{" "}
                  <Link href="/dashboard/tutrice?q=Explique-moi l'absorption dans le carnet d'ordres" className="underline underline-offset-4">
                    Une question ? Demande à Xeilosia
                  </Link>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
