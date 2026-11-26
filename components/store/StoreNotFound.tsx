import Link from "next/link";

export function StoreNotFound() {
  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-3xl font-bold mb-4">Tienda no encontrada</h1>
      <Link
        href="/registro"
        className="bg-emerald-500 text-black px-6 py-3 rounded-lg font-bold"
      >
        Crear una tienda
      </Link>
    </div>
  );
}