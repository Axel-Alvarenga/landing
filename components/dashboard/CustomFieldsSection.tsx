"use client";

import { useState } from "react";
import { CustomFieldModal } from "./CustomFieldModal";

interface CustomFieldsSectionProps {
  customFields: any[];
  editingFieldId: string | null;
  fieldForm: any;
  savingField: boolean;
  onChangeFieldForm: (form: any) => void;
  onSave: (e: React.FormEvent) => void;
  onEdit: (field: any) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  TEXT: "Texto",
  NUMBER: "Número",
  SELECT: "Selección",
  DATE: "Fecha",
  CHECKBOX: "Casilla",
};

export function CustomFieldsSection({
  customFields,
  editingFieldId,
  fieldForm,
  savingField,
  onChangeFieldForm,
  onSave,
  onEdit,
  onDelete,
  onCancelEdit,
}: CustomFieldsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCreate = () => {
    onCancelEdit(); // Limpia cualquier edición previa
    setIsModalOpen(true);
  };

  const handleOpenEdit = (field: any) => {
    onEdit(field);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    onCancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Campos personalizados
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Atributos extra para tus productos (talle, color, vencimiento, etc.).
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="bg-emerald-500 text-black px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-400 transition shrink-0"
        >
          + Nuevo Campo
        </button>
      </div>

      {/* Modal */}
      <CustomFieldModal
        open={isModalOpen}
        editingFieldId={editingFieldId}
        fieldForm={fieldForm}
        onChangeFieldForm={onChangeFieldForm}
        onSubmit={onSave}
        onClose={handleClose}
        saving={savingField}
      />

      {/* Lista de campos */}
      {customFields.length === 0 ? (
        <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🧩</div>
          <h3 className="text-lg font-bold text-white mb-2">
            No tenés campos personalizados
          </h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Creá campos como "Color" o "Talle" para organizar mejor tus productos y mostrarlos en la tienda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customFields.map((field: any) => (
            <div
              key={field.id}
              className="bg-[#15181e] border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white text-lg">{field.name}</h3>
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                    {TYPE_LABELS[field.type] || field.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {field.required && (
                    <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-1 rounded">
                      Obligatorio
                    </span>
                  )}
                  <span className={field.showInStore ? "bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded" : "bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-1 rounded"}>
                    {field.showInStore ? "Visible en tienda" : "Oculto en tienda"}
                  </span>
                </div>

                {field.type === "SELECT" && field.options?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Opciones:</p>
                    <div className="flex flex-wrap gap-1">
                      {field.options.map((opt: string) => (
                        <span key={opt} className="bg-[#0f1115] border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800/50 mt-auto">
                <button
                  onClick={() => handleOpenEdit(field)}
                  className="flex-1 text-blue-400 bg-blue-400/10 py-2 rounded-lg text-xs font-bold hover:bg-blue-400/20 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(field.id)}
                  className="flex-1 text-red-400 bg-red-400/10 py-2 rounded-lg text-xs font-bold hover:bg-red-400/20 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}