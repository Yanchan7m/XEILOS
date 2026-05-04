"use client";

import Image from "next/image";
import { useState } from "react";
import Quiz from "@/components/Quiz";
import Chat from "@/components/Chat";
import type { Archetype } from "@/lib/quiz";

export default function Home() {
  const [archetype, setArchetype] = useState<Archetype | null>(null);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] font-bold text-[#04141d]">
              X
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">XEILOS</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
                Trading school · IA preview
              </div>
            </div>
          </div>
          <a
            href="https://xeilos.fr"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            xeilos.fr ↗
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 sm:py-16">
        <section className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--muted)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
            Aperçu produit · IA &nbsp;×&nbsp; Pédagogie
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Découvre quel{" "}
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] bg-clip-text text-transparent">
              trader
            </span>{" "}
            tu es,
            <br className="hidden sm:block" /> et trouve ta formation.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-[var(--muted)] sm:text-lg">
            Réponds à 6 questions pour révéler ton profil, puis discute en direct
            avec Alex, le coach IA de Xeilos, pour construire ton parcours.
          </p>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          <Quiz onResult={setArchetype} />
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Chat archetype={archetype} />
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          <Feature
            title="Quiz personnalisé"
            text="6 questions, 4 archétypes : scalpeur, swing, investisseur, crypto-native."
          />
          <Feature
            title="Coach IA en continu"
            text="Alex répond en temps réel, adapte ses réponses à ton profil et au catalogue Xeilos."
          />
          <Feature
            title="Reconnu par l’État"
            text="Toutes les formations Xeilos sont certifiantes, RNCP et finançables CPF."
          />
        </section>

        <footer className="mt-16 flex flex-col items-center gap-2 border-t border-[var(--border)]/60 pt-8 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <Image
              src="/agent-face.png"
              alt=""
              width={20}
              height={20}
              className="rounded-full"
            />
            Aperçu interne — pas un service financier.
          </div>
          <div>© {new Date().getFullYear()} Xeilos · Mockup IA</div>
        </footer>
      </main>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-[var(--muted)]">{text}</div>
    </div>
  );
}
