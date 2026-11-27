"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // 👈 Estado para el error

  // 👇 Limpiamos la sesión al entrar al login para evitar bucles
  useEffect(() => {
    const cleanSession = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem("currentStoreSlug");
    };
    cleanSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); // Limpiamos errores previos

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Email o contraseña incorrectos. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 font-sans selection:bg-emerald-500/30">
      <div className="max-w-md w-full bg-[#15181e] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white tracking-tighter">
            ARAE
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Ingresá a tu panel de control</p>
        </div>

        {/* 👇 Mensaje de error estilizado */}
        {errorMsg && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold hover:bg-emerald-400 transition disabled:opacity-50 mt-4 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-emerald-400 hover:underline">
            Creá tu tienda
          </Link>
        </p>
      </div>
    </div>
  );
}