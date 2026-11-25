"use client";

import { useEffect, useState } from "react";

type Etat = { live: boolean; id: string | null; titre: string };

const CHAINE = "https://www.youtube.com/@xeilostrading";

/** L'écran Live : le direct YouTube de Xeilos s'il est en cours, sinon un message. Vérifie chaque minute. */
export default function Live() {
  const [etat, setEtat] = useState<Etat | null>(null);
  const [ici, setIci] = useState(false);

  useEffect(() => {
    let actif = true;
    const verifier = () =>
      fetch("/api/live", { cache: "no-store" })
        .then((r) => r.json())
        .then((e: Etat) => actif && setEtat(e))
        .catch(() => actif && setEtat((x) => x ?? { live: false, id: null, titre: "" }));
    verifier();
    const id = setInterval(verifier, 60_000);
    return () => {
      actif = false;
      clearInterval(id);
    };
  }, []);

  if (!etat) return <p className="text-[14px] text-white/60">On regarde si on est en direct…</p>;

  if (!etat.live || !etat.id) {
    return (
      <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-[14px] text-white/70">
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" aria-hidden />
          Pas de live en ce moment
        </div>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">
          Dès que Xeilos passe en direct sur YouTube, le live s&apos;affiche ici automatiquement. Tu n&apos;as pas besoin de recharger la page.
        </p>
        <a
          href={CHAINE}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-[14px] text-white hover:border-white/50"
        >
          Voir la chaîne YouTube ↗
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#d92128] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden />
          En direct
        </span>
        {etat.titre && <span className="text-[16px] text-white">{etat.titre}</span>}
      </div>

      {ici ? (
        <div className="aspect-video w-full max-w-[1100px] overflow-hidden rounded-2xl border border-white/[0.1] bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${etat.id}?autoplay=1&playsinline=1&rel=0`}
            title="Le live Xeilos"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIci(true)}
            className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-[14px] font-medium text-black hover:bg-white/90"
          >
            ▶ Regarder ici
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${etat.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-[14px] text-white hover:border-white/50"
          >
            Ouvrir sur YouTube ↗
          </a>
        </div>
      )}
      <p className="text-[12px] text-white/50">
        « Regarder ici » garde le direct dans Xeilos ; « Ouvrir sur YouTube » donne accès au chat et aux réactions.
      </p>
    </div>
  );
}
