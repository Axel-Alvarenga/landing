"use client";

import { useState } from "react";

interface CustomFieldModalProps {
  open: boolean;
  editingFieldId: string | null;
  fieldForm: any;
  onChangeFieldForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
}

const FIELD_TYPES = [
  { id: "TEXT", label: "Texto", icon: "📝", desc: "Nombres, marcas, etc." },
  { id: "NUMBER", label: "Número", icon: "🔢", desc: "Peso, talle, año." },
  { id: "SELECT", label: "Selección", icon: "🔽", desc: "Opciones fijas (Color)." },
  { id: "DATE", label: "Fecha", icon: "📅", desc: "Vencimiento, ingreso." },
  { id: "CHECKBOX", label: "Casilla", icon: "☑️", desc: "Sí o No." },
];

export function CustomFieldModal({
  open,
  editingFieldId,
  fieldForm,
  onChangeFieldForm,
  onSubmit,
  onClose,
  saving,
}: CustomFieldModalProps) {
  if (!open) return null;

  const isSelect = fieldForm.type === "SELECT";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#15181e] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#1a1e26]">
          <h2 className="text-lg font-bold text-white">
            {editingFieldId ? "Editar Campo" : "Nuevo Campo Personalizado"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Nombre del campo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Nombre del campo
            </label>
            <input
              required
              maxLength={50}
              value={fieldForm.name}
              onChange={(e) => onChangeFieldForm({ ...fieldForm, name: e.target.value })}
              placeholder="Ej. Color, Talle, Marca..."
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Selector visual de tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de dato
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FIELD_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChangeFieldForm({ ...fieldForm, type: t.id })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition text-center ${
                    fieldForm.type === t.id
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-700 bg-[#0f1115] text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className="text-2xl mb-1">{t.icon}</span>
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              {FIELD_TYPES.find((t) => t.id === fieldForm.type)?.desc}
            </p>
          </div>

          {/* Opciones si es SELECT */}
          {isSelect && (
            <div className="bg-[#0f1115] p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-medium text-emerald-400 mb-2">
                Opciones disponibles (separadas por coma)
              </label>
              <input
                required
                value={fieldForm.options}
                onChange={(e) => onChangeFieldForm({ ...fieldForm, options: e.target.value })}
                placeholder="Ej: Rojo, Azul, Verde, Negro"
                className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none"
              />
            </div>
          )}

          {/* Toggles de configuración */}
          <div className="space-y-3 bg-[#0f1115] p-4 rounded-xl border border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Obligatorio</p>
                <p className="text-[11px] text-slate-500">El vendedor no puede guardar un producto sin llenar esto.</p>
              </div>
              <input
                type="checkbox"
                checked={fieldForm.required}
                onChange={(e) => onChangeFieldForm({ ...fieldForm, required: e.target.checked })}
                className="w-5 h-5 accent-emerald-500"
              />
            </label>
            
            <div className="h-px bg-slate-800"></div>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Mostrar en tienda</p>
                <p className="text-[11px] text-slate-500">Los clientes verán esta información en el catálogo.</p>
              </div>
              <input
                type="checkbox"
                checked={fieldForm.showInStore}
                onChange={(e) => onChangeFieldForm({ ...fieldForm, showInStore: e.target.checked })}
                className="w-5 h-5 accent-emerald-500"
              />
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !fieldForm.name.trim()}
              className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-400 disabled:opacity-50 transition"
            >
              {saving ? "Guardando..." : "Guardar Campo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}