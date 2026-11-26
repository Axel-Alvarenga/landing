"use client";

import type { CustomField, Product } from "@/lib/store/types";
import { formatCustomFieldValue, formatPrice } from "@/lib/store/format";

interface ProductCardProps {
  product: Product;
  storeCustomFields: CustomField[];
  isLightTheme: boolean;
  themeBg: string;
  themeCard: string;
  themeAccent: string;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({
  product,
  storeCustomFields,
  isLightTheme,
  themeBg,
  themeCard,
  themeAccent,
  onAddToCart,
}: ProductCardProps) {
  const visibleCustomFields = (product.customFieldValues || [])
    .map((cfv) => {
      const field = storeCustomFields.find((f) => f.id === cfv.fieldId);
      return field ? { field, value: cfv.value } : null;
    })
    .filter(
      (item): item is { field: CustomField; value: string } =>
        item !== null && item.value !== ""
    );

  return (
    <div
      className={`${themeCard} rounded-2xl overflow-hidden shadow-sm border ${
        isLightTheme ? "border-black/5" : "border-white/5"
      } group flex flex-col`}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-40 md:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div
          className={`h-40 md:h-48 w-full ${themeBg} opacity-30 flex items-center justify-center`}
        >
          <span className="text-4xl">🛍️</span>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1 block">
            {product.category || "General"}
          </span>

          <h3 className="font-bold text-sm md:text-base mb-1 leading-tight line-clamp-2">
            {product.name}
          </h3>

          {visibleCustomFields.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {visibleCustomFields.map(({ field, value }) => (
                <span
                  key={field.id}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isLightTheme
                      ? "bg-black/5 text-black/70"
                      : "bg-white/10 text-white/80"
                  }`}
                  title={field.name}
                >
                  <span className="opacity-60">{field.name}:</span>{" "}
                  {formatCustomFieldValue(field, value)}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs opacity-70 mb-3">
            {product.stock > 0
              ? `${product.stock} disponibles`
              : "Sin stock"}
          </p>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 mt-auto">
          <span className={`text-lg font-bold ${themeAccent}`}>
            {formatPrice(product.price)}
          </span>

          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`w-full xl:w-auto px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition ${
              isLightTheme
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-white text-black hover:bg-gray-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}