"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, LEXIQUE, TERME, type Categorie } from "@/lib/lexique";

const carte = "rounded-2xl border border-white/[0.08] bg-white/[0.02]";

const normaliser = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export default function Lexique() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Categorie | null>(null);

  const termes = useMemo(() => {
    const n = normaliser(q.trim());
    return LEXIQUE.filter(
      (t) =>
        (!cat || t.categorie === cat) &&
        (!n || normaliser(`${t.terme} ${t.definition} ${t.exemple ?? ""}`).includes(n)),
    );
  }, [q, cat]);

  // Regroupé par catégorie, dans l'ordre du parcours
  const groupes = CATEGORIES.map((c) => ({ c, termes: termes.filter((t) => t.categorie === c) })).filter(
    (g) => g.termes.length > 0,
  );

  // Un lien « voir aussi » remet les filtres à zéro pour que la fiche soit visible
  const allerA = (id: string) => {
    setQ("");
    setCat(null);
    requestAnimationFrame(() => {
      const el = document.getElementById(`lexique-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("ring-1", "ring-[var(--accent)]");
      setTimeout(() => el?.classList.remove("ring-1", "ring-[var(--accent)]"), 1600);
    });
  };

  const puce = (actif: boolean) =>
    `inline-flex min-h-9 items-center rounded-full border px-3.5 text-[12px] transition ${
      actif ? "border-white/60 bg-white text-black" : "border-white/15 text-white/70 hover:border-white/35 hover:text-white"
    }`;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label htmlFor="lexique-recherche" className="sr-only">
          Chercher un mot
        </label>
        <input
          id="lexique-recherche"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Chercher un mot (ex. drawdown, levier, spread)"
          className="h-11 w-full max-w-md rounded-full border border-white/15 bg-white/[0.03] px-5 text-[14px] text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par thème">
          <button type="button" onClick={() => setCat(null)} className={puce(cat === null)} aria-pressed={cat === null}>
            Tout · {LEXIQUE.length}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={puce(cat === c)} aria-pressed={cat === c}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {groupes.length === 0 ? (
        <div className={`${carte} p-6 text-[14px] text-white/60`}>
          Aucun mot trouvé.{" "}
          <Link href="/dashboard/tutrice" className="text-white underline underline-offset-4">
            Pose la question à Xeilosia
          </Link>
          , ta tutrice.
        </div>
      ) : (
        groupes.map((g) => (
          <section key={g.c}>
            <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
              {g.c} <span className="text-white/35">· {g.termes.length}</span>
            </h2>
            <dl className="mt-4 grid gap-3 md:grid-cols-2">
              {g.termes.map((t) => (
                <div key={t.id} id={`lexique-${t.id}`} className={`${carte} scroll-mt-24 p-5 transition`}>
                  <dt className="text-[15px] text-white">{t.terme}</dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-white/60">{t.definition}</dd>
                  {t.exemple && (
                    <dd className="mt-2 text-[12px] leading-relaxed text-white/45">Exemple : {t.exemple}</dd>
                  )}
                  {t.voirAussi && t.voirAussi.length > 0 && (
                    <dd className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-white/40">
                      Voir aussi :
                      {t.voirAussi
                        .filter((id) => TERME[id])
                        .map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => allerA(id)}
                            className="rounded-full border border-white/10 px-2 py-0.5 text-white/65 hover:border-white/30 hover:text-white"
                          >
                            {TERME[id].terme}
                          </button>
                        ))}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </section>
        ))
      )}
    </div>
  );
}
