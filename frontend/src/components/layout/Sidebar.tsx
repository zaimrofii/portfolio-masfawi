import type { LucideIcon } from "lucide-react";
import {
  Archive,
  ClipboardList,
  Clock,
  LayoutDashboard,
  Plus,
  Scissors,
  Settings,
  Shirt,
  Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { cn } from "@/lib/cn";

interface ItemMenu {
  to: string;
  label: string;
  Ikon: LucideIcon;
  end?: boolean;
}

const MENU: ItemMenu[] = [
  { to: "/", label: "Dashboard", Ikon: LayoutDashboard, end: true },
  { to: "/pesanan/baru", label: "Pesanan Baru", Ikon: Plus },
  { to: "/pesanan", label: "Daftar Pesanan", Ikon: ClipboardList },
  { to: "/antrian", label: "Antrian Produksi", Ikon: Clock },
  { to: "/arsip", label: "Arsip", Ikon: Archive },
];

const MASTER: ItemMenu[] = [
  { to: "/master/kain", label: "Kain", Ikon: Shirt },
  { to: "/master/customer", label: "Customer", Ikon: Users },
];

const DASAR_ITEM =
  "flex h-9 xl:h-12 items-center gap-3 rounded-lg px-3 text-sm xl:text-base  text-foreground transition hover:bg-muted";

export function Sidebar() {
  return (
    <aside className="glass-card sticky top-0 flex h-screen w-[210px] xl:w-[220px] shrink-0 flex-col border-r border-border p-4 no-print">
      <div className="mb-6 flex items-center gap-2 px-2 text-lg font-bold text-blue-900">
        <Scissors size={20} className="shrink-0" aria-hidden="true" />
        Penjahit App
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {MENU.map(({ to, label, Ikon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(DASAR_ITEM, isActive && "bg-muted/60 font-medium")
            }
          >
            <Ikon
              size={20}
              className="shrink-0 text-blue-400"
              aria-hidden="true"
            />
            {label}
          </NavLink>
        ))}

        <p className="mt-4 flex items-center gap-2 px-3 text-sm font-medium text-blue-400 border-b border-blue-200 pb-1">
          <Settings size={16} className="shrink-0" aria-hidden="true" />
          Master Data
        </p>

        {MASTER.map(({ to, label, Ikon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(DASAR_ITEM, "pl-8", isActive && "bg-muted/60 font-medium")
            }
          >
            <Ikon
              size={20}
              className="shrink-0 text-blue-400"
              aria-hidden="true"
            />
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="mt-4 px-2 text-sm text-muted-foreground">v0.1 — Fase 4</p>
    </aside>
  );
}
