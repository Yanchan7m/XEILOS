// Accès visiteur : constantes partagées serveur/client (voir components/Profil.tsx).
export const COOKIE_VISITEUR = "xeilos_visiteur";
export const PRENOM = "Yanis";

// « Salut Yanis » pour l'élève, « Bonjour » pour un visiteur.
export function salut(visiteur: boolean) {
  return visiteur ? "Bonjour" : `Salut ${PRENOM}`;
}
