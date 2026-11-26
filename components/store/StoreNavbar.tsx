"use client";

import type { Store } from "@/lib/store/types";

interface StoreNavbarProps {
  store: Store;
  isLightTheme: boolean;
  navClass: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalItems: number;
  onOpenCart: () => void;
}

export function StoreNavbar({
  store,
  isLightTheme,
  navClass,
  searchQuery,
  onSearchChange,
  totalItems,
  onOpenCart,
}: StoreNavbarProps) {
  return (
    <nav
      className={`w-full ${navClass} backdrop-blur-md border-b ${
        isLightTheme ? "border-black/10" : "border-white/10"
      } sticky top-0 z-40`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          {store.logoUrl && (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shadow-sm border border-black/10 bg-white/50"
            />
          )}
          <span className="font-bold text-lg md:text-xl truncate">
            {store.name}
          </span>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-auto relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar productos..."
            className={`w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none transition ${
              isLightTheme
                ? "bg-black/5 focus:bg-black/10 placeholder-black/50"
                : "bg-white/10 focus:bg-white/20 placeholder-white/50"
            }`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-sm font-medium shrink-0">
          <a
            href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-70 transition hidden lg:block"
          >
            Contacto
          </a>

          <button
            onClick={onOpenCart}
            className={`px-3 md:px-4 py-2 rounded-full font-bold flex items-center gap-2 transition hover:opacity-80 ${
              isLightTheme ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            🛒 <span className="hidden md:inline">Carrito</span> ({totalItems})
          </button>
        </div>
      </div>
    </nav>
  );
}