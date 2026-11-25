import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Live from "@/components/dashboard/pages/live/Live";

export const metadata = {
  title: "Live · Xeilos",
  description: "Le live YouTube de Xeilos, en direct dans ton espace.",
};

export default function LivePage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-8 sm:py-12 lg:px-10">
          <h1 className="text-[30px] font-semibold tracking-[-0.025em] sm:text-[36px]">
            Le live Xeilos. <span className="text-white/50">En direct sur YouTube.</span>
          </h1>
          <Live />
        </div>
      </main>
    </div>
  );
}
