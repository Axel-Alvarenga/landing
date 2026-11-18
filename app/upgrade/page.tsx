"use client";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-[#15181e] border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="text-2xl font-bold text-white mb-4">Tu prueba gratuita terminó</h1>
        <p className="text-slate-400 mb-8">
          Esperamos que hayas disfrutado de ARAE. Para seguir usando tu tienda y acceder a tu panel, necesitás elegir un plan.
        </p>
        
        <div className="space-y-4">
          <button 
            className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold hover:bg-emerald-400 transition"
            onClick={() => alert("¡Acá iría la pasarela de pago (MercadoPago/Stripe)!")}
          >
            Suscribirme por $9/mes
          </button>
          
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem("currentStoreSlug");
              window.location.href = "/login";
            }}
            className="w-full border border-slate-600 text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-800 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}