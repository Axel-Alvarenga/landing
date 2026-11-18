"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Importamos Supabase directo

const categories = ["Gastronomía", "Remeras y Jeans", "Relojes", "Zapatos", "Ropa Interior"];

const countries = [
  { code: "AR", dial: "+54", name: "Argentina" },
  { code: "BO", dial: "+591", name: "Bolivia" },
  { code: "CL", dial: "+56", name: "Chile" },
  { code: "CO", dial: "+57", name: "Colombia" },
  { code: "CR", dial: "+506", name: "Costa Rica" },
  { code: "CU", dial: "+53", name: "Cuba" },
  { code: "EC", dial: "+593", name: "Ecuador" },
  { code: "SV", dial: "+503", name: "El Salvador" },
  { code: "ES", dial: "+34", name: "España" },
  { code: "US", dial: "+1", name: "Estados Unidos" },
  { code: "GT", dial: "+502", name: "Guatemala" },
  { code: "HN", dial: "+504", name: "Honduras" },
  { code: "MX", dial: "+52", name: "México" },
  { code: "NI", dial: "+505", name: "Nicaragua" },
  { code: "PA", dial: "+507", name: "Panamá" },
  { code: "PY", dial: "+595", name: "Paraguay" },
  { code: "PE", dial: "+51", name: "Perú" },
  { code: "DO", dial: "+1", name: "Rep. Dominicana" },
  { code: "UY", dial: "+598", name: "Uruguay" },
  { code: "VE", dial: "+58", name: "Venezuela" },
];

const templatesData: Record<string, { id: string, name: string, color: string, textColor: string }[]> = {
  "Gastronomía": [
    { id: "g1", name: "Menú Oscuro", color: "bg-zinc-900", textColor: "text-amber-400" },
    { id: "g2", name: "Orgánico", color: "bg-emerald-50", textColor: "text-emerald-800" },
    { id: "g3", name: "Fast Food", color: "bg-red-500", textColor: "text-white" },
    { id: "g4", name: "Cafetería", color: "bg-orange-100", textColor: "text-orange-900" },
  ],
  "Remeras y Jeans": [
    { id: "r1", name: "Streetwear", color: "bg-slate-900", textColor: "text-white" },
    { id: "r2", name: "Minimalista", color: "bg-stone-100", textColor: "text-stone-900" },
    { id: "r3", name: "Vintage", color: "bg-amber-200", textColor: "text-amber-900" },
    { id: "r4", name: "Urbano", color: "bg-blue-600", textColor: "text-white" },
  ],
  "Relojes": [
    { id: "rl1", name: "Lujo Clásico", color: "bg-black", textColor: "text-yellow-500" },
    { id: "rl2", name: "Moderno", color: "bg-slate-200", textColor: "text-slate-900" },
    { id: "rl3", name: "Deportivo", color: "bg-blue-900", textColor: "text-white" },
    { id: "rl4", name: "Elegante", color: "bg-stone-800", textColor: "text-stone-200" },
  ],
  "Zapatos": [
    { id: "z1", name: "Sneakers", color: "bg-white border-slate-200", textColor: "text-black" },
    { id: "z2", name: "Formal", color: "bg-slate-800", textColor: "text-white" },
    { id: "z3", name: "Deportivo", color: "bg-lime-400", textColor: "text-black" },
    { id: "z4", name: "Casual", color: "bg-amber-800", textColor: "text-amber-50" },
  ],
  "Ropa Interior": [
    { id: "ri1", name: "Lencería", color: "bg-rose-100", textColor: "text-rose-900" },
    { id: "ri2", name: "Básicos", color: "bg-slate-100", textColor: "text-slate-600" },
    { id: "ri3", name: "Seducción", color: "bg-black", textColor: "text-rose-500" },
    { id: "ri4", name: "Deportivo", color: "bg-teal-600", textColor: "text-white" },
  ]
};

const defaultTemplates = [
  { id: "d1", name: "Clásico", color: "bg-slate-200", textColor: "text-slate-900" },
  { id: "d2", name: "Oscuro", color: "bg-slate-800", textColor: "text-white" },
  { id: "d3", name: "Moderno", color: "bg-indigo-500", textColor: "text-white" },
  { id: "d4", name: "Elegante", color: "bg-stone-100", textColor: "text-stone-900" },
];

export default function RegistroPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", category: "", email: "", password: "", countryCode: "+54", countryIso: "AR", whatsapp: "", template: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.dial.includes(searchQuery)
  );

  const handleSelectCountry = (country: typeof countries[0]) => {
    setForm({ ...form, countryCode: country.dial, countryIso: country.code });
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isEmailInvalid = form.email.length > 0 && !isEmailValid;
  
  const isStep1Valid = form.name.trim().length > 2 && form.category !== "";
  const isStep2Valid = isEmailValid && form.password.length >= 6 && form.whatsapp.trim().length >= 6;
  const isStep3Valid = form.template !== "";

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) return;
    if (step === 2 && !isStep2Valid) return;
    if (step === 3 && !isStep3Valid) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const currentTemplates = form.category ? (templatesData[form.category] || defaultTemplates) : defaultTemplates;
  const currentCountryFlag = countries.find(c => c.code === form.countryIso);

  const emailInputClass = `w-full bg-[#15181e] border rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
    isEmailInvalid 
      ? "border-red-500 focus:ring-red-500 focus:border-transparent" 
      : "border-slate-700 focus:ring-emerald-500 focus:border-transparent"
  }`;

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans selection:bg-emerald-500/30 pt-24 px-4 pb-12">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-sm text-slate-500 hover:text-emerald-400 transition mb-8 inline-block">
          ← Volver al inicio
        </Link>

        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium text-slate-400">
            <span>Paso {step} de 4</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div className="h-2 bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${step * 25}%` }} />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white">Datos de tu negocio</h1>
            <p className="text-slate-400">Empecemos con lo básico.</p>
            <input
              className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="Nombre de tu tienda"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="" className="text-slate-500">Elegí una categoría</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#15181e] text-white">{c}</option>
              ))}
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white">Datos de contacto</h1>
            <p className="text-slate-400">Así te van a contactar tus clientes.</p>
            
            <div>
              <input
                className={emailInputClass}
                placeholder="Email (ej: hola@mitienda.com)"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {isEmailInvalid && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">Ingresá un correo electrónico válido.</p>
              )}
            </div>

            <div>
              <input
                className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="Creá una contraseña (min. 6 caracteres)"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <div className="relative w-32 shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-full flex items-center justify-between bg-[#15181e] border border-slate-700 rounded-lg py-3 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {currentCountryFlag && (
                      <img src={`https://flagcdn.com/w20/${currentCountryFlag.code.toLowerCase()}.png`} alt="Flag" className="w-5 h-auto rounded-sm" />
                    )}
                    <span className="text-sm font-medium">{form.countryCode}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">▼</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#15181e] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-700">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar país..."
                        className="w-full bg-[#0f1115] border border-slate-700 rounded-md p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleSelectCountry(c)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#1a1e26] transition text-left cursor-pointer"
                          >
                            <img src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} alt={c.name} className="w-5 h-auto rounded-sm" />
                            <span className="text-sm text-slate-200 flex-1">{c.name}</span>
                            <span className="text-xs text-slate-500">{c.dial}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-sm text-slate-500">No se encontró</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <input
                className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="Número de WhatsApp"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white">Elegí tu diseño</h1>
            <p className="text-slate-400">
              Templates exclusivos para: <b className="text-emerald-400">{form.category || "Tu categoría"}</b>
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, template: t.id })}
                  className={`relative w-full text-left border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                    form.template === t.id 
                      ? "border-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] bg-[#1a1e26]" 
                      : "border-slate-700 hover:border-slate-500 bg-[#15181e]"
                  }`}
                >
                  <div className={`h-32 p-4 flex flex-col ${t.color}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className={`font-bold text-sm truncate ${t.textColor}`}>
                        {form.name || "Mi Tienda"}
                      </div>
                      <div className={`w-6 h-1 rounded-full opacity-50 ${t.textColor.replace('text-', 'bg-')}`}></div>
                    </div>
                    <div className={`text-[10px] opacity-70 mb-2 ${t.textColor}`}>Productos destacados</div>
                    <div className="flex gap-2 mt-auto">
                      <div className={`w-8 h-8 rounded opacity-20 ${t.textColor.replace('text-', 'bg-')}`}></div>
                      <div className={`w-8 h-8 rounded opacity-20 ${t.textColor.replace('text-', 'bg-')}`}></div>
                      <div className={`w-8 h-8 rounded opacity-20 ${t.textColor.replace('text-', 'bg-')}`}></div>
                    </div>
                  </div>
                  <div className="p-3 text-center border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-300">{t.name}</span>
                    {form.template === t.id && <span className="text-emerald-500 text-xs font-bold">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white">¡Todo listo! 🎉</h1>
            <p className="text-slate-400">
              Tu tienda <b className="text-white">{form.name || "sin nombre"}</b> de categoría{" "}
              <b className="text-white">{form.category || "sin categoría"}</b> está lista para crearse.
            </p>
            <div className="bg-[#15181e] border border-slate-700 p-5 rounded-xl text-sm space-y-3 text-slate-300">
              <p className="flex items-center gap-3">📧 <span>{form.email || "—"}</span></p>
              <p className="flex items-center gap-3">
                📱 <span>{form.whatsapp ? `${form.countryCode} ${form.whatsapp}` : "—"}</span>
              </p>
              <p className="flex items-center gap-3">🎨 <span>Template: <b>{form.template || "No seleccionado"}</b></span></p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-10">
          {step > 1 && (
            <button
              type="button"
              onClick={prev}
              disabled={isLoading}
              className="flex-1 border border-slate-600 py-3 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
            >
              Atrás
            </button>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid)
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
              }`}
            >
              Continuar
            </button>
          ) : (
            <button 
              type="button"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                try {
                  const slug = form.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                  
                  // 1. Registrar en Supabase
                  const { error: authError } = await supabase.auth.signUp({
                    email: form.email,
                    password: form.password,
                  });

                  if (authError) {
                    alert("Error al crear cuenta: " + authError.message);
                    setIsLoading(false);
                    return;
                  }

                  // 2. Guardar tienda en Prisma
                  const res = await fetch('/api/stores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      slug,
                      name: form.name,
                      category: form.category,
                      template: form.template,
                      email: form.email,
                      whatsapp: `${form.countryCode} ${form.whatsapp}`
                    })
                  });

                  if (!res.ok) {
                    alert("Error al guardar la tienda.");
                    setIsLoading(false);
                    return;
                  }

                  localStorage.setItem("currentStoreSlug", slug);
                  window.location.href = `/dashboard`;
                } catch (error) {
                  console.error(error);
                  alert("Hubo un error inesperado.");
                  setIsLoading(false);
                }
              }}
              className="flex-1 bg-white text-black py-3 rounded-lg font-bold hover:bg-slate-200 transition disabled:opacity-50"
            >
              {isLoading ? "Creando tienda..." : "Crear mi tienda"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}