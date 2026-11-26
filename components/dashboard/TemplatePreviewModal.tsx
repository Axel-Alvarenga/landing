"use client";

interface TemplatePreviewModalProps {
  template: any;
  store: { name: string; logoUrl?: string };
  isSaving: boolean;
  onCancel: () => void;
  onApply: () => void;
}

export function TemplatePreviewModal({
  template,
  store,
  isSaving,
  onCancel,
  onApply,
}: TemplatePreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-[#15181e] border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1a1e26]">
          <h2 className="text-lg font-bold text-white">
            Previsualización: {template.name}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto ${template.bg} ${template.textColor} p-6`}
        >
          <div
            className={`flex justify-between items-center mb-8 pb-4 border-b ${
              template.isLight ? "border-black/10" : "border-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              {store.logoUrl && (
                <img
                  src={store.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="font-bold text-xl">{store.name}</span>
            </div>
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                template.isLight ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              🛒 Carrito (0)
            </button>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">
              Catálogo de {store.name}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`${template.card} rounded-xl overflow-hidden shadow-sm p-4`}
              >
                <div
                  className={`h-32 rounded-lg mb-3 ${
                    template.isLight ? "bg-black/5" : "bg-white/10"
                  }`}
                ></div>
                <h3 className="font-bold text-sm mb-1">Producto de ejemplo</h3>
                <p className={`font-bold ${template.accent}`}>$2500</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#1a1e26] flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={onApply}
            disabled={isSaving}
            className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSaving ? "Aplicando..." : "Aplicar Diseño"}
          </button>
        </div>
      </div>
    </div>
  );
}