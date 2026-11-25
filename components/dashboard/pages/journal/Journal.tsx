"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Journal de trading : liste, filtres, stats calculées, ajout        */
/* ------------------------------------------------------------------ */

type Sens = "achat" | "vente";

type Trade = {
  id: string;
  date: string; // AAAA-MM-JJ
  actif: string;
  sens: Sens;
  pnl: number; // en $
  r: number; // résultat / risque initial
  plan: boolean;
  emotion: string;
  note: string;
  exemple?: boolean;
};

const CLE = "xeilos-journal-v1";

const EMOTIONS = ["Calme", "Confiant", "Hésitant", "Stressé", "Impatient", "Frustré", "Euphorique", "Peur de rater (FOMO)"];
const ACTIFS = ["NQ", "MNQ", "ES", "MES", "XAUUSD", "EURUSD"];

/** Données d'exemple, toutes marquées « Exemple » dans la liste. */
const EXEMPLES: Trade[] = [
  { id: "ex1", date: "2026-11-13", actif: "MNQ", sens: "achat", pnl: -40, r: -1, plan: true, emotion: "Calme", note: "Setup valide, stop touché. Rien à changer : ça fait partie du jeu.", exemple: true },
  { id: "ex2", date: "2026-11-13", actif: "MNQ", sens: "vente", pnl: -96, r: -2.4, plan: false, emotion: "Frustré", note: "Re-rentré juste après la perte précédente, stop élargi en cours de trade. Revenge trading.", exemple: true },
  { id: "ex3", date: "2026-11-12", actif: "NQ", sens: "vente", pnl: 150, r: 1.5, plan: true, emotion: "Confiant", note: "Attendu la confirmation sur l'unité de temps supérieure avant d'entrer.", exemple: true },
  { id: "ex4", date: "2026-11-12", actif: "XAUUSD", sens: "achat", pnl: 35, r: 0.4, plan: false, emotion: "Stressé", note: "Coupé bien avant l'objectif par peur. Le prix y est allé ensuite.", exemple: true },
  { id: "ex5", date: "2026-11-10", actif: "MNQ", sens: "achat", pnl: -38, r: -1, plan: true, emotion: "Hésitant", note: "Entrée correcte, marché sans direction. À éviter avant les annonces.", exemple: true },
  { id: "ex6", date: "2026-11-10", actif: "ES", sens: "vente", pnl: 0, r: 0, plan: true, emotion: "Calme", note: "Stop remonté au prix d'entrée (break-even) comme prévu, sorti à zéro.", exemple: true },
  { id: "ex7", date: "2026-11-07", actif: "MNQ", sens: "achat", pnl: 80, r: 2, plan: true, emotion: "Calme", note: "Plan suivi du début à la fin.", exemple: true },
  { id: "ex8", date: "2026-11-06", actif: "NQ", sens: "achat", pnl: -210, r: -2.1, plan: false, emotion: "Peur de rater (FOMO)", note: "Entré sur une bougie déjà partie, sans stop défini à l'avance.", exemple: true },
];

type Filtre = "tous" | "gagnants" | "perdants" | "horsPlan";
const FILTRES: { id: Filtre; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "gagnants", label: "Gagnants" },
  { id: "perdants", label: "Perdants" },
  { id: "horsPlan", label: "Plan non respecté" },
];

/* ---------- formats ---------- */

const usd = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} $`;
const rFmt = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} R`;
const couleur = (n: number) => (n > 0 ? "text-emerald-400" : n < 0 ? "text-[#f87171]" : "text-white/70");
const dateFr = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const nombre = (v: string) => Number(v.replace(",", ".").replace("−", "-"));

/* ---------- petits blocs ---------- */

function Terme({ children, def }: { children: ReactNode; def: string }) {
  return (
    <abbr title={def} aria-label={def} className="cursor-help no-underline decoration-white/30 decoration-dotted underline-offset-4 [text-decoration-line:underline]">
      {children}
    </abbr>
  );
}

