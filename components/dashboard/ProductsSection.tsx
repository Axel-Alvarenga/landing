"use client";

import { Fragment, useState, useMemo, useRef } from "react";

interface ProductsSectionProps {
  products: any[];
  customFields: any[];
  onAdd: () => void;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, delta: number) => void;
  isUpdatingStock: string | null;
  onImportCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isImporting: boolean;
}

export function ProductsSection({
  products,
  customFields,
  onAdd,
  onEdit,
  onDelete,
  onUpdateStock,
  isUpdatingStock,
  onImportCSV,
  isImporting,
}: ProductsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

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

  const handleDownloadTemplate = () => {
    const baseColumns = ["nombre", "precio", "stock", "categoria"];
    const customColumns = customFields.map((f) => f.name.toLowerCase());
    
    const headers = [...baseColumns, ...customColumns].join(",");

    const exampleValues = [
      "Remera Básica", 
      "15000", 
      "10", 
      "Indumentaria",
      ...customColumns.map(() => "Ejemplo")
    ].join(",");

    const csvContent = `${headers}\n${exampleValues}`;
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla-productos-arae.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-[#15181e] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition"
        />
      </div>

      <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Tus Productos</h2>
            <p className="text-xs text-slate-400 mt-1">
              Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadTemplate}
              className="text-xs font-medium text-slate-400 hover:text-white underline transition"
            >
              Descargar plantilla
            </button>
            
            <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={onImportCSV}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 disabled:opacity-50 transition"
            >
              {isImporting ? "Importando..." : "⬆ Importar CSV"}
            </button>

            <button
              onClick={onAdd}
              className="bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400 transition"
            >
              + Agregar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {paginatedProducts.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              {searchQuery ? "No se encontraron productos con ese nombre." : "No tenés productos creados."}
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
                {paginatedProducts.map((p) => {
                  const isExpanded = expandedId === p.id;
                  const hasCustomFields =
                    customFields.length > 0 &&
                    (p.customFieldValues || []).length > 0;
                  const isUpdatingThis = isUpdatingStock === p.id;

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
                            >
                              ▸
                            </button>
                          )}
                        </td>

                        <td className="px-4 md:px-6 py-4">
                          <p className="font-medium text-white">{p.name}</p>
                          
                          <div className="flex md:hidden items-center gap-2 mt-2">
                            <button
                              onClick={() => onUpdateStock(p.id, -1)}
                              disabled={p.stock <= 0 || isUpdatingThis}
                              className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 disabled:opacity-50 text-xs font-bold transition"
                            >
                              -
                            </button>
                            <span className={`text-xs font-medium w-6 text-center ${isUpdatingThis ? "text-slate-500 animate-pulse" : "text-slate-400"}`}>
                              {p.stock}
                            </span>
                            <button
                              onClick={() => onUpdateStock(p.id, 1)}
                              disabled={isUpdatingThis}
                              className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 disabled:opacity-50 text-xs font-bold transition"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="px-4 md:px-6 py-4 text-slate-400 hidden md:table-cell">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs">
                            {p.category || "General"}
                          </span>
                        </td>

                        <td className="px-4 md:px-6 py-4 text-emerald-400 font-medium">
                          ${p.price}
                        </td>

                        <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onUpdateStock(p.id, -1)}
                              disabled={p.stock <= 0 || isUpdatingThis}
                              className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 disabled:opacity-50 text-xs font-bold transition"
                            >
                              -
                            </button>
                            <span className={`w-8 text-center font-medium ${isUpdatingThis ? "text-slate-500 animate-pulse" : "text-slate-300"}`}>
                              {p.stock}
                            </span>
                            <button
                              onClick={() => onUpdateStock(p.id, 1)}
                              disabled={isUpdatingThis}
                              className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 disabled:opacity-50 text-xs font-bold transition"
                            >
                              +
                            </button>
                          </div>
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

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-[#1a1e26]">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-400">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}