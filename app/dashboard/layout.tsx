import Assistante from "@/components/dashboard/Assistante";

// Commun à toutes les pages du tableau de bord : Xeilosia en assistante, en bas à droite.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Assistante />
    </>
  );
}