function Carte({ titre, aide, children, className = "" }: { titre: ReactNode; aide?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 ${className}`}>
      <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/70">{titre}</div>
      {aide && <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">{aide}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const champ =
  "mt-1 h-11 w-full min-w-0 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-[14px] text-white outline-none focus:border-[var(--accent)]";

/* ---------- formulaire ---------- */

function FormulaireTrade({ onAjout }: { onAjout: (t: Trade) => void }) {
  const [date, setDate] = useState("");
  const [actif, setActif] = useState("MNQ");
  const [sens, setSens] = useState<Sens>("achat");
  const [pnl, setPnl] = useState("");
  const [r, setR] = useState("");
  const [plan, setPlan] = useState<"" | "oui" | "non">("");
  const [emotion, setEmotion] = useState(EMOTIONS[0]);
  const [note, setNote] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  const p = nombre(pnl), rr = nombre(r);
  const signesIncoherents = pnl !== "" && r !== "" && Number.isFinite(p) && Number.isFinite(rr) && Math.sign(p) !== Math.sign(rr);

  function envoyer(e: FormEvent) {
    e.preventDefault();
    const d = date || aujourdhui();
    if (!actif.trim()) return setErreur("Indique l'actif tradé.");
    if (pnl.trim() === "" || !Number.isFinite(p)) return setErreur("Indique le résultat en $ (négatif si perte, ex. −40).");
    if (r.trim() === "" || !Number.isFinite(rr)) return setErreur("Indique le résultat en R (ex. −1 si le stop a été touché).");
    if (!plan) return setErreur("Dis si tu as respecté ton plan : c'est la question la plus utile du journal.");
    onAjout({
      id: `t${Date.now()}`,
      date: d,
      actif: actif.trim().toUpperCase(),
      sens,
      pnl: Math.round(p * 100) / 100,
      r: Math.round(rr * 100) / 100,
      plan: plan === "oui",
      emotion,
      note: note.trim(),
    });
    setPnl("");
    setR("");
    setPlan("");
    setNote("");
    setErreur(null);
  }

  return (
    <form onSubmit={envoyer} noValidate className="grid grid-cols-2 gap-3 text-[12px] text-white/60 sm:grid-cols-4">
      <label className="col-span-1 block">
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${champ} [color-scheme:dark]`} />
      </label>
      <label className="col-span-1 block">
        Actif
        <input list="journal-actifs" value={actif} onChange={(e) => setActif(e.target.value)} className={champ} />
        <datalist id="journal-actifs">
          {ACTIFS.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </label>
      <div className="col-span-2 sm:col-span-2">
        Sens
        <div className="mt-1 grid grid-cols-2 gap-2" role="group" aria-label="Sens du trade">
          {(["achat", "vente"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={sens === v}
              onClick={() => setSens(v)}
              className={`h-11 rounded-xl border text-[13px] ${sens === v ? "border-white/40 bg-white/10 text-white" : "border-white/[0.12] text-white/55 hover:bg-white/[0.04]"}`}
            >
              {v === "achat" ? "Achat" : "Vente"}
            </button>
          ))}
        </div>
      </div>
      <label className="col-span-1 block">
        <Terme def="P&L (profit and loss) : ce que le trade t'a fait gagner ou perdre, en dollars. Négatif si perte.">Résultat</Terme> ($)
        <input inputMode="decimal" placeholder="ex. −40" value={pnl} onChange={(e) => setPnl(e.target.value)} className={`${champ} tabular-nums`} />
      </label>
      <label className="col-span-1 block">
        <Terme def="R : le résultat divisé par ce que tu risquais. Stop touché = −1 R ; gain de deux fois le risque = +2 R.">Résultat</Terme> (R)
        <input inputMode="decimal" placeholder="ex. −1" value={r} onChange={(e) => setR(e.target.value)} className={`${champ} tabular-nums`} />
      </label>
      <div className="col-span-2">
        Plan respecté ?
        <div className="mt-1 grid grid-cols-2 gap-2" role="group" aria-label="Plan respecté">
          {(["oui", "non"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={plan === v}
              onClick={() => setPlan(v)}
              className={`h-11 rounded-xl border text-[13px] ${plan === v ? "border-white/40 bg-white/10 text-white" : "border-white/[0.12] text-white/55 hover:bg-white/[0.04]"}`}
            >
              {v === "oui" ? "Oui" : "Non"}
            </button>
          ))}
        </div>
      </div>
      <label className="col-span-2 block">
        Émotion pendant le trade
        <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className={champ}>
          {EMOTIONS.map((em) => (
            <option key={em} className="bg-[#16161a]">
              {em}
            </option>
          ))}
        </select>
      </label>
      <label className="col-span-2 block">
        Note libre
        <input placeholder="Ce que tu as bien fait, ce que tu changerais…" value={note} onChange={(e) => setNote(e.target.value)} className={champ} maxLength={280} />
      </label>

      <div className="col-span-2 flex flex-col gap-2 sm:col-span-4 sm:flex-row sm:items-center">
        <button type="submit" className="h-11 rounded-xl bg-[var(--accent)] px-5 text-[14px] font-semibold text-white hover:brightness-110">
          Ajouter au journal
        </button>
        <p aria-live="polite" className="text-[12px]">
          {erreur ? (
            <span className="text-[#fca5a5]">{erreur}</span>
          ) : signesIncoherents ? (
            <span className="text-amber-300">Le résultat en $ et en R n&apos;ont pas le même signe : vérifie.</span>
          ) : (
            <span className="text-white/40">Sans date, le trade est daté d&apos;aujourd&apos;hui. Enregistré sur cet appareil uniquement.</span>
          )}
        </p>
      </div>
    </form>
  );
}

