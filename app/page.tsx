"use client";
import { useState } from "react";

const categories = ["Gastronomía", "Remeras y Jeans", "Relojes", "Zapatos", "Ropa Interior"];

export default function RegistroPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", category: "", email: "", whatsapp: "" });

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen pt-24 px-4 max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm text-slate-500">
          <span>Paso {step} de 4</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full">
          <div className="h-2 bg-emerald-600 rounded-full transition-all" style={{ width: `${step * 25}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Datos de tu negocio</h1>
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Nombre de tu tienda"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="w-full border rounded-lg p-3"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Elegí una categoría</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Datos de contacto</h1>
          <input className="w-full border rounded-lg p-3" placeholder="Email" type="email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full border rounded-lg p-3" placeholder="WhatsApp"
            value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Elegí tu diseño</h1>
          <p className="text-slate-600">Templates según tu categoría: <b>{form.category}</b></p>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((t) => (
              <div key={t} className="border-2 rounded-xl h-32 flex items-center justify-center hover:border-emerald-500 cursor-pointer">
                Template {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">¡Todo listo! 🎉</h1>
          <p className="text-slate-600">
            Tu tienda <b>{form.name}</b> de categoría <b>{form.category}</b> está lista para crearse.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-1">
            <p>📧 {form.email}</p>
            <p>📱 {form.whatsapp}</p>
            <p>🔗 tiendafacil.com/t/{form.name.toLowerCase().replace(/\s/g, "-")}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        {step > 1 && <button onClick={prev} className="flex-1 border py-3 rounded-lg">Atrás</button>}
        {step < 4 ? (
          <button onClick={next} className="flex-1 bg-black text-white py-3 rounded-lg">Continuar</button>
        ) : (
          <button className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium">Crear mi tienda</button>
        )}
      </div>
    </div>
  );
}