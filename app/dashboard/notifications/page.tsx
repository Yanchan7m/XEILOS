import Sidebar from "@/components/dashboard/Sidebar";
import { Fond } from "@/components/dashboard/Blocs";
import Notifications from "@/components/dashboard/pages/notifications/Notifications";

export const metadata = {
  title: "Notifications · Xeilos",
  description: "Active les notifications sur ton téléphone et écris tes propres phrases pour les rappels du mode scalping.",
};

const serif = { className: "font-semibold tracking-[-0.025em]" }; // titres en police droite, sans serif ni italique

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      <Fond />
      <Sidebar />

      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">Notifications</div>
          <h1 className={`${serif.className} mt-3 text-[30px] leading-[1.1] sm:text-[38px]`}>
            Tes rappels, avec tes mots.<br />
            <span className="text-white/50">Sur ton téléphone, même app fermée.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Ajoute Xeilos à ton écran d&apos;accueil, active les notifications, puis écris les phrases que tu veux recevoir
            pendant tes sessions de scalping.
          </p>

          <div className="mt-10 h-px bg-white/[0.08]" />

          <div className="mt-10">
            <Notifications />
          </div>
        </div>
      </main>
    </div>
  );
}
