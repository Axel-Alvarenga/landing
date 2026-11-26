"use client";

import { Fragment, useState } from "react";

interface ProductsSectionProps {
  products: any[];
  customFields: any[];
  onAdd: () => void;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

export function ProductsSection({
  products,
  customFields,
  onAdd,
  onEdit,
  onDelete,
}: ProductsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getFieldValue = (product: any, fieldId: string) => {
    const match = (product.customFieldValues || []).find(
      (v: any) => v.fieldId === fieldId
    );
    return match?.value ?? "";
  };

  const formatFieldValue = (field: any, value: string) => {
    if (!value) return "—";
    if (field.type === "CHECKBOX") return value === "true" ? "Sí" : "No";
    if (field.type === "DATE") {
      const d = new Date(value);
      return Number.isNaN(d.getTime())
        ? value
        : d.toLocaleDateString("es-PY");
    }
    return value;
  };

  return (
    <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Tus Productos</h2>
        <button
          onClick={onAdd}
          className="hidden md:block bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400"
        >
          + Agregar
        </button>
      </div>

      <div className="overflow-x-auto">
        {products.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No tenés productos.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-[#1a1e26]">
              <tr>
                <th className="w-8 px-2 py-3"></th>
                <th className="px-4 md:px-6 py-3 font-medium">Producto</th>
                <th className="px-4 md:px-6 py-3 font-medium hidden md:table-cell">
                  Categoría
                </th>
                <th className="px-4 md:px-6 py-3 font-medium">Precio</th>
                <th className="px-4 md:px-6 py-3 font-medium hidden md:table-cell">
                  Stock
                </th>
                <th className="px-4 md:px-6 py-3 font-medium text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {products.map((p) => {
                const isExpanded = expandedId === p.id;
                const hasCustomFields =
                  customFields.length > 0 &&
                  (p.customFieldValues || []).length > 0;

                return (
                  <Fragment key={p.id}>
                    <tr className="hover:bg-[#1a1e26]/50 transition">
                      <td className="px-2 py-4">
                        {hasCustomFields && (
                          <button
                            onClick={() => toggleExpand(p.id)}
                            className={`text-slate-400 hover:text-emerald-400 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                            title={
                              isExpanded
                                ? "Ocultar campos"
                                : "Ver campos personalizados"
                            }
                          >
                            ▸
                          </button>
                        )}
                      </td>

                      <td className="px-4 md:px-6 py-4 font-medium text-white">
                        {p.name}
                      </td>

                      <td className="px-4 md:px-6 py-4 text-slate-400 hidden md:table-cell">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs">
                          {p.category || "General"}
                        </span>
                      </td>

                      <td className="px-4 md:px-6 py-4 text-emerald-400 font-medium">
                        ${p.price}
                      </td>

                      <td className="px-4 md:px-6 py-4 text-slate-400 hidden md:table-cell">
                        {p.stock} u.
                      </td>

                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <button
                            onClick={() => onEdit(p)}
                            className="text-blue-400 font-medium text-[10px] md:text-xs bg-blue-400/10 px-2 md:px-3 py-1.5 rounded"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onDelete(p.id)}
                            className="text-red-400 font-medium text-[10px] md:text-xs bg-red-400/10 px-2 md:px-3 py-1.5 rounded"
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-[#0f1115]">
                        <td colSpan={6} className="px-6 py-4">
                          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold mb-3">
                            Campos personalizados
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {customFields.map((field) => (
                              <div
                                key={field.id}
                                className="bg-[#15181e] border border-slate-800 rounded-lg p-3"
                              >
                                <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold mb-1">
                                  {field.name}
                                </p>
                                <p className="text-sm text-slate-200 break-words">
                                  {formatFieldValue(
                                    field,
                                    getFieldValue(p, field.id)
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}