import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto">
        <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
          🚀 Lanzá tu tienda en 5 minutos
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Creá tu tienda online <br className="hidden md:block" />
          <span className="text-emerald-600">sin saber programar</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Gastronomía, moda, accesorios y más. Todo en un solo formulario.
          Tu tienda lista para vender desde el primer día.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/registro" className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition">
            Crear mi tienda gratis
          </Link>
          <Link href="#categorias" className="border border-slate-300 px-8 py-3 rounded-lg font-medium hover:bg-slate-50 transition">
            Ver categorías
          </Link>
        </div>
      </div>
    </section>
  );
}