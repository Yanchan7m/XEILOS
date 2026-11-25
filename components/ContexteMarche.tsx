"use client";

import { useMemo, useState } from "react";
import { SCENARIOS, type Bar, type Choice, type DomRow, type Scenario } from "@/lib/contexte-scenarios";

/* ------------------------------------------------------------------ */
/*  Contexte de marché : un même marché lu en 3 étapes, puis décision  */
/* ------------------------------------------------------------------ */

const ETAPES = [
  { num: "01", nom: "Contexte général" },
  { num: "02", nom: "Activité du marché" },
  { num: "03", nom: "Carnet d'ordres" },
  { num: "✓", nom: "Décision" },
] as const;

type Reponses = (string | null)[];

const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

export default function ContexteMarche() {
  const [idx, setIdx] = useState(0);
  const [etape, setEtape] = useState(0); // 0..3, 4 = bilan
  const [choix, setChoix] = useState<string | null>(null);
  const [valide, setValide] = useState(false);
  const [reponses, setReponses] = useState<Reponses>([null, null, null, null]);
  const [scores, setScores] = useState<Record<string, number>>({});

  const sc = SCENARIOS[idx];
  const def = [sc.contexte, sc.activite, sc.carnet, sc.decision][Math.min(etape, 3)];
  const juste = choix === def.answer;

  function valider() {
    if (!choix) return;
    setValide(true);
    const r = [...reponses];
    r[etape] = choix;
    setReponses(r);
  }

  function suivant() {
    const next = etape + 1;
    if (next === 4) {
      const bons = reponses.filter((r, i) => r === [sc.contexte, sc.activite, sc.carnet, sc.decision][i].answer).length;
      setScores((s) => ({ ...s, [sc.id]: bons }));
    }
    setEtape(next);
    setChoix(next === 4 ? null : reponses[next]);
    setValide(false);
  }

  function ouvrir(i: number) {
    setIdx(i);
    setEtape(0);
    setChoix(null);
    setValide(false);
    setReponses([null, null, null, null]);
  }

  return (
    <div className="space-y-8">
      {/* Choix du scénario */}
      <div className="grid gap-3 sm:grid-cols-3">
        {SCENARIOS.map((s, i) => {
          const actif = i === idx;
          const score = scores[s.id];
          return (
            <button
              key={s.id}
              onClick={() => ouvrir(i)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                actif ? "border-[var(--accent)]/60 bg-[var(--accent)]/[0.08]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/45">
                Situation {i + 1}
                {score !== undefined && <span className={score === 4 ? "text-emerald-400" : "text-amber-300"}>{score}/4</span>}
              </div>
              <div className="mt-1 text-[14px] text-white">{s.titre}</div>
            </button>
          );
        })}
      </div>

      {/* Frise des étapes */}
      <ol className="grid grid-cols-4 gap-2">
        {ETAPES.map((e, i) => {
          const etat = i < etape ? "fait" : i === etape ? "encours" : "avenir";
          return (
            <li key={e.nom} className="min-w-0">
              <div className={`h-[3px] rounded-full ${etat === "avenir" ? "bg-white/10" : "bg-[var(--accent)]"}`} />
              <div className={`mt-2 truncate text-[10px] uppercase tracking-[0.2em] ${etat === "avenir" ? "text-white/35" : "text-white/80"}`}>
                <span className="text-[var(--accent)]">{e.num}</span> <span className="hidden sm:inline">· {e.nom}</span>
              </div>
            </li>
          );
        })}
      </ol>

      {etape === 4 ? (
        <Bilan sc={sc} reponses={reponses} onRejouer={() => ouvrir(idx)} onSuivant={idx < SCENARIOS.length - 1 ? () => ouvrir(idx + 1) : undefined} />
      ) : (
        <div className="space-y-5">
          {/* En haut : le graphique à gauche, le carnet à droite */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d1220] p-4">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 text-[10px] uppercase tracking-[0.25em] text-white/50">
                <span>{sc.marche}</span>
                <span>{sc.session}</span>
              </div>
              <Graphique
                bars={sc.bars}
                niveaux={etape === 0 ? sc.niveaux : []}
                zone={etape > 0 || valide ? sc.zone : null}
                choisi={etape === 0 ? (choix ? Number(choix) : null) : null}
                onPick={etape === 0 && !valide ? (p) => setChoix(String(p)) : undefined}
                volume={etape >= 1}
              />
              {etape >= 1 && <Mesures bars={sc.bars} />}
            </div>
            {etape >= 2 ? (
              <Carnet rows={sc.carnet.dom} prix={sc.carnet.prix} zone={sc.zone} />
            ) : (
              <div className="hidden flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] p-6 text-center lg:flex">
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Carnet d&apos;ordres</div>
                <div className="mt-2 text-[13px] text-white/45">Il s&apos;ouvre à l&apos;étape 03, quand le prix arrive sur ta zone.</div>
              </div>
            )}
          </div>

          {/* En dessous : la question */}
          <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--accent)]">
              {ETAPES[etape].num} / {ETAPES[etape].nom}
            </div>
            <h2 className="text-[19px] leading-snug text-white">{def.question}</h2>

            {etape === 3 && <Recap sc={sc} reponses={reponses} />}

            {etape === 0 ? (
              <p className="text-[13px] text-white/55">
                {choix ? `Zone choisie : ${fmt(Number(choix))}` : "Clique une des lignes pointillées sur le graphique."}
              </p>
            ) : (
              <Choix choices={def.choices} choix={choix} setChoix={setChoix} valide={valide} answer={def.answer} />
            )}

            {valide && (
              <div className={`rounded-xl border p-4 text-[13.5px] leading-relaxed ${juste ? "border-emerald-500/40 bg-emerald-500/[0.07]" : "border-amber-400/40 bg-amber-400/[0.07]"}`}>
                <div className={`mb-1 font-medium ${juste ? "text-emerald-300" : "text-amber-200"}`}>
                  {juste ? "Bien lu." : etape === 0 ? `La zone à surveiller était ${fmt(sc.zone)}.` : "Pas tout à fait."}
                </div>
                <div className="text-white/80">{def.explication}</div>
              </div>
            )}

            {!valide ? (
              <button
                onClick={valider}
                disabled={!choix}
                className="w-full rounded-xl bg-[var(--accent)] px-6 py-3 text-[14px] font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[200px]"
              >
                Valider
              </button>
            ) : (
              <button onClick={suivant} className="w-full rounded-xl border border-white/15 bg-white/[0.05] px-6 py-3 sm:w-auto sm:min-w-[200px] text-[14px] font-medium text-white transition hover:bg-white/[0.1]">
                {etape === 3 ? "Voir le bilan" : "Étape suivante →"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Choix({ choices, choix, setChoix, valide, answer }: { choices: Choice[]; choix: string | null; setChoix: (c: string) => void; valide: boolean; answer: string }) {
  return (
    <div className="grid gap-2 sm:auto-cols-fr sm:grid-flow-col">
      {choices.map((c) => {
        const pris = choix === c.id;
        const bon = valide && c.id === answer;
        const faux = valide && pris && c.id !== answer;
        return (
          <button
            key={c.id}
            disabled={valide}
            onClick={() => setChoix(c.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              bon
                ? "border-emerald-500/60 bg-emerald-500/10"
                : faux
                  ? "border-amber-400/60 bg-amber-400/10"
                  : pris
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/25"
            }`}
          >
            <div className="text-[14px] text-white">{c.label}</div>
            {c.detail && <div className="mt-0.5 text-[12px] text-white/50">{c.detail}</div>}
          </button>
        );
      })}
    </div>
  );
}

/** Rappel des 3 lectures avant la décision */
function Recap({ sc, reponses }: { sc: Scenario; reponses: Reponses }) {
  const lignes = [
    { nom: "Contexte", val: `Zone ${fmt(sc.zone)}` },
    { nom: "Activité", val: sc.activite.choices.find((c) => c.id === sc.activite.answer)?.label },
    { nom: "Carnet", val: sc.carnet.choices.find((c) => c.id === sc.carnet.answer)?.label },
  ];
  return (
    <ul className="space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-[13px]">
      {lignes.map((l, i) => (
        <li key={l.nom} className="flex justify-between gap-3">
          <span className="text-white/45">
            <span className="text-[var(--accent)]">0{i + 1}</span> {l.nom}
          </span>
          <span className="text-right text-white/90">{l.val}</span>
        </li>
      ))}
      <li className="sr-only">{reponses.join(",")}</li>
    </ul>
  );
}

function Bilan({ sc, reponses, onRejouer, onSuivant }: { sc: Scenario; reponses: Reponses; onRejouer: () => void; onSuivant?: () => void }) {
  const defs = [sc.contexte, sc.activite, sc.carnet, sc.decision];
  const bons = reponses.filter((r, i) => r === defs[i].answer).length;
  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--accent)]">À retenir</div>
      <h2 className="text-[26px] leading-tight text-white sm:text-[30px]">
        Avant de chercher une entrée…
        <br />
        <span className="font-semibold text-[var(--accent)]">je vérifie si les conditions sont réunies.</span>
      </h2>
      <p className="text-[14px] text-white/60">{sc.aRetenir}</p>

      <ul className="space-y-2 text-left">
        {defs.map((d, i) => {
          const ok = reponses[i] === d.answer;
          return (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <span className={`mt-0.5 text-[13px] ${ok ? "text-emerald-400" : "text-amber-300"}`}>{ok ? "✓" : "✗"}</span>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                  {ETAPES[i].num} · {ETAPES[i].nom}
                </div>
                <div className="text-[13px] text-white/80">{d.explication}</div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="text-[15px] text-white">
        Score : <span className={bons === 4 ? "text-emerald-400" : "text-amber-300"}>{bons}/4</span>
      </div>
      <p className="text-[13px] italic text-white/45">Parfois, la meilleure décision est de ne pas trader.</p>

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onRejouer} className="rounded-xl border border-white/15 px-5 py-2.5 text-[14px] text-white hover:bg-white/[0.06]">
          Rejouer
        </button>
        {onSuivant && (
          <button onClick={onSuivant} className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[var(--accent-strong)]">
            Situation suivante →
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Graphique chandeliers + volume (SVG)                               */
/* ------------------------------------------------------------------ */

const W = 640;
const VOLUME_HABITUEL = 900; // lots par minute sur une séance normale
const HP = 240;
const HV = 64;
const PAD = { l: 8, r: 58, t: 10 };

function Graphique({
  bars,
  niveaux,
  zone,
  choisi,
  onPick,
  volume,
}: {
  bars: Bar[];
  niveaux: number[];
  zone: number | null;
  choisi: number | null;
  onPick?: (p: number) => void;
  volume: boolean;
}) {
  const { min, max, vmax } = useMemo(() => {
    const all = [...bars.flatMap((b) => [b.h, b.l]), ...niveaux, ...(zone ? [zone] : [])];
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    // Échelle minimale de 70 points : un marché calme doit AVOIR L'AIR calme
    const span = Math.max((hi - lo) * 1.16, 70);
    const mid = (hi + lo) / 2;
    // Volume rapporté à une séance normale, pas au plus haut du graphique
    return { min: mid - span / 2, max: mid + span / 2, vmax: Math.max(...bars.map((b) => b.v), VOLUME_HABITUEL * 2.2) };
  }, [bars, niveaux, zone]);

  const H = HP + (volume ? HV + 14 : 0);
  const iw = W - PAD.l - PAD.r;
  const step = iw / bars.length;
  const y = (p: number) => PAD.t + ((max - p) / (max - min)) * (HP - PAD.t - 6);
  const x = (i: number) => PAD.l + step * i + step / 2;
  const cw = Math.max(2, step * 0.62);

  // Étiquettes de grille, sauf celles qui chevaucheraient un niveau ou la zone
  const reperes = [...niveaux, ...(zone !== null ? [zone] : [])];
  const grille = Array.from({ length: 5 }, (_, i) => min + ((max - min) * (i + 0.5)) / 5).filter(
    (g) => reperes.every((n) => Math.abs(y(g) - y(n)) > 14),
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="img" aria-label="Graphique en chandeliers">
      {grille.map((g) => (
        <g key={g}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} stroke="rgba(255,255,255,0.05)" />
          <text x={W - PAD.r + 6} y={y(g) + 3} fontSize={9} fill="rgba(255,255,255,0.35)">
            {fmt(Math.round(g))}
          </text>
        </g>
      ))}

      {zone !== null && (
        <g>
          <rect x={PAD.l} width={iw} y={y(zone) - 4} height={8} fill="rgba(250,204,21,0.08)" />
          <line x1={PAD.l} x2={W - PAD.r} y1={y(zone)} y2={y(zone)} stroke="#facc15" strokeWidth={1.2} />
          <text x={PAD.l + 4} y={y(zone) - 7} fontSize={9} fontWeight={600} letterSpacing={1} fill="#facc15">
            ZONE À SURVEILLER
          </text>
        </g>
      )}

      {bars.map((b, i) => {
        const up = b.c >= b.o;
        const col = up ? "#22c39a" : "#ef4458";
        const top = y(Math.max(b.o, b.c));
        return (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={y(b.h)} y2={y(b.l)} stroke={col} strokeWidth={1} />
            <rect x={x(i) - cw / 2} y={top} width={cw} height={Math.max(1, y(Math.min(b.o, b.c)) - top)} fill={col} rx={0.5} />
          </g>
        );
      })}

      {niveaux.map((n) => {
        const pris = choisi === n;
        return (
          <g key={n} onClick={() => onPick?.(n)} className={onPick ? "cursor-pointer" : ""}>
            <rect x={PAD.l} width={W - PAD.l} y={y(n) - 9} height={18} fill="transparent" />
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(n)}
              y2={y(n)}
              stroke={pris ? "var(--accent)" : "rgba(255,255,255,0.55)"}
              strokeWidth={pris ? 2 : 1}
              strokeDasharray={pris ? undefined : "5 4"}
            />
            <rect x={W - PAD.r + 2} y={y(n) - 8} width={PAD.r - 4} height={16} rx={3} fill={pris ? "var(--accent)" : "rgba(255,255,255,0.12)"} />
            <text x={W - PAD.r / 2} y={y(n) + 3.5} fontSize={9.5} textAnchor="middle" fill="white" fontWeight={600}>
              {fmt(n)}
            </text>
          </g>
        );
      })}

      {volume && (
        <g>
          <text x={PAD.l} y={HP + 10} fontSize={8.5} letterSpacing={1} fill="rgba(255,255,255,0.4)">
            VOLUME ÉCHANGÉ
          </text>
          {bars.map((b, i) => {
            const h = (b.v / vmax) * HV;
            return <rect key={i} x={x(i) - cw / 2} y={HP + 14 + HV - h} width={cw} height={h} fill={b.c >= b.o ? "#22c39a" : "#ef4458"} opacity={0.75} />;
          })}
        </g>
      )}
    </svg>
  );
}

/** Indicateurs simples calculés sur les bougies (étape 2 et suivantes) */
function Mesures({ bars }: { bars: Bar[] }) {
  const volMoy = bars.reduce((s, b) => s + b.v, 0) / bars.length;
  const amp = bars.reduce((s, b) => s + (b.h - b.l), 0) / bars.length;
  const ratio = volMoy / VOLUME_HABITUEL;
  const items = [
    { k: "Volume / minute", v: `${Math.round(volMoy)} lots`, sub: `${fmt(Math.round((ratio >= 1 ? ratio : 1 / ratio) * 10) / 10)} fois ${ratio >= 1 ? "plus" : "moins"} que d'habitude` },
    { k: "Taille moyenne d'une bougie", v: `${fmt(Math.round(amp * 10) / 10)} pts`, sub: "volatilité" },
  ];
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {items.map((it) => (
        <div key={it.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.15em] text-white/40">{it.k}</div>
          <div className="text-[15px] tabular-nums text-white">{it.v}</div>
          <div className="text-[11px] text-white/45">{it.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Carnet d'ordres (lecture seule)                                    */
/* ------------------------------------------------------------------ */

function Carnet({ rows, prix, zone }: { rows: DomRow[]; prix: number; zone: number }) {
  // Plancher à 150 lots : un carnet léger doit paraître vide
  const max = Math.max(...rows.flatMap((r) => [r.bid, r.ask]), 150);
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d1220] p-4">
      <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.25em] text-white/50">
        <span>Carnet d&apos;ordres</span>
        <span>tailles en lots</span>
      </div>
      <div className="mb-1 grid grid-cols-[1fr_88px_1fr] px-1 text-[10px] uppercase tracking-widest">
        <span className="text-right text-emerald-400/80">Achats</span>
        <span className="text-center text-white/45">Prix</span>
        <span className="text-[#f9a3ab]/80">Ventes</span>
      </div>
      <div className="space-y-px">
        {rows.map((r) => {
          const ici = r.price === prix;
          const surZone = r.price === zone;
          return (
            <div
              key={r.price}
              className={`grid grid-cols-[1fr_88px_1fr] items-center gap-2 rounded px-1 py-[3px] ${ici ? "bg-white/[0.08] ring-1 ring-white/20" : surZone ? "bg-yellow-400/[0.07]" : ""}`}
            >
              <span className="flex items-center justify-end gap-2">
                <span className="tabular-nums text-[11px] text-emerald-300">{r.bid || ""}</span>
                <span className="relative h-3 w-full max-w-[140px]">
                  <span className="absolute right-0 top-0 h-full rounded-sm bg-emerald-500/45" style={{ width: `${(r.bid / max) * 100}%` }} />
                </span>
              </span>
              <span className={`text-center text-[11px] tabular-nums ${surZone ? "font-semibold text-yellow-300" : "text-white/85"}`}>
                {r.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                {ici && <span className="ml-1 text-white/50">◂</span>}
              </span>
              <span className="flex items-center gap-2">
                <span className="relative h-3 w-full max-w-[140px]">
                  <span className="absolute left-0 top-0 h-full rounded-sm bg-[#ef4458]/50" style={{ width: `${(r.ask / max) * 100}%` }} />
                </span>
                <span className="tabular-nums text-[11px] text-[#f9a3ab]">{r.ask || ""}</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] text-white/40">◂ dernier prix · ligne jaune = zone à surveiller · ordres affichés modifiables ou annulables</div>
    </div>
  );
}
