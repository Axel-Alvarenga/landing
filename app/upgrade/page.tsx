"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UpgradePage() {
  // 👇 ACÁ PONÉ TU NÚMERO DE WHATSAPP (con código de país, sin espacios ni el +)
  // Ejemplo Paraguay: 595981123456
  const MI_WHATSAPP = "595981550354"; 
  
  // El mensaje que le va a llegar pre-armado a tu WhatsApp
  const mensajeWhatsApp = encodeURIComponent(
    "¡Hola! Quiero activar el Plan Pro de ARAE por Gs. 70.000. Acá adjunto mi comprobante de transferencia bancaria."
  );

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-[#15181e] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-white mb-2">Activá tu Plan Pro</h1>
          <p className="text-slate-400 text-sm">
            Desbloqueá todo el potencial de tu tienda por solo{" "}
            <strong className="text-emerald-400">Gs. 70.000 / mes</strong>.
          </p>
        </div>

        {/* INSTrucciones de pago */}
        <div className="bg-[#0f1115] border border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            🏦 Datos para la transferencia
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            {/* 👇 ACÁ PONÉ TUS DATOS BANCARIOS REALES */}
            <p><strong>Banco:</strong> Tu Financiera</p>
            <p><strong>Titular:</strong> Mirian Williams</p>
            <p><strong>Alias:</strong>  2674427</p>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href={`https://wa.me/${MI_WHATSAPP}?text=${mensajeWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white py-3 rounded-lg font-bold hover:bg-[#20b858] transition flex items-center justify-center gap-2"
          >
            <span className="text-xl">💬</span>
            Enviar comprobante por WhatsApp
          </a>
          
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

        <p className="text-xs text-slate-500 text-center mt-6">
          Una vez que verifiquemos tu pago, activaremos tu cuenta Pro manualmente en un lapso de 24 horas.
        </p>

      </div>
    </div>
  );
}