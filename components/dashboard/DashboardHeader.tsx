"use client";

import Link from "next/link";

interface DashboardHeaderProps {
  storeName: string;
  storeSlug: string;
  onCopyLink: () => void;
}

export function DashboardHeader({ storeName, storeSlug, onCopyLink }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Hola, {storeName} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">
          Acá tenés el resumen de tu tienda hoy.
        </p>
      </div>

      <Link
        href={`/t/${storeSlug}`}
        target="_blank"
        className="bg-white text-black px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-bold hover:bg-slate-200 transition inline-flex items-center gap-2 text-sm shadow-lg w-fit"
      >
        Ver mi tienda ↗
      </Link>

      <button
        onClick={onCopyLink}
        className="bg-[#15181e] border border-slate-700 text-slate-200 px-4 py-2.5 md:px-5 md:py-3 rounded-lg font-bold hover:bg-slate-800 transition text-sm w-fit"
      >
        Copiar enlace
      </button>
    </header>
  );
}