"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import Chat from "@/components/Chat";

// Le chat utilise les variables du thème clair : on les passe en sombre ici.
const sombre = {
  "--surface": "#141417",
  "--surface-2": "rgba(255,255,255,0.06)",
  "--border": "rgba(255,255,255,0.12)",
  "--foreground": "#ffffff",
  "--muted": "rgba(255,255,255,0.6)",
} as CSSProperties;

/**
 * Xeilosia en assistante : une bulle en bas à droite, sur toutes les pages du
 * tableau de bord. Un clic ouvre le chat dans un panneau ; la conversation est
 * gardée quand on le referme ou qu'on change de page.
 */
export default function Assistante() {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [dejaOuvert, setDejaOuvert] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    const echap = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [ouvert]);

  // Sur sa page plein écran, la bulle ferait doublon.
  if (chemin === "/dashboard/tutrice") return null;

  const basculer = () => {
    setOuvert((o) => !o);
    setDejaOuvert(true);
  };

  return (
    <>
      {dejaOuvert && (
        <div
          role="dialog"
          aria-label="Xeilosia, ton assistante"
          aria-hidden={!ouvert}
          className={`fixed bottom-24 right-4 z-40 w-[400px] max-w-[calc(100vw-2rem)] origin-bottom-right transition duration-200 sm:right-6 ${
            ouvert ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          }`}
          style={sombre}
        >
          <div className="h-[min(600px,calc(100dvh-8rem))] text-white shadow-2xl shadow-black/60">
            <Chat hauteur="h-full" />
          </div>
          <div className="mt-2 flex justify-end gap-2 text-[12px]">
            <Link
              href="/dashboard/tutrice"
              onClick={() => setOuvert(false)}
              className="rounded-full border border-white/15 bg-[#141417] px-3 py-1.5 text-white/75 hover:text-white"
            >
              Agrandir ↗
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={basculer}
        aria-expanded={ouvert}
        aria-label={ouvert ? "Fermer Xeilosia" : "Ouvrir Xeilosia, ton assistante"}
        className="agent-ring fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black sm:bottom-6 sm:right-6"
      >
        {ouvert ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <Image src="/xeilosia-avatar.png" alt="" width={56} height={56} className="h-full w-full object-cover" />
        )}
      </button>
    </>
  );
}
