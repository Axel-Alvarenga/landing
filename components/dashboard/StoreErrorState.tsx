import Link from "next/link";

export function StoreErrorState() {
  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-xl font-bold mb-2">No pudimos cargar tu tienda</h1>
      <p className="text-slate-400 mb-6 max-w-sm">
        Hubo un problema de conexión o tu sesión expiró. Por favor, intentá
        ingresar nuevamente.
      </p>
      <Link
        href="/login"
        className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-400 transition"
      >
        Volver al Login
      </Link>
    </div>
  );
}