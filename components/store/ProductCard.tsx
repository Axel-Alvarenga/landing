"use client";

import type { CustomField, Product } from "@/lib/store/types";
import { formatPrice } from "@/lib/store/format";

interface ProductCardProps {
  product: Product;
  storeCustomFields: CustomField[];
  isLightTheme: boolean;
  themeBg: string;
  themeCard: string;
  themeAccent: string;
  onClick: () => void; // 👈 Nueva prop para abrir el modal
}

export function ProductCard({
  product,
  isLightTheme,
  themeBg,
  themeCard,
  themeAccent,
  onClick,
}: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className={`${themeCard} rounded-2xl overflow-hidden shadow-sm border ${isLightTheme ? "border-black/5" : "border-white/5"} group flex flex-col cursor-pointer transition-transform hover:-translate-y-1`}
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="h-40 md:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className={`h-40 md:h-48 w-full ${themeBg} opacity-30 flex items-center justify-center`}>
          <span className="text-4xl">🛍️</span>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1 block">
          {product.category || "General"}
        </span>
        <h3 className="font-bold text-sm md:text-base mb-1 leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs opacity-70 mb-3">
          {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className={`text-lg font-bold ${themeAccent}`}>
            {formatPrice(product.price)}
          </span>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${isLightTheme ? "bg-black text-white" : "bg-white text-black"}`}>
            Ver detalle
          </span>
        </div>
      </div>
    </div>
  );
}