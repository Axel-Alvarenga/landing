"use client";

interface ProductModalProps {
  open: boolean;
  editingProductId: string | null;
  newProduct: { name: string; price: string; stock: string; category: string };
  onChangeProduct: (product: {
    name: string;
    price: string;
    stock: string;
    category: string;
  }) => void;
  customFields: any[];
  customFieldValues: Record<string, string>;
  onChangeCustomFieldValue: (fieldId: string, value: string) => void;
  existingCategories: string[];
  onImageChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isUploading: boolean;
}

export function ProductModal({
  open,
  editingProductId,
  newProduct,
  onChangeProduct,
  customFields,
  customFieldValues,
  onChangeCustomFieldValue,
  existingCategories,
  onImageChange,
  onSubmit,
  onClose,
  isUploading,
}: ProductModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#15181e] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {editingProductId ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nombre
            </label>
            <input
              type="text"
              required
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
              value={newProduct.name}
              onChange={(e) =>
                onChangeProduct({ ...newProduct, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Categoría
            </label>
            <input
              type="text"
              list="category-suggestions"
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
              value={newProduct.category}
              onChange={(e) =>
                onChangeProduct({ ...newProduct, category: e.target.value })
              }
            />
            <datalist id="category-suggestions">
              {existingCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Precio
            </label>
            <input
              type="number"
              required
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
              value={newProduct.price}
              onChange={(e) =>
                onChangeProduct({ ...newProduct, price: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Stock
            </label>
            <input
              type="number"
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
              value={newProduct.stock}
              onChange={(e) =>
                onChangeProduct({ ...newProduct, stock: e.target.value })
              }
            />
          </div>

          {customFields.map((field: any) => (
            <div key={field.id}>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {field.name}
                {field.required ? " *" : ""}
              </label>
              {field.type === "SELECT" ? (
                <select
                  required={field.required}
                  value={customFieldValues[field.id] ?? ""}
                  onChange={(e) =>
                    onChangeCustomFieldValue(field.id, e.target.value)
                  }
                  className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {(field.options || []).map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "CHECKBOX" ? (
                <label className="flex items-center gap-2 bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={customFieldValues[field.id] === "true"}
                    onChange={(e) =>
                      onChangeCustomFieldValue(
                        field.id,
                        e.target.checked ? "true" : "false"
                      )
                    }
                  />
                  Sí
                </label>
              ) : (
                <input
                  type={
                    field.type === "NUMBER"
                      ? "number"
                      : field.type === "DATE"
                      ? "date"
                      : "text"
                  }
                  required={field.required}
                  value={customFieldValues[field.id] ?? ""}
                  onChange={(e) =>
                    onChangeCustomFieldValue(field.id, e.target.value)
                  }
                  className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
                />
              )}
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Imagen (Se ajustará a 800x800px)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-black"
              onChange={(e) => onImageChange(e.target.files?.[0] || null)}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-400 disabled:opacity-50"
            >
              {isUploading ? "Procesando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}