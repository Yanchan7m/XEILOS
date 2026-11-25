"use client";

// Accès visiteur : pour faire tester l'app sans nom ni prénom à l'écran.
// Le lien /visiteur pose un cookie ; le layout le lit et le transmet ici.
// /visiteur?sortir le retire.
import { createContext, useContext, type ReactNode } from "react";

import { salut } from "@/lib/profil";

const VisiteurContext = createContext(false);

export function ProfilProvider({ visiteur, children }: { visiteur: boolean; children: ReactNode }) {
  return <VisiteurContext.Provider value={visiteur}>{children}</VisiteurContext.Provider>;
}

export function useVisiteur() {
  return useContext(VisiteurContext);
}

export function Salut() {
  return <>{salut(useVisiteur())}</>;
}
