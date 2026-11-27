"use client";

import { useState } from "react";
import type { CustomField, Product, SelectedOption } from "@/lib/store/types";
import { formatPrice } from "@/lib/store/format";

interface ProductDetailModalProps {
  product: Product | null;
  storeCustomFields: CustomField[];
  isLightTheme: boolean;
  themeBg: string;
  themeCard: string;
  themeAccent: string;
  onClose: () => void;
  onAddToCart: (product: Product, selectedOptions: SelectedOption[]) => void;
}

export function ProductDetailModal({
  product,
  storeCustomFields,
  isLightTheme,
  themeBg,
  themeCard,
  themeAccent,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  // Filtramos los campos que son de tipo SELECT y tienen valores
  const variantFields = storeCustomFields.filter(
    (f) => f.type === "SELECT" && (product.customFieldValues || []).some((v) => v.fieldId === f.id)
  );

  const getFieldValues = (fieldId: string) => {
    const cfv = (product.customFieldValues || []).find((v) => v.fieldId === fieldId);
    return cfv?.value ? cfv.value.split(",").filter(Boolean) : [];
  };

  const handleOptionChange = (fieldId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Verificamos si todas las opciones obligatorias están seleccionadas
  const isReadyToBuy = variantFields.every(
    (f) => !f.required || selectedOptions[f.id]
  );

  const handleAddClick = () => {
    const optionsArray: SelectedOption[] = variantFields.map((f) => ({
      fieldId: f.id,
      fieldName: f.name,
      value: selectedOptions[f.id] || "",
    })).filter((o) => o.value !== "");

    // Como el carrito actual solo suma 1, hacemos un bucle para agregar la cantidad elegida
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, optionsArray);
    }
    
    onClose();
    setQuantity(1);
    setSelectedOptions({});
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className={`${themeCard} border ${isLightTheme ? "border-black/10" : "border-white/10"} rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]`}>
        
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 md:relative md:top-auto md:right-auto md:order-last md:m-4 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-white z-10`}
        >
          ×
        </button>

        {/* Imagen */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full ${themeBg} opacity-30 flex items-center justify-center`}>
              <span className="text-6xl">🛍️</span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">
            {product.category || "General"}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h2>
          <p className={`text-2xl font-bold ${themeAccent} mb-6`}>
            {formatPrice(product.price)}
          </p>

          <p className="text-sm opacity-70 mb-6">
            {product.stock > 0
              ? `Stock disponible: ${product.stock} unidades`
              : "Sin stock por el momento"}
          </p>

          {/* Opciones */}
          {variantFields.length > 0 && (
            <div className="space-y-4 mb-6">
              {variantFields.map((field) => {
                const options = getFieldValues(field.id);
                if (options.length === 0) return null;

                return (
                  <div key={field.id}>
                    <p className="text-sm font-bold mb-2">
                      {field.name}:{" "}
                      <span className="font-normal opacity-70">
                        {selectedOptions[field.id] || "Seleccioná una opción"}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => {
                        const isSelected = selectedOptions[field.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleOptionChange(field.id, opt)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                              isSelected
                                ? `border-current ${themeAccent} bg-current/10`
                                : isLightTheme
                                ? "border-black/20 text-black/70 hover:border-black/50"
                                : "border-white/20 text-white/70 hover:border-white/50"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Controles de Cantidad y Botón */}
          <div className="mt-auto pt-6 border-t border-current/10">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-bold">Cantidad:</span>
              <div className="flex items-center gap-3 border rounded-lg px-2 py-1 border-current/20">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-6 h-6 flex items-center justify-center hover:opacity-50 disabled:opacity-20"
                >
                  -
                </button>
                <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-6 h-6 flex items-center justify-center hover:opacity-50 disabled:opacity-20"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddClick}
              disabled={product.stock === 0 || !isReadyToBuy}
              className={`w-full py-3 rounded-xl font-bold text-lg transition ${
                isLightTheme ? "bg-black text-white hover:bg-gray-800" : "bg-white text-black hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Agregar al carrito
            </button>
            {!isReadyToBuy && (
              <p className="text-xs text-red-400 text-center mt-2">
                Por favor, seleccioná todas las opciones.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}