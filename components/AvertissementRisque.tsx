// Avertissement sur le risque, affiché sur les pages de formation et le tableau de bord.
// Source : AMF, étude sur les clients particuliers de CFD et forex (2009-2012), confirmée depuis par l'ESMA.
export default function AvertissementRisque({ sombre = false }: { sombre?: boolean }) {
  return (
    <p
      className={`mt-10 rounded-2xl border px-4 py-3 text-[12.5px] leading-relaxed ${
        sombre ? "border-white/[0.08] bg-white/[0.02] text-white/50" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
      }`}
    >
      <strong className={sombre ? "text-white/75" : "text-[var(--ink)]"}>Le trading comporte un risque élevé de perte en capital.</strong>{" "}
      Environ 9 particuliers sur 10 perdent de l’argent sur les CFD et le forex (étude AMF). Xeilos est une formation : rien ici
      n’est un conseil d’investissement ni une promesse de gain. Les comptes et chiffres affichés sont fictifs, pour s’entraîner.
    </p>
  );
}
