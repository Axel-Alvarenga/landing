import Link from "next/link";

interface SubscriptionBlockProps {
  subscription: {
    status: string;
    canManage: boolean;
    daysRemaining?: number;
  };
  onLogout: () => void;
}

export function SubscriptionBlock({ subscription, onLogout }: SubscriptionBlockProps) {
  const isGrace = subscription.status === "GRACE";

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-6 text-white">
      <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-5">{isGrace ? "⏳" : "🔒"}</div>

        <h1 className="text-2xl font-bold mb-3">
          {isGrace ? "Tu período de prueba terminó" : "Tu suscripción venció"}
        </h1>

        <p className="text-slate-400 mb-6">
          {isGrace
            ? "Tu tienda está en período de gracia. El panel de administración está bloqueado. Todavía tenés tiempo para renovar."
            : "Tu acceso al panel está suspendido. Renovando tu suscripción podrás volver a administrar tu tienda."}
        </p>

        {isGrace && (
          <p className="text-amber-400 font-semibold mb-6">
            Días restantes de gracia: {subscription.daysRemaining}
          </p>
        )}

        <p className="text-slate-500 text-sm mb-6">
          Tu catálogo público permanece disponible.
        </p>

        <Link
          href="/upgrade"
          className="block w-full bg-emerald-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-emerald-400"
        >
          Renovar suscripción
        </Link>

        <button
          onClick={onLogout}
          className="mt-5 text-slate-400 hover:text-white text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}