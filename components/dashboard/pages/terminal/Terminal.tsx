"use client";

import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { CHALLENGE, START_CAPITAL } from "@/lib/dashboard-demo";
import {
  CONTRATS,
  PAS,
  TICK_DEPART,
  bougiesAuTick,
  carnetAuTick,
  heureAuTick,
  prixAuTick,
  type Bougie,
  type Contrat,
} from "./simulation";

/* ------------------------------------------------------------------ */
/*  Terminal d'entraînement : argent fictif, marché NQ simulé          */
/* ------------------------------------------------------------------ */

const RISQUE_MAX_PCT = 1; // la règle de risque Xeilos
const PERTE_JOUR_MAX = (START_CAPITAL * CHALLENGE.perteJourMaxPct) / 100;
const CLE = "xeilos-terminal-v1";
const TICK_MS = 1000;

type Sens = "achat" | "vente";

type Position = {
  id: number;
  sens: Sens;
  contrat: Contrat;
  taille: number;
  entree: number;
  stop: number;
  objectif: number;
  risque: number; // en $, = 1 R
  heure: string;
};

type TradeClos = {
  id: number;
  sens: Sens;
  contrat: Contrat;
  taille: number;
  entree: number;
  sortie: number;
  pnl: number;
  r: number;
  motif: "stop" | "objectif" | "manuel";
  heure: string;
};

type Etat = { tick: number; positions: Position[]; historique: TradeClos[]; prochainId: number };

type Action =
  | { type: "tick" }
  | { type: "ouvrir"; position: Omit<Position, "id"> }
  | { type: "cloturer"; id: number }
  | { type: "charger"; etat: Etat }
  | { type: "reinitialiser" };

const INITIAL: Etat = { tick: TICK_DEPART, positions: [], historique: [], prochainId: 1 };

function cloture(p: Position, sortie: number, motif: TradeClos["motif"], tick: number): TradeClos {
  const points = p.sens === "achat" ? sortie - p.entree : p.entree - sortie;
  const pnl = points * CONTRATS[p.contrat].parPoint * p.taille;
  return {
    id: p.id,
    sens: p.sens,
    contrat: p.contrat,
    taille: p.taille,
    entree: p.entree,
    sortie,
    pnl,
    r: p.risque > 0 ? pnl / p.risque : 0,
    motif,
    heure: heureAuTick(tick),
  };
}

function reducteur(etat: Etat, action: Action): Etat {
  switch (action.type) {
    case "tick": {
      const tick = etat.tick + 1;
      const bid = prixAuTick(tick);
      const ask = bid + PAS;
      const restantes: Position[] = [];
      const closes: TradeClos[] = [];
      for (const p of etat.positions) {
        // On sort d'un achat au prix vendeur (bid), d'une vente au prix acheteur (ask).
        const prix = p.sens === "achat" ? bid : ask;
        const stopTouche = p.sens === "achat" ? prix <= p.stop : prix >= p.stop;
        const objectifTouche = p.sens === "achat" ? prix >= p.objectif : prix <= p.objectif;
        if (stopTouche) closes.push(cloture(p, p.stop, "stop", tick));
        else if (objectifTouche) closes.push(cloture(p, p.objectif, "objectif", tick));
        else restantes.push(p);
      }
      return { ...etat, tick, positions: restantes, historique: [...closes, ...etat.historique] };
    }
    case "ouvrir":
      return {
        ...etat,
        positions: [...etat.positions, { ...action.position, id: etat.prochainId }],
        prochainId: etat.prochainId + 1,
      };
    case "cloturer": {
      const p = etat.positions.find((x) => x.id === action.id);
      if (!p) return etat;
      const bid = prixAuTick(etat.tick);
      const sortie = p.sens === "achat" ? bid : bid + PAS;
      return {
        ...etat,
        positions: etat.positions.filter((x) => x.id !== action.id),
        historique: [cloture(p, sortie, "manuel", etat.tick), ...etat.historique],
      };
    }
    case "charger":
      return action.etat;
    case "reinitialiser":
      return INITIAL;
  }
}

/* ---------- formats ---------- */

const usd = (n: number, signe = false) =>
  `${signe ? (n > 0 ? "+" : n < 0 ? "−" : "") : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} $`;
const pts = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
const rFmt = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} R`;
const couleur = (n: number) => (n > 0 ? "text-emerald-400" : n < 0 ? "text-[#f87171]" : "text-white/70");

/* ---------- petits blocs ---------- */

/** Terme technique souligné en pointillés, expliqué au survol (title) et au toucher (aria-label). */
function Terme({ children, def }: { children: ReactNode; def: string }) {
  return (
    <abbr title={def} aria-label={def} className="cursor-help no-underline decoration-white/30 decoration-dotted underline-offset-4 [text-decoration-line:underline]">
      {children}
    </abbr>
  );
}

/* ---------- graphique ---------- */

function Graphique({ bougies: toutes, positions }: { bougies: Bougie[]; positions: Position[] }) {
  // Dessiné à la taille réelle du conteneur (largeur ET hauteur) : sur ordinateur,
  // le graphique remplit toute la colonne de gauche ; sur mobile, 260 px de haut.
  const ref = useRef<HTMLDivElement>(null);
  const [taille, setTaille] = useState({ w: 640, h: 300 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setTaille({ w: Math.max(260, Math.round(e.contentRect.width)), h: Math.max(200, Math.round(e.contentRect.height)) }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = taille;
  const etroit = w < 480;
  const bougies = etroit ? toutes.slice(-28) : toutes;
  const pad = { l: 8, r: 62, t: 12, b: 12 };
  const niveaux = positions.flatMap((p) => [p.stop, p.objectif, p.entree]);
  const haut = Math.max(...bougies.map((b) => b.h), ...niveaux);
  const bas = Math.min(...bougies.map((b) => b.l), ...niveaux);
  const marge = Math.max(4, (haut - bas) * 0.08);
  const yMax = haut + marge, yMin = bas - marge;
  const innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
  const slot = innerW / bougies.length;
  const corps = Math.max(2, slot * 0.62);
  const x = (i: number) => pad.l + slot * (i + 0.5);
  const y = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  const dernier = bougies[bougies.length - 1];
  const graduations = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * (i + 0.5)) / 5);

  const ligne = (v: number, c: string, label: string, key: string) => (
    <g key={key}>
      <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke={c} strokeOpacity="0.7" strokeDasharray="5 4" />
      <text x={pad.l + 4} y={y(v) - 4} fontSize="11.5" fontWeight="600" fill={c}>
        {label}
      </text>
    </g>
  );

  return (
    <div ref={ref} className="relative h-[260px] w-full min-w-0 lg:h-full">
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="absolute inset-0 block max-w-full" role="img" aria-label={`Graphique en bougies du Nasdaq simulé, dernier prix ${pts(dernier.c)}`}>
      {graduations.map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="rgba(255,255,255,0.09)" />
          <text x={w - pad.r + 6} y={y(g) + 4} fontSize="11.5" fill="rgba(255,255,255,0.7)">
            {pts(Math.round(g * 4) / 4)}
          </text>
        </g>
      ))}
      {bougies.map((b, i) => {
        const hausse = b.c >= b.o;
        const c = hausse ? "#34d399" : "#f87171";
        const top = y(Math.max(b.o, b.c));
        return (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={y(b.h)} y2={y(b.l)} stroke={c} strokeWidth="1" />
            <rect x={x(i) - corps / 2} y={top} width={corps} height={Math.max(1.5, y(Math.min(b.o, b.c)) - top)} fill={c} rx="0.6" />
          </g>
        );
      })}
      {positions.map((p) => [
        ligne(p.entree, "rgba(255,255,255,0.75)", `${p.sens === "achat" ? "Achat" : "Vente"} #${p.id}`, `e${p.id}`),
        ligne(p.stop, "#f87171", `Stop #${p.id}`, `s${p.id}`),
        ligne(p.objectif, "#34d399", `Objectif #${p.id}`, `o${p.id}`),
      ])}
      <line x1={pad.l} x2={w - pad.r} y1={y(dernier.c)} y2={y(dernier.c)} stroke="#d92128" strokeOpacity="0.6" strokeDasharray="2 3" />
      <rect x={w - pad.r + 2} y={y(dernier.c) - 10} width={pad.r - 4} height="20" rx="3" fill="#d92128" />
      <text x={w - pad.r / 2} y={y(dernier.c) + 4} fontSize="11.5" fontWeight="600" fill="#fff" textAnchor="middle">
        {pts(dernier.c)}
      </text>
    </svg>
    </div>
  );
}

/* ---------- carnet d'ordres ---------- */

function Carnet({ tick }: { tick: number }) {
  const { niveaux } = carnetAuTick(tick);
  const max = Math.max(...niveaux.map((n) => Math.max(n.acheteurs, n.vendeurs)));
  return (
    <div className="text-[13px] tabular-nums">
      <div className="grid grid-cols-3 pb-1 text-[11px] uppercase tracking-wider text-white/60">
        <span>Acheteurs</span>
        <span className="text-center">Prix</span>
        <span className="text-right">Vendeurs</span>
      </div>
      {niveaux.map((n, i) => (
        <div key={n.prix} className={`grid grid-cols-3 items-center py-px ${i === 6 ? "border-t border-white/40" : ""}`}>
          <div className="relative h-4">
            {n.acheteurs > 0 && (
              <>
                <div className="absolute inset-y-0 right-0 rounded-sm bg-emerald-400/30" style={{ width: `${(n.acheteurs / max) * 100}%` }} />
                <span className="relative pl-1 font-medium text-emerald-200">{n.acheteurs}</span>
              </>
            )}
          </div>
          <div className={`text-center ${i === 5 ? "font-semibold text-[#f87171]" : i === 6 ? "font-semibold text-emerald-300" : "text-white/90"}`}>{pts(n.prix)}</div>
          <div className="relative h-4 text-right">
            {n.vendeurs > 0 && (
              <>
                <div className="absolute inset-y-0 left-0 rounded-sm bg-[#f87171]/30" style={{ width: `${(n.vendeurs / max) * 100}%` }} />
                <span className="relative pr-1 font-medium text-[#fecaca]">{n.vendeurs}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- composant principal ---------- */

const champ =
  "h-11 w-full min-w-0 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-[14px] text-white tabular-nums outline-none focus:border-[var(--accent)]";

export default function Terminal() {
  const [etat, dispatch] = useReducer(reducteur, INITIAL);
  const [charge, setCharge] = useState(false);
  const [enPause, setEnPause] = useState(false);

  // Ordre en préparation
  const [sens, setSens] = useState<Sens>("achat");
  const [contrat, setContrat] = useState<Contrat>("MNQ");
  const [taille, setTaille] = useState("1");
  const [stopPts, setStopPts] = useState("");
  const [objPts, setObjPts] = useState("");
  const [accordPour, setAccordPour] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Reprise de la séance enregistrée sur cet appareil
  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE);
      if (brut) {
        const e = JSON.parse(brut) as Etat;
        if (typeof e.tick === "number" && Array.isArray(e.positions) && Array.isArray(e.historique)) dispatch({ type: "charger", etat: e });
      }
    } catch {
      /* stockage indisponible : on repart d'une séance neuve */
    }
    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;
    try {
      localStorage.setItem(CLE, JSON.stringify(etat));
    } catch {
      /* rien : la séance reste en mémoire */
    }
  }, [etat, charge]);

  useEffect(() => {
    if (enPause) return;
    const id = setInterval(() => dispatch({ type: "tick" }), TICK_MS);
    return () => clearInterval(id);
  }, [enPause]);

  const bougies = useMemo(() => bougiesAuTick(etat.tick), [etat.tick]);
  const bid = prixAuTick(etat.tick);
  const ask = bid + PAS;
  const parPoint = CONTRATS[contrat].parPoint;

  const realise = etat.historique.reduce((s, t) => s + t.pnl, 0);
  const solde = START_CAPITAL + realise;
  const latent = etat.positions.reduce((s, p) => {
    const sortie = p.sens === "achat" ? bid : ask;
    return s + (p.sens === "achat" ? sortie - p.entree : p.entree - sortie) * CONTRATS[p.contrat].parPoint * p.taille;
  }, 0);
  const seanceStoppee = realise <= -PERTE_JOUR_MAX;

  // Calcul du risque avant validation
  const t = Math.max(0, Math.floor(Number(taille.replace(",", "."))) || 0);
  const s = Math.round((Number(stopPts.replace(",", ".")) || 0) / PAS) * PAS;
  const o = Math.round((Number(objPts.replace(",", ".")) || 0) / PAS) * PAS;
  const entree = sens === "achat" ? ask : bid;
  const prixStop = sens === "achat" ? entree - s : entree + s;
  const prixObj = sens === "achat" ? entree + o : entree - o;
  const risque = s * parPoint * t;
  const risquePct = (risque / solde) * 100;
  const ratio = s > 0 ? o / s : 0;
  const depasse = risquePct > RISQUE_MAX_PCT;
  const tailleMax = s > 0 ? Math.floor((solde * RISQUE_MAX_PCT) / 100 / (s * parPoint)) : 0;
  const complet = t > 0 && s > 0 && o > 0;
  const manque = t <= 0 ? "Indique une taille (au moins 1 contrat)." : s <= 0 ? "Le stop est obligatoire : indique sa distance en points." : o <= 0 ? "L'objectif est obligatoire : indique sa distance en points." : null;
  // L'accord « je dépasse quand même » ne vaut que pour cet ordre précis.
  const signature = `${sens}|${contrat}|${t}|${s}`;
  const depasseOk = accordPour === signature;
  const peutValider = complet && !seanceStoppee && (!depasse || depasseOk);


  function valider() {
    if (!peutValider) return;
    dispatch({
      type: "ouvrir",
      position: { sens, contrat, taille: t, entree, stop: prixStop, objectif: prixObj, risque, heure: heureAuTick(etat.tick) },
    });
    setMessage(`Ordre exécuté : ${sens === "achat" ? "achat" : "vente"} de ${t} ${contrat} à ${pts(entree)} (argent fictif).`);
    setAccordPour(null);
  }

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(id);
  }, [message]);

  const [onglet, setOnglet] = useState<"positions" | "historique">("positions");
  const vide = etat.positions.length === 0 && etat.historique.length === 0;

  const kpis = [
    { l: "Solde", v: usd(solde), d: "Capital de départ (10 000 $) + résultat des trades clôturés.", c: "text-white" },
    { l: "P&L séance", v: usd(realise, true), d: "P&L = profit and loss : ton gain ou ta perte sur les trades clôturés aujourd'hui.", c: couleur(realise) },
    {
      l: "Perte max restante",
      v: usd(Math.max(0, PERTE_JOUR_MAX + Math.min(0, realise))),
      d: `Comme en challenge prop firm : à −${CHALLENGE.perteJourMaxPct} % (${usd(PERTE_JOUR_MAX)}) sur la séance, tu ne peux plus ouvrir de trade.`,
      c: seanceStoppee ? "text-[#f87171]" : "text-white",
    },
  ];

  const bouton = "h-9 rounded-lg border border-white/[0.12] px-3 text-[12px] hover:bg-white/[0.05]";

  return (
    <div className="flex flex-col gap-2.5 lg:h-[calc(100vh-40px)] lg:min-h-[640px]">
      {/* Bandeau : chiffres de la séance, prix, contrôles */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/[0.14] bg-white/[0.035] px-4 py-2">
        {kpis.map((k) => (
          <div key={k.l} className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/65">
              <Terme def={k.d}>{k.l}</Terme>
            </div>
            <div className={`text-[20px] font-medium tabular-nums ${k.c}`}>{k.v}</div>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px] tabular-nums text-white/80 lg:ml-auto">
          <span>
            <Terme def="Bid : le meilleur prix auquel quelqu'un veut acheter. C'est à ce prix que tu vends.">Bid</Terme>{" "}
            <span className="text-[#f87171]">{pts(bid)}</span>
          </span>
          <span>
            <Terme def="Ask : le meilleur prix auquel quelqu'un veut vendre. C'est à ce prix que tu achètes.">Ask</Terme>{" "}
            <span className="text-emerald-300">{pts(ask)}</span>
          </span>
          <span className="text-white/65">
            <Terme def="Spread : l'écart entre bid et ask. Tu le paies à chaque trade.">Spread</Terme> {pts(ask - bid)}
          </span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEnPause((p) => !p)} className={`${bouton} text-white/80`} aria-pressed={enPause}>
            {enPause ? "▶ Reprendre" : "❚❚ Pause"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Effacer la séance (positions et historique) et repartir à 10 000 $ ?")) dispatch({ type: "reinitialiser" });
            }}
            className={`${bouton} text-white/60`}
          >
            Nouvelle séance
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Gauche : graphique, puis positions / historique */}
        <div className="contents lg:flex lg:min-h-0 lg:min-w-0 lg:flex-col lg:gap-2.5">
          <section className="order-1 flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl lg:order-none border border-white/[0.08] bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center justify-between gap-2 text-[12px] font-medium uppercase tracking-[0.12em] text-white/80">
              <span>NQ · Nasdaq simulé · bougies 1 min</span>
              <span className="normal-case tracking-normal text-white/65 tabular-nums">{heureAuTick(etat.tick)}</span>
            </div>
            <div className="min-h-0 flex-1">
              <Graphique bougies={bougies} positions={etat.positions} />
            </div>
          </section>

          <section
            className={`order-3 flex min-w-0 flex-col rounded-2xl border border-white/[0.14] bg-white/[0.035] lg:order-none ${
              vide ? "px-3 py-2" : "p-3 lg:h-[170px]"
            }`}
          >
            {vide ? (
              <p className="text-[13px] text-white/70">
                Aucune position ouverte, aucun trade clôturé. Tes positions s&apos;afficheront ici, avec leur stop et leur objectif.
              </p>
            ) : (
            <>
            <div className="flex gap-1" role="tablist" aria-label="Positions et historique">
              {(
                [
                  ["positions", `Positions ouvertes (${etat.positions.length})`],
                  ["historique", `Historique (${etat.historique.length})`],
                ] as const
              ).map(([id, l]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={onglet === id}
                  onClick={() => setOnglet(id)}
                  className={`h-8 rounded-lg px-3 text-[13px] transition ${onglet === id ? "bg-white/15 font-medium text-white" : "text-white/65 hover:text-white"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="mt-1 min-h-0 flex-1 overflow-y-auto">
              {onglet === "positions" ? (
                etat.positions.length === 0 ? (
                  <p className="px-1 py-3 text-[13px] text-white/45">Aucune position ouverte. Elles se ferment seules au stop ou à l&apos;objectif.</p>
                ) : (
                  <ul className="divide-y divide-white/[0.06]">
                    {etat.positions.map((p) => {
                      const sortie = p.sens === "achat" ? bid : ask;
                      const l = (p.sens === "achat" ? sortie - p.entree : p.entree - sortie) * CONTRATS[p.contrat].parPoint * p.taille;
                      return (
                        <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 py-2 text-[13.5px] tabular-nums">
                          <span className={`w-16 font-medium ${p.sens === "achat" ? "text-emerald-300" : "text-[#fca5a5]"}`}>
                            {p.sens === "achat" ? "Achat" : "Vente"} #{p.id}
                          </span>
                          <span className="text-white/90">
                            {p.taille} {p.contrat} à {pts(p.entree)}
                          </span>
                          <span className="text-white/75">
                            Stop {pts(p.stop)} · Obj. {pts(p.objectif)}
                          </span>
                          <span className={couleur(l)}>
                            {usd(l, true)} ({rFmt(l / p.risque)})
                          </span>
                          <button type="button" onClick={() => dispatch({ type: "cloturer", id: p.id })} className={`${bouton} ml-auto text-white/80`}>
                            Clôturer
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : etat.historique.length === 0 ? (
                <p className="px-1 py-3 text-[13px] text-white/45">Pas encore de trade clôturé.</p>
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {etat.historique.map((tr) => (
                    <li key={tr.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-1 py-2 text-[12.5px] tabular-nums">
                      <span className="text-white/45">{tr.heure}</span>
                      <span className={tr.sens === "achat" ? "text-emerald-300" : "text-[#fca5a5]"}>
                        {tr.sens === "achat" ? "Achat" : "Vente"} #{tr.id}
                      </span>
                      <span className="flex-1 text-white/60">
                        {tr.taille} {tr.contrat} · {pts(tr.entree)} → {pts(tr.sortie)}
                        <span className="text-white/40"> ({tr.motif === "stop" ? "stop touché" : tr.motif === "objectif" ? "objectif atteint" : "clôture manuelle"})</span>
                      </span>
                      <span className={couleur(tr.pnl)}>{usd(tr.pnl, true)}</span>
                      <span className={couleur(tr.r)}>{rFmt(tr.r)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            </>
            )}
          </section>
        </div>

        {/* Droite : carnet d'ordres, puis la fenêtre d'ordre juste dessous */}
        <div className="order-2 flex min-h-0 min-w-0 flex-col gap-2.5 lg:order-none lg:overflow-y-auto">
          <section className="rounded-2xl border border-white/[0.14] bg-white/[0.035] p-3">
            <div className="mb-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-white/80">
              <Terme def="Combien de contrats attendent à chaque prix. Des gros chiffres d'un côté montrent où l'offre ou la demande se concentre.">
                Carnet d&apos;ordres
              </Terme>
            </div>
            <Carnet tick={etat.tick} />
          </section>

          <section className="rounded-2xl border border-white/[0.14] bg-white/[0.035] p-3" aria-label="Passer un ordre">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Sens de l'ordre">
              {(["achat", "vente"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSens(v)}
                  aria-pressed={sens === v}
                  title={v === "achat" ? "Tu vises la hausse" : "Tu vises la baisse"}
                  className={`h-10 rounded-lg border text-[14px] font-semibold tabular-nums transition ${
                    sens === v
                      ? v === "achat"
                        ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
                        : "border-[#f87171]/60 bg-[#f87171]/15 text-[#fca5a5]"
                      : "border-white/25 text-white/85 hover:bg-white/[0.06]"
                  }`}
                >
                  {v === "achat" ? `Acheter ${pts(ask)}` : `Vendre ${pts(bid)}`}
                </button>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">
              <label className="block text-[12px] text-white/80">
                Contrat
                <select value={contrat} onChange={(e) => setContrat(e.target.value as Contrat)} className={`${champ.replace("h-11", "h-9")} mt-0.5`}>
                  {(Object.keys(CONTRATS) as Contrat[]).map((k) => (
                    <option key={k} value={k} className="bg-[#16161a]">
                      {k} · {CONTRATS[k].parPoint} $/pt
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[12px] text-white/80">
                <Terme def="Le nombre de contrats. Plus la taille est grande, plus chaque point te fait gagner ou perdre.">Taille</Terme>
                <input inputMode="numeric" value={taille} onChange={(e) => setTaille(e.target.value)} className={`${champ.replace("h-11", "h-9")} mt-0.5`} />
              </label>
              <label className="block text-[12px] text-white/80">
                <Terme def="Distance entre ton entrée et le prix où la perte est coupée.">Stop</Terme> (pts) *
                <input inputMode="decimal" placeholder="ex. 10" value={stopPts} onChange={(e) => setStopPts(e.target.value)} className={`${champ.replace("h-11", "h-9")} mt-0.5`} required />
              </label>
              <label className="block text-[12px] text-white/80">
                <Terme def="Distance entre ton entrée et le prix où le gain est encaissé.">Objectif</Terme> (pts) *
                <input inputMode="decimal" placeholder="ex. 20" value={objPts} onChange={(e) => setObjPts(e.target.value)} className={`${champ.replace("h-11", "h-9")} mt-0.5`} required />
              </label>
            </div>

            {/* Le risque, affiché avant de valider : l'essentiel seulement */}
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-white/[0.16] bg-black/30 px-3 py-2 tabular-nums">
              <div>
                <div className="text-[11px] text-white/60">
                  <Terme def="Ce que tu perds si le stop est touché. C'est ton 1 R.">Risque</Terme>
                </div>
                <div className={`text-[16px] font-semibold ${depasse ? "text-[#f87171]" : "text-white"}`}>
                  {s > 0 && t > 0 ? `${usd(risque)} · ${pct(risquePct)}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-white/60">
                  <Terme def="Gain visé divisé par le risque. 2 R = tu vises 2 fois ce que tu risques.">Ratio</Terme>
                </div>
                <div className="text-[16px] font-semibold text-white">
                  {s > 0 && o > 0 ? `${ratio.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} R` : "—"}
                </div>
              </div>
            </div>

            {complet && depasse && (
              <div role="alert" className="mt-2 rounded-lg border border-[#f87171]/40 bg-[#f87171]/10 p-2 text-[11.5px] leading-snug text-[#fecaca]">
                <strong className="text-[#f87171]">Plus de 1 % de risque.</strong>{" "}
                {tailleMax >= 1
                  ? `Taille max avec ce stop : ${tailleMax} ${contrat}.`
                  : contrat === "NQ"
                    ? "Même 1 NQ dépasse : passe en MNQ ou rapproche ton stop."
                    : "Même 1 contrat dépasse : rapproche ton stop."}
                <label className="mt-1 flex min-h-8 cursor-pointer items-center gap-2 text-white/75">
                  <input type="checkbox" checked={depasseOk} onChange={(e) => setAccordPour(e.target.checked ? signature : null)} className="h-4 w-4 accent-[#d92128]" />
                  Je passe l&apos;ordre quand même
                </label>
              </div>
            )}

            {seanceStoppee && (
              <div role="alert" className="mt-2 rounded-lg border border-[#f87171]/40 bg-[#f87171]/10 p-2 text-[11.5px] text-[#fecaca]">
                Perte max du jour atteinte : la séance est terminée.
              </div>
            )}

            <button
              type="button"
              onClick={valider}
              disabled={!peutValider}
              className={`mt-2 h-10 w-full rounded-lg text-[14px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                sens === "achat" ? "bg-emerald-500 text-[#04120b] hover:bg-emerald-400" : "bg-[#d92128] text-white hover:bg-[#e2343b]"
              }`}
            >
              {sens === "achat" ? "Valider l'achat" : "Valider la vente"}
              {complet ? ` · ${t} ${contrat}` : ""}
            </button>
            <p aria-live="polite" className={`mt-1.5 min-h-[1rem] text-[12px] ${message ? "text-emerald-300" : "text-white/65"}`}>
              {message ?? (!complet ? manque : "")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
