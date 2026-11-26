"use client";

import Link from "next/link";
import type { DashboardTab } from "@/hooks/dashboard/useDashboard";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onChangeTab: (tab: DashboardTab) => void;
  onLogout: () => void;
  pendingOrdersCount?: number; // 👈 NUEVA PROP
}

const TABS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: "resumen", label: "Resumen", icon: "📊" },
  { id: "productos", label: "Productos", icon: "📦" },
  { id: "campos", label: "Campos personalizados", icon: "🧩" },
  { id: "pedidos", label: "Pedidos", icon: "🛒" },
  { id: "ajustes", label: "Ajustes", icon: "⚙️" },
];

export function DashboardSidebar({ 
  activeTab, 
  onChangeTab, 
  onLogout,
  pendingOrdersCount = 0 // 👈 VALOR POR DEFECTO
}: DashboardSidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-[#15181e] border-r border-slate-800 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white tracking-tighter">ARAE</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition ${
              activeTab === tab.id
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-[#1a1e26] text-slate-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <span>{tab.icon}</span> {tab.label}
            </div>
            {/* 👇 BADGE ROJO */}
            {tab.id === "pedidos" && pendingOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-[#0f1115] border border-slate-700 text-slate-300 py-2.5 rounded-lg text-sm hover:bg-slate-800"
        >
          ← Salir al inicio
        </Link>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 py-2.5 rounded-lg text-sm hover:bg-red-500/20"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}