import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Terminal from "@/components/dashboard/pages/terminal/Terminal";

export const metadata = {
  title: "Terminal · Xeilos",
  description: "Entraîne-toi à passer des ordres sur un Nasdaq simulé, en argent fictif, avec stop, objectif et calcul du risque avant chaque trade.",
};

export default function TerminalPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-5">
          <h1 className="sr-only">Terminal d&apos;entraînement, argent fictif</h1>
          <div>
            <Terminal />
          </div>
        </div>
      </main>
    </div>
  );
}
