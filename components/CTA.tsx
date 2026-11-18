import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-black text-white text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para vender online?</h2>
        <p className="text-slate-300 mb-8 text-lg">Creá tu tienda hoy, sin costos iniciales.</p>
        <Link href="/registro" className="inline-block bg-emerald-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-emerald-400 transition">
          Crear mi tienda gratis →
        </Link>
      </div>
    </section>
  );
}