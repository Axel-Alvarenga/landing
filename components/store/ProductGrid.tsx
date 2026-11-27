"use client";

import type { CustomField, Product } from "@/lib/store/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  filteredProducts: Product[];
  storeCustomFields: CustomField[];
  isLightTheme: boolean;
  themeBg: string;
  themeCard: string;
  themeAccent: string;
  onProductClick: (product: Product) => void; // 👈 Nueva prop
  onResetFilters: () => void;
}

export function ProductGrid({
  products,
  filteredProducts,
  storeCustomFields,
  isLightTheme,
  themeBg,
  themeCard,
  themeAccent,
  onProductClick,
  onResetFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 opacity-60">
        <p className="text-xl">Próximamente habrá productos disponibles.</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-20 opacity-60">
        <p className="text-xl">No se encontraron productos con esa búsqueda.</p>
        <button onClick={onResetFilters} className="mt-4 underline font-bold">
          Limpiar filtros
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {filteredProducts.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          storeCustomFields={storeCustomFields}
          isLightTheme={isLightTheme}
          themeBg={themeBg}
          themeCard={themeCard}
          themeAccent={themeAccent}
          onClick={() => onProductClick(p)}
        />
      ))}
    </div>
  );
}