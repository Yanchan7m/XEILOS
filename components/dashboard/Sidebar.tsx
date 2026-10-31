"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavItem = { label: string; href: string; icon: keyof typeof ICONS; badge?: number };

const SECTIONS: { title?: string; items: NavItem[] }[] = [
  { items: [{ label: "Tableau de bord", href: "/dashboard", icon: "grid" }] },
  {
    title: "Outils",
    items: [
      { label: "Xeilosia, ta tutrice", href: "/demo#chat", icon: "spark" },
      { label: "Contexte de marché", href: "#", icon: "gem" },
      { label: "Terminal", href: "#", icon: "terminal" },
      { label: "Journal de trading", href: "#", icon: "book" },
    ],
  },
  {
    title: "Accompagnement",
    items: [
      { label: "Calendrier", href: "#", icon: "calendar" },
      { label: "Mon suivi", href: "#", icon: "heart", badge: 4 },
      { label: "Communauté", href: "#", icon: "chat" },
      { label: "Formation", href: "/demo", icon: "cap" },
    ],
  },
];

const ICONS = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  gem: "M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l3 16M15 4l-3 16",
  terminal: "M4 5h16v14H4zM8 10l2 2-2 2M12 15h4",
  book: "M4 5a2 2 0 012-2h5v17H6a2 2 0 00-2 2zM20 5a2 2 0 00-2-2h-5v17h5a2 2 0 012 2z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  heart: "M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z",
  chat: "M4 5h12v9H8l-4 3zM16 9h4v9l-3-2h-6v-2",
  cap: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5",
  menu: "M4 7h16M4 12h16M4 17h10",
  close: "M6 6l12 12M18 6L6 18",
  collapse: "M4 4h16v16H4zM9 4v16M15 10l-2 2 2 2",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z",
};

export function Icon({ name, className = "h-4 w-4" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={ICONS[name]} />
    </svg>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  // Menu mobile : bloque le défilement de la page et se ferme avec Échap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Barre du haut (téléphone et tablette) */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0b0b0d]/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/xeilos-logo.jpeg" alt="Xeilos" width={28} height={28} className="h-7 w-7 rounded-lg object-contain" />
          <span className="text-[13px] font-medium uppercase tracking-[0.3em] text-white/90">Xeilos</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 hover:text-white"
          aria-label="Ouvrir le menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </header>

      {/* Tiroir mobile */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-white/[0.06] bg-[#0d0d10] transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Panel collapsed={false} onClose={() => setOpen(false)} />
      </aside>

      {/* Barre latérale (ordinateur) */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0d10] transition-[width] duration-300 lg:flex ${
          collapsed ? "w-[76px]" : "w-[250px]"
        }`}
      >
        <Panel collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
    </>
  );
}

function Panel({
  collapsed,
  setCollapsed,
  onClose,
}: {
  collapsed: boolean;
  setCollapsed?: (v: boolean) => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <Image src="/xeilos-logo.jpeg" alt="Xeilos" width={32} height={32} className="h-8 w-8 shrink-0 rounded-lg object-contain" />
          {!collapsed && <span className="text-sm font-medium uppercase tracking-[0.3em] text-white/90">Xeilos</span>}
        </Link>
        {onClose ? (
          <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="Fermer le menu">
            <Icon name="close" className="h-5 w-5" />
          </button>
        ) : (
          !collapsed && (
            <button onClick={() => setCollapsed?.(true)} className="text-white/40 hover:text-white" aria-label="Réduire le menu">
              <Icon name="collapse" />
            </button>
          )
        )}
      </div>

      {collapsed ? (
        <button onClick={() => setCollapsed?.(false)} className="mx-auto mt-4 text-white/40 hover:text-white" aria-label="Déplier le menu">
          <Icon name="collapse" />
        </button>
      ) : (
        <div className="mx-3 mt-6 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-strong)] text-sm font-semibold text-white">
            X
            <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d0d10] bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] text-white">Compte Xeilos · Challenge</div>
            <div className="text-[11px] text-white/45">Prop firm · Démo</div>
          </div>
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M8 10l4-4 4 4M8 14l4 4 4-4" />
          </svg>
        </div>
      )}

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto px-3">
        {SECTIONS.map((s, i) => (
          <div key={i}>
            {s.title && !collapsed && (
              <div className="mb-2 flex items-center gap-3 px-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
                {s.title}
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>
            )}
            <ul className="space-y-0.5">
              {s.items.map((item) => {
                const active = item.href === "/dashboard";
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition ${
                        active
                          ? "border border-white/[0.08] bg-white/[0.05] text-white"
                          : "border border-transparent text-white/65 hover:bg-white/[0.03] hover:text-white"
                      } ${collapsed ? "justify-center" : ""}`}
                    >
                      {active && <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[var(--accent)]" />}
                      <Icon name={item.icon} />
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                      {item.badge && !collapsed && (
                        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-4 flex items-center gap-3 border-t border-white/[0.06] px-2 pt-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm text-white">
          Y
          <span className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full border-2 border-[#0d0d10] bg-emerald-400" />
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] text-white">Yanis</div>
              <div className="text-[11px] text-white/45">Élève · Xeilos</div>
            </div>
            <button className="text-white/40 hover:text-white" aria-label="Paramètres">
              <Icon name="settings" />
            </button>
          </>
        )}
      </div>
    </>
  );
}