/* ---------- composant principal ---------- */

export default function Journal() {
  const [miens, setMiens] = useState<Trade[]>([]);
  const [charge, setCharge] = useState(false);
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [voirExemples, setVoirExemples] = useState(true);

  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE);
      if (brut) {
        const liste = JSON.parse(brut);
        if (Array.isArray(liste)) setMiens(liste as Trade[]);
      }
    } catch {
      /* stockage indisponible : journal en mémoire seulement */
    }
    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;
    try {
      localStorage.setItem(CLE, JSON.stringify(miens));
    } catch {
      /* rien */
    }
  }, [miens, charge]);

  const tous = useMemo(
    () => [...miens, ...(voirExemples ? EXEMPLES : [])].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [miens, voirExemples],
  );

  const affiches = useMemo(
    () =>
      tous.filter((t) =>
        filtre === "gagnants" ? t.pnl > 0 : filtre === "perdants" ? t.pnl < 0 : filtre === "horsPlan" ? !t.plan : true,
      ),
    [tous, filtre],
  );

  // Stats calculées sur la liste affichée (filtre compris)
  const n = affiches.length;
  const gagnants = affiches.filter((t) => t.pnl > 0).length;
  const total = affiches.reduce((s, t) => s + t.pnl, 0);
  const rMoyen = n ? affiches.reduce((s, t) => s + t.r, 0) / n : 0;
  const planOk = affiches.filter((t) => t.plan).length;
  const horsPlan = affiches.filter((t) => !t.plan);
  const rHorsPlan = horsPlan.reduce((s, t) => s + t.r, 0);

  const stats = [
    { l: "Trades", v: String(n), d: "Le nombre de trades dans la liste affichée.", c: "text-white" },
    { l: "Taux de réussite", v: n ? `${Math.round((gagnants / n) * 100)} %` : "—", d: "La part des trades gagnants. Seul, ce chiffre ne dit pas si tu gagnes de l'argent : regarde aussi le R moyen.", c: "text-white" },
    { l: "P&L total", v: n ? usd(total) : "—", d: "P&L (profit and loss) : la somme des gains et des pertes, en dollars.", c: couleur(total) },
    { l: "R moyen", v: n ? rFmt(rMoyen) : "—", d: "La moyenne des résultats en R. Au-dessus de 0, tes trades rapportent plus qu'ils ne coûtent, en moyenne.", c: couleur(rMoyen) },
    { l: "Plan respecté", v: n ? `${Math.round((planOk / n) * 100)} %` : "—", d: "La part des trades où tu as suivi ton plan (entrée, stop, objectif, taille).", c: "text-white" },
  ];

  return (
    <div className="space-y-5">
      {voirExemples && (
        <div role="note" className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] px-4 py-3 text-[13px] text-amber-100/80">
          <span className="font-semibold text-amber-300">Les trades marqués « Exemple » sont fictifs</span> : ils montrent comment remplir
          un journal. Ajoute les tiens avec le formulaire, ou masque les exemples.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((k) => (
          <div key={k.l} className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              <Terme def={k.d}>{k.l}</Terme>
            </div>
            <div className={`mt-2 truncate text-[20px] tabular-nums sm:text-[24px] ${k.c}`}>{k.v}</div>
          </div>
        ))}
      </div>
      {horsPlan.length > 0 && (
        <p className="text-[13px] leading-relaxed text-white/55">
          Dans cette liste, les {horsPlan.length} trade{horsPlan.length > 1 ? "s" : ""} hors plan pèse{horsPlan.length > 1 ? "nt" : ""}{" "}
          <span className={couleur(rHorsPlan)}>{rFmt(rHorsPlan)}</span> au total.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Liste */}
        <Carte titre="Tes trades">
          <div className="flex flex-wrap items-center gap-2">
            {FILTRES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltre(f.id)}
                aria-pressed={filtre === f.id}
                className={`h-10 rounded-full border px-4 text-[13px] ${
                  filtre === f.id ? "border-[var(--accent)]/60 bg-[var(--accent)]/15 text-white" : "border-white/[0.12] text-white/60 hover:bg-white/[0.04]"
                }`}
              >
                {f.label}
              </button>
            ))}
            <label className="ml-auto flex min-h-10 cursor-pointer items-center gap-2 text-[12px] text-white/55">
              <input type="checkbox" checked={voirExemples} onChange={(e) => setVoirExemples(e.target.checked)} className="h-5 w-5 accent-[#d92128]" />
              Afficher les exemples
            </label>
          </div>

          {affiches.length === 0 ? (
            <p className="mt-6 text-[13px] text-white/45">
              {tous.length === 0 ? "Ton journal est vide. Ajoute ton premier trade avec le formulaire." : "Aucun trade ne correspond à ce filtre."}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-white/[0.06]">
              {affiches.map((t) => (
                <li key={t.id} className="py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] tabular-nums">
                    <span className="text-white/50">{dateFr(t.date)}</span>
                    <span className="font-medium text-white">{t.actif}</span>
                    <span className={t.sens === "achat" ? "text-emerald-300" : "text-[#fca5a5]"}>{t.sens === "achat" ? "Achat" : "Vente"}</span>
                    {t.exemple && (
                      <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-300">
                        Exemple
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-3">
                      <span className={couleur(t.pnl)}>{usd(t.pnl)}</span>
                      <span className={`w-16 text-right ${couleur(t.r)}`}>{rFmt(t.r)}</span>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 ${
                        t.plan ? "border-white/15 text-white/60" : "border-[#f87171]/40 bg-[#f87171]/10 text-[#fca5a5]"
                      }`}
                    >
                      {t.plan ? "Plan respecté" : "Plan non respecté"}
                    </span>
                    <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-white/60">{t.emotion}</span>
                  </div>
                  {t.note && <p className="mt-2 text-[13px] leading-relaxed text-white/55">{t.note}</p>}
                  {!t.exemple && (
                    <button
                      type="button"
                      onClick={() => setMiens((m) => m.filter((x) => x.id !== t.id))}
                      className="mt-2 h-10 rounded-xl border border-white/[0.1] px-3 text-[12px] text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                      aria-label={`Supprimer le trade ${t.actif} du ${dateFr(t.date)}`}
                    >
                      Supprimer
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Carte>

        {/* Aide */}
        <Carte titre="Pourquoi tenir un journal">
          <ul className="space-y-3 text-[13px] leading-relaxed text-white/55">
            <li>
              <span className="text-white/85">Ta mémoire trie.</span>{" "}Tu retiens les beaux trades et tu oublies les erreurs. Le journal, lui,
              garde tout.
            </li>
            <li>
              <span className="text-white/85">Le plan compte plus que le résultat.</span>{" "}Un trade perdant qui respecte le plan est un bon
              trade. Un gagnant hors plan est une mauvaise habitude qui a eu de la chance.
            </li>
            <li>
              <span className="text-white/85">Les émotions laissent des traces.</span>{" "}Filtre « Plan non respecté » et regarde quelles
              émotions reviennent : c&apos;est souvent là que se cache ton prochain progrès.
            </li>
            <li>
              <span className="text-white/85">Parle en R.</span>{" "}Le R ramène chaque trade à ce que tu risquais : tu compares des trades de
              tailles différentes sans te raconter d&apos;histoires.
            </li>
          </ul>
        </Carte>
      </div>

      <Carte titre="Ajouter un trade" aide="Remplis-le juste après la clôture, quand tout est encore frais.">
        <FormulaireTrade onAjout={(t) => setMiens((m) => [t, ...m])} />
      </Carte>
    </div>
  );
}
