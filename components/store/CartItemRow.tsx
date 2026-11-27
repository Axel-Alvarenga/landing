"use client";

import type { CartItem } from "@/lib/store/types";
import { formatPrice } from "@/lib/store/format";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemove: (cartItemId: string) => void;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="flex gap-4 items-start border-b pb-4">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">🛍️</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>

        {/* 👇 Mostramos las variantes elegidas (Color: Rojo) */}
        {item.selectedOptions && item.selectedOptions.length > 0 && (
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {item.selectedOptions.map((o) => `${o.fieldName}: ${o.value}`).join(" · ")}
          </p>
        )}

        <p className="text-emerald-600 font-bold mt-1">
          {formatPrice(item.price)}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.cartItemId, -1)}
            className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100"
          >
            -
          </button>
          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.cartItemId, 1)}
            disabled={item.quantity >= item.stock}
            className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={() => onRemove(item.cartItemId)}
        className="text-red-400 hover:text-red-600 text-sm p-2 shrink-0"
      >
        Eliminar
      </button>
    </div>
  );
}