"use client";

import type { DashboardTab } from "@/hooks/dashboard/useDashboard";

interface MobileNavProps {
  activeTab: DashboardTab;
  onChangeTab: (tab: DashboardTab) => void;
  onLogout: () => void;
  pendingOrdersCount?: number; // 👈 NUEVA PROP
}

const TABS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: "resumen", label: "Resumen", icon: "📊" },
  { id: "productos", label: "Productos", icon: "📦" },
  { id: "campos", label: "Campos", icon: "🧩" },
  { id: "pedidos", label: "Pedidos", icon: "🛒" },
  { id: "ajustes", label: "Ajustes", icon: "⚙️" },
];

export function MobileNav({ 
  activeTab, 
  onChangeTab, 
  onLogout,
  pendingOrdersCount = 0 // 👈 VALOR POR DEFECTO
}: MobileNavProps) {
  return (
    <>
      <div className="md:hidden bg-[#15181e] border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-30">
        <h2 className="text-xl font-bold text-white">ARAE</h2>
        <button onClick={onLogout} className="text-red-400 text-sm font-medium">
          Salir
        </button>
      </div>

      <div className="md:hidden fixed bottom-0 w-full bg-[#15181e] border-t border-slate-800 flex justify-around p-3 z-40 pb-safe">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center gap-1 relative ${
              activeTab === tab.id ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-[10px]">{tab.label}</span>
            
            {/* 👇 BADGE ROJO MÓVIL */}
            {tab.id === "pedidos" && pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {pendingOrdersCount > 9 ? "9+" : pendingOrdersCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}