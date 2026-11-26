"use client";

import type { CartItem, CustomField } from "@/lib/store/types";
import { formatCustomFieldValue, formatPrice } from "@/lib/store/format";

interface CartItemRowProps {
  item: CartItem;
  storeCustomFields: CustomField[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({
  item,
  storeCustomFields,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const itemCustomFields = (item.customFieldValues || [])
    .map((cfv) => {
      const field = storeCustomFields.find((f) => f.id === cfv.fieldId);
      return field ? { field, value: cfv.value } : null;
    })
    .filter(
      (entry): entry is { field: CustomField; value: string } =>
        entry !== null && entry.value !== ""
    );

  return (
    <div className="flex gap-4 items-start border-b pb-4">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl">🛍️</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>

        {itemCustomFields.length > 0 && (
          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
            {itemCustomFields
              .map(
                ({ field, value }) =>
                  `${field.name}: ${formatCustomFieldValue(field, value)}`
              )
              .join(" · ")}
          </p>
        )}

        <p className="text-emerald-600 font-bold">
          {formatPrice(item.price)}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.id, -1)}
            className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100"
          >
            -
          </button>
          <span className="text-sm font-medium w-4 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, 1)}
            disabled={item.quantity >= item.stock}
            className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="text-red-400 hover:text-red-600 text-sm p-2 shrink-0"
      >
        Eliminar
      </button>
    </div>
  );
}