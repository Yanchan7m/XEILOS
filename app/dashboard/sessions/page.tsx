import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Sessions from "@/components/dashboard/pages/sessions/Sessions";

export const metadata = {
  title: "Mes sessions · Xeilos",
  description: "Tes sessions de scalping et leurs comptes rendus.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function SessionsPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Mes sessions</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Chaque session, son compte rendu.<br />
            <span className="text-white/50">Pour voir ce qui marche, et ce qui coince.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Retrouve toutes tes sessions de scalping, leur P&amp;L et ton compte rendu (ressenti, plan, émotion, note). Les mêmes que dans le Journal Axone.
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <Sessions />
          </div>
        </div>
      </main>
    </div>
  );
}
