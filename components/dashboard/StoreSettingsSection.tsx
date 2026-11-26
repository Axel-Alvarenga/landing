"use client";

import { allTemplates } from "@/lib/templates";

interface StoreSettingsSectionProps {
  store: any;
  logoFile: File | null;
  isUploadingLogo: boolean;
  selectedTemplate: string;
  previewTemplate: any;
  isSavingTemplate: boolean;
  onLogoFileChange: (file: File | null) => void;
  onUploadLogo: () => void;
  onPreviewTemplate: (template: any) => void;
}

export function StoreSettingsSection({
  store,
  logoFile,
  isUploadingLogo,
  selectedTemplate,
  previewTemplate,
  isSavingTemplate,
  onLogoFileChange,
  onUploadLogo,
  onPreviewTemplate,
}: StoreSettingsSectionProps) {
  return (
    <div className="space-y-8">
      {/* ESTADO DE SUSCRIPCIÓN */}
      {store.subscription && (
        <div className="bg-[#15181e] border border-slate-800 rounded-xl p-5">
          {store.subscription.status === "TRIAL" ? (
            <>
              <p className="text-emerald-400 font-bold">
                🎁 Período de prueba gratuito
              </p>
              <p className="text-slate-300 text-sm mt-2">
                Te quedan {store.subscription.daysRemaining} días de prueba.
              </p>
            </>
          ) : store.subscription.status === "PRO" ? (
            <>
              <p className="text-emerald-400 font-bold">⭐ Plan Pro activo</p>
              <p className="text-slate-300 text-sm mt-2">
                Vencimiento:{" "}
                {new Date(store.subscription.expiresAt).toLocaleDateString(
                  "es-PY"
                )}
              </p>
            </>
          ) : null}
        </div>
      )}

      {/* LOGO */}
      <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-2">
          Logo de la tienda
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Subí una imagen cuadrada. Recomendamos 500x500 píxeles (se ajustará
          automáticamente).
        </p>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-[#0f1115] border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-600 text-xs text-center p-2">
                Sin logo
              </span>
            )}
          </div>

          <div className="flex-1 w-full space-y-3">
            <input
              type="file"
              accept="image/*"
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-black"
              onChange={(e) => onLogoFileChange(e.target.files?.[0] || null)}
            />
            <button
              onClick={onUploadLogo}
              disabled={!logoFile || isUploadingLogo}
              className="bg-emerald-500 text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400 disabled:opacity-50"
            >
              {isUploadingLogo ? "Subiendo..." : "Actualizar Logo"}
            </button>
          </div>
        </div>
      </div>

      {/* DISEÑO */}
      <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-2">
          Diseño de tu tienda
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Elegí un diseño. Hacé clic en uno para previsualizarlo antes de
          aplicarlo.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => onPreviewTemplate(t)}
              className={`relative border-2 rounded-xl overflow-hidden transition-all duration-200 group text-left ${
                selectedTemplate === t.id
                  ? "border-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/20"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className={`h-24 p-3 flex flex-col ${t.color}`}>
                <div
                  className={`font-bold text-[10px] truncate ${t.textColor}`}
                >
                  {store.name}
                </div>
                <div className="flex gap-1 mt-auto">
                  <div
                    className={`w-6 h-6 rounded opacity-30 ${t.textColor.replace(
                      "text-",
                      "bg-"
                    )}`}
                  ></div>
                  <div
                    className={`w-6 h-6 rounded opacity-30 ${t.textColor.replace(
                      "text-",
                      "bg-"
                    )}`}
                  ></div>
                </div>
              </div>

              <div className="bg-[#0f1115] p-2 text-center border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-medium text-slate-300 truncate">
                  {t.name}
                </span>
                {selectedTemplate === t.id && (
                  <span className="text-emerald-500 text-xs font-bold">✓</span>
                )}
              </div>

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">
                  Previsualizar
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}