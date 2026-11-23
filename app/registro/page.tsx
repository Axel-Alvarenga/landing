"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const categories = [
  "Gastronomía",
  "Restaurante",
  "Comida rápida",
  "Cafetería",
  "Panadería y confitería",
  "Pastelería y repostería",
  "Heladería",
  "Bebidas y jugos",
  "Almacén y minimercado",
  "Supermercado",
  "Carnicería",
  "Pollería",
  "Pescadería",
  "Frutería y verdulería",
  "Indumentaria",
  "Remeras y Jeans",
  "Calzados",
  "Zapatos",
  "Ropa Interior",
  "Accesorios y bijouterie",
  "Relojes",
  "Joyería",
  "Perfumería",
  "Cosmética y maquillaje",
  "Peluquería y barbería",
  "Estética y uñas",
  "Electrónica",
  "Celulares y accesorios",
  "Informática",
  "Electrodomésticos",
  "Hogar y decoración",
  "Muebles",
  "Bazar y artículos de cocina",
  "Ferretería",
  "Construcción",
  "Librería y papelería",
  "Juguetería",
  "Deportes",
  "Mascotas",
  "Repuestos y accesorios para vehículos",
  "Bicicletería",
  "Regalos",
  "Florería",
  "Artesanías",
  "Agro y jardinería",
  "Farmacia",
  "Óptica",
  "Servicios profesionales",
  "Otros",
];

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

const templatesData: Record<
  string,
  { id: string; name: string; color: string; textColor: string }[]
> = {
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
  "Calzados": [
    { id: "z1", name: "Sneakers", color: "bg-white border-slate-200", textColor: "text-black" },
    { id: "z2", name: "Formal", color: "bg-slate-800", textColor: "text-white" },
    { id: "z3", name: "Deportivo", color: "bg-lime-400", textColor: "text-black" },
    { id: "z4", name: "Casual", color: "bg-amber-800", textColor: "text-amber-50" },
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
  ],
};

const defaultTemplates = [
  { id: "d1", name: "Clásico", color: "bg-slate-200", textColor: "text-slate-900" },
  { id: "d2", name: "Oscuro", color: "bg-slate-800", textColor: "text-white" },
  { id: "d3", name: "Moderno", color: "bg-indigo-500", textColor: "text-white" },
  { id: "d4", name: "Elegante", color: "bg-stone-100", textColor: "text-stone-900" },
];

export default function RegistroPage() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    category: "",
    email: "",
    password: "",
    countryCode: "+54",
    countryIso: "AR",
    whatsapp: "",
    template: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }

      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dial.includes(searchQuery)
  );

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const handleSelectCountry = (country: (typeof countries)[0]) => {
    setForm({
      ...form,
      countryCode: country.dial,
      countryIso: country.code,
    });

    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isEmailInvalid = form.email.length > 0 && !isEmailValid;

  const isStep1Valid = form.name.trim().length > 2 && form.category !== "";

  const isStep2Valid =
    isEmailValid &&
    form.password.length >= 6 &&
    form.whatsapp.trim().length >= 6;

  const isStep3Valid = form.template !== "";

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) return;
    if (step === 2 && !isStep2Valid) return;
    if (step === 3 && !isStep3Valid) return;

    setStep((s) => Math.min(s + 1, 4));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const currentTemplates = form.category
    ? templatesData[form.category] || defaultTemplates
    : defaultTemplates;

  const currentCountryFlag = countries.find(
    (c) => c.code === form.countryIso
  );

  const emailInputClass = `w-full bg-[#15181e] border rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
    isEmailInvalid
      ? "border-red-500 focus:ring-red-500"
      : "border-slate-700 focus:ring-emerald-500"
  }`;

  // CREACIÓN DE TIENDA
  const handleCreateStore = async () => {
    if (!executeRecaptcha) {
      alert("El sistema de seguridad no está listo. Esperá un segundo.");
      return;
    }

    setIsLoading(true);

    try {
      const email = form.email.trim().toLowerCase();

      const slug = form.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      if (!slug) {
        alert("El nombre de la tienda no es válido.");
        return;
      }

      // 1. Comprobar si ya existe una sesión.
      const { data: sessionData } = await supabase.auth.getSession();

      let accessToken = sessionData.session?.access_token;
      const currentEmail = sessionData.session?.user.email?.toLowerCase();

      if (accessToken && currentEmail !== email) {
        alert(
          "Tenés una sesión iniciada con otro correo. Cerrá esa sesión antes de continuar."
        );
        return;
      }

      // 2. Si no hay sesión, intentar registrar la cuenta.
      if (!accessToken) {
        const { data: signupData, error: signupError } =
          await supabase.auth.signUp({
            email,
            password: form.password,
          });

        if (signupError) {
          // Si el correo ya existe, iniciar sesión.
          if (
            signupError.message.toLowerCase().includes("already registered") ||
            signupError.message.toLowerCase().includes("already been registered")
          ) {
            const { data: loginData, error: loginError } =
              await supabase.auth.signInWithPassword({
                email,
                password: form.password,
              });

            if (loginError || !loginData.session) {
              alert(
                "No se pudo iniciar sesión. Verificá que el correo y la contraseña sean correctos."
              );
              return;
            }

            accessToken = loginData.session.access_token;
          } else {
            alert("Error al crear cuenta: " + signupError.message);
            return;
          }
        } else if (signupData.session) {
          // Cuenta nueva con sesión inmediata.
          accessToken = signupData.session.access_token;
        } else {
          // Supabase puede no devolver sesión cuando requiere confirmar el correo.
          const { data: loginData, error: loginError } =
            await supabase.auth.signInWithPassword({
              email,
              password: form.password,
            });

          if (loginData.session && !loginError) {
            accessToken = loginData.session.access_token;
          } else {
            alert(
              "No se pudo iniciar sesión. Si tu cuenta es nueva, revisá tu correo para confirmar el registro. Si ya tenés cuenta, verificá tu contraseña."
            );
            return;
          }
        }
      }

      if (!accessToken) {
        alert("No se pudo obtener tu sesión. Iniciá sesión nuevamente.");
        return;
      }

      // 3. Verificar reCAPTCHA.
      const recaptchaToken = await executeRecaptcha("registro_tienda");

      // 4. Enviar solicitud para crear la tienda.
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          slug,
          name: form.name.trim(),
          category: form.category,
          template: form.template,
          email,
          whatsapp: `${form.countryCode} ${form.whatsapp}`,
          recaptchaToken,
        }),
      });

      const responseData = await res.json();

      // 5. Si el usuario ya tiene tienda, ingresar a ella.
      if (res.status === 409 && responseData.existingStore?.slug) {
        localStorage.setItem(
          "currentStoreSlug",
          responseData.existingStore.slug
        );

        alert("Ya tenés una tienda registrada. Ingresando a tu panel.");
        window.location.href = "/dashboard";
        return;
      }

      if (!res.ok) {
        alert(responseData.error || "Error al guardar la tienda.");
        return;
      }

      if (!responseData?.id || !responseData?.slug) {
        console.error("Respuesta inesperada del servidor:", responseData);
        alert("La tienda se creó, pero el servidor devolvió datos incompletos.");
        return;
      }

      // 6. Guardar la tienda y entrar al Dashboard.
      localStorage.setItem("currentStoreSlug", responseData.slug);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error al crear tienda:", error);
      alert("Hubo un error inesperado al crear la tienda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans selection:bg-emerald-500/30 pt-24 px-4 pb-12">
      <div className="max-w-xl mx-auto">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-emerald-400 transition mb-8 inline-block"
        >
          ← Volver al inicio
        </Link>

        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium text-slate-400">
            <span>Paso {step} de 4</span>
          </div>

          <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white">
              Datos de tu negocio
            </h1>

            <p className="text-slate-400">Empecemos con lo básico.</p>

            <input
              className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nombre de tu tienda"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {/* BUSCADOR DE RUBROS */}
            <div className="relative" ref={categoryDropdownRef}>
              <input
                type="text"
                placeholder="Buscar rubro de tu negocio..."
                value={categorySearch}
                onFocus={() => setIsCategoryDropdownOpen(true)}
                onChange={(e) => {
                  setCategorySearch(e.target.value);
                  setIsCategoryDropdownOpen(true);
                  setForm({ ...form, category: "" });
                }}
                className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#15181e] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, category });
                            setCategorySearch(category);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-[#202630] transition ${
                            form.category === category
                              ? "text-emerald-400 bg-[#202630]"
                              : "text-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{category}</span>
                            {form.category === category && (
                              <span className="text-emerald-400">✓</span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-slate-500">
                        No encontramos ese rubro. Probá con otra búsqueda o
                        seleccioná "Otros".
                      </p>
                    )}
                  </div>
                </div>
              )}

              {form.category && (
                <p className="text-xs text-emerald-400 mt-2">
                  ✓ Rubro seleccionado: {form.category}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white">
              Datos de contacto
            </h1>

            <div>
              <input
                className={emailInputClass}
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              {isEmailInvalid && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">
                  Email inválido.
                </p>
              )}
            </div>

            <input
              className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Contraseña (min. 6)"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div className="flex gap-2">
              <div className="relative w-32 shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-full flex items-center justify-between bg-[#15181e] border border-slate-700 rounded-lg py-3 px-3 text-white"
                >
                  <div className="flex items-center gap-2">
                    {currentCountryFlag && (
                      <img
                        src={`https://flagcdn.com/w20/${currentCountryFlag.code.toLowerCase()}.png`}
                        className="w-5 rounded-sm"
                        alt={currentCountryFlag.name}
                      />
                    )}

                    <span className="text-sm font-medium">
                      {form.countryCode}
                    </span>
                  </div>

                  <span className="text-slate-500 text-[10px]">▼</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#15181e] border border-slate-700 rounded-lg shadow-xl z-50">
                    <div className="p-2 border-b border-slate-700">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar..."
                        className="w-full bg-[#0f1115] border border-slate-700 rounded-md p-2 text-sm text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      {filteredCountries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleSelectCountry(c)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#1a1e26] text-left"
                        >
                          <img
                            src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                            className="w-5 rounded-sm"
                            alt={c.name}
                          />

                          <span className="text-sm flex-1">{c.name}</span>

                          <span className="text-xs text-slate-500">
                            {c.dial}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <input
                className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500"
                placeholder="Número de WhatsApp"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white">
              Elegí tu diseño
            </h1>

            <p className="text-slate-400">
              Templates para:{" "}
              <b className="text-emerald-400">
                {form.category || "Tu categoría"}
              </b>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, template: t.id })}
                  className={`relative w-full text-left border-2 rounded-xl overflow-hidden transition-all ${
                    form.template === t.id
                      ? "border-emerald-500 bg-[#1a1e26]"
                      : "border-slate-700 hover:border-slate-500 bg-[#15181e]"
                  }`}
                >
                  <div className={`h-32 p-4 flex flex-col ${t.color}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div
                        className={`font-bold text-sm truncate ${t.textColor}`}
                      >
                        {form.name || "Mi Tienda"}
                      </div>

                      <div
                        className={`w-6 h-1 rounded-full opacity-50 ${t.textColor.replace(
                          "text-",
                          "bg-"
                        )}`}
                      />
                    </div>

                    <div className={`text-[10px] opacity-70 mb-2 ${t.textColor}`}>
                      Productos
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <div
                        className={`w-8 h-8 rounded opacity-20 ${t.textColor.replace(
                          "text-",
                          "bg-"
                        )}`}
                      />

                      <div
                        className={`w-8 h-8 rounded opacity-20 ${t.textColor.replace(
                          "text-",
                          "bg-"
                        )}`}
                      />

                      <div
                        className={`w-8 h-8 rounded opacity-20 ${t.textColor.replace(
                          "text-",
                          "bg-"
                        )}`}
                      />
                    </div>
                  </div>

                  <div className="p-3 text-center border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-300">
                      {t.name}
                    </span>

                    {form.template === t.id && (
                      <span className="text-emerald-500 text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white">
              ¡Todo listo! 🎉
            </h1>

            <p className="text-slate-400">
              Tu tienda <b className="text-white">{form.name}</b> está lista.
            </p>

            <div className="bg-[#15181e] border border-slate-700 p-5 rounded-xl text-sm space-y-3 text-slate-300">
              <p>📧 {form.email}</p>
              <p>📱 {form.countryCode} {form.whatsapp}</p>
              <p>🏷️ Rubro: {form.category}</p>
              <p>🎨 Template: {form.template}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-10">
          {step > 1 && (
            <button
              type="button"
              onClick={prev}
              disabled={isLoading}
              className="flex-1 border border-slate-600 py-3 rounded-lg font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Atrás
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className={`flex-1 py-3 rounded-lg font-bold transition ${
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid)
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-500 text-black hover:bg-emerald-400"
              }`}
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleCreateStore}
              className="flex-1 bg-white text-black py-3 rounded-lg font-bold hover:bg-slate-200 disabled:opacity-50"
            >
              {isLoading ? "Creando..." : "Crear mi tienda"}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6 max-w-md mx-auto">
          Este sitio está protegido por reCAPTCHA y se aplican la{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-slate-300"
          >
            Política de Privacidad
          </a>{" "}
          y los{" "}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-slate-300"
          >
            Términos de Servicio
          </a>{" "}
          de Google.
        </p>
      </div>
    </div>
  );
}
