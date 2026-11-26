"use client";

interface CustomFieldsSectionProps {
  customFields: any[];
  editingFieldId: string | null;
  fieldForm: {
    name: string;
    type: string;
    options: string;
    required: boolean;
    showInStore: boolean;
  };
  savingField: boolean;
  onChangeFieldForm: (form: {
    name: string;
    type: string;
    options: string;
    required: boolean;
    showInStore: boolean;
  }) => void;
  onSave: (e: React.FormEvent) => void;
  onEdit: (field: any) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
}

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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white">
          Campos personalizados
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Creá atributos propios para tus productos, como talle, color, marca o
          vencimiento.
        </p>
      </div>

      <form
        onSubmit={onSave}
        className="bg-[#15181e] border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4"
      >
        <h3 className="font-bold text-white">
          {editingFieldId ? "Editar campo" : "Crear nuevo campo"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nombre del campo
            </label>
            <input
              required
              maxLength={50}
              value={fieldForm.name}
              onChange={(e) =>
                onChangeFieldForm({ ...fieldForm, name: e.target.value })
              }
              placeholder="Ej. Color, Talle, Marca..."
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Tipo de dato
            </label>
            <select
              value={fieldForm.type}
              onChange={(e) =>
                onChangeFieldForm({ ...fieldForm, type: e.target.value })
              }
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
            >
              <option value="TEXT">Texto</option>
              <option value="NUMBER">Número</option>
              <option value="SELECT">Selección</option>
              <option value="DATE">Fecha</option>
              <option value="CHECKBOX">Casilla</option>
            </select>
          </div>
          {fieldForm.type === "SELECT" && (
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Opciones (separadas por coma)
              </label>
              <input
                value={fieldForm.options}
                onChange={(e) =>
                  onChangeFieldForm({ ...fieldForm, options: e.target.value })
                }
                placeholder="Ej. Rojo, Azul, Negro"
                className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white text-sm"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={fieldForm.required}
              onChange={(e) =>
                onChangeFieldForm({ ...fieldForm, required: e.target.checked })
              }
            />
            Campo obligatorio
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={fieldForm.showInStore}
              onChange={(e) =>
                onChangeFieldForm({
                  ...fieldForm,
                  showInStore: e.target.checked,
                })
              }
            />
            Mostrar en tienda pública
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={savingField}
            className="bg-emerald-500 text-black px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-400 disabled:opacity-50"
          >
            {savingField
              ? "Guardando..."
              : editingFieldId
              ? "Guardar cambios"
              : "+ Crear campo"}
          </button>
          {editingFieldId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-5 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="font-bold text-white">
            Tus campos ({customFields.length})
          </h3>
        </div>
        {customFields.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Todavía no creaste campos personalizados.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {customFields.map((field: any) => (
              <div
                key={field.id}
                className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-white">{field.name}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">
                      {(
                        {
                          TEXT: "Texto",
                          NUMBER: "Número",
                          SELECT: "Selección",
                          DATE: "Fecha",
                          CHECKBOX: "Casilla",
                        } as Record<string, string>
                      )[field.type] || field.type}
                    </span>
                    {field.required && (
                      <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded">
                        Obligatorio
                      </span>
                    )}
                    <span
                      className={
                        field.showInStore
                          ? "bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded"
                          : "bg-slate-800 text-slate-400 px-2 py-1 rounded"
                      }
                    >
                      {field.showInStore
                        ? "Visible en tienda"
                        : "Oculto en tienda"}
                    </span>
                  </div>
                  {field.type === "SELECT" && (
                    <p className="text-xs text-slate-500 mt-2">
                      Opciones: {(field.options || []).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(field)}
                    className="text-blue-400 bg-blue-400/10 px-3 py-2 rounded text-xs font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(field.id)}
                    className="text-red-400 bg-red-400/10 px-3 py-2 rounded text-xs font-semibold"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}