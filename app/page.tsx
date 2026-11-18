import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f1115] text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-[#0f1115]/80 backdrop-blur-md border-b border-slate-800/50 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl tracking-tighter text-white">ARAE</Link>
          <div className="hidden md:flex gap-6 items-center text-sm font-medium text-slate-400">
            <a href="#precios" className="hover:text-white transition">Precios</a>
            <Link href="/registro" className="bg-emerald-500 text-black px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-400 transition">
              Crear tienda
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Principal */}
      <section className="pt-40 pb-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-white">
            ¿Listo para vender online?
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Creá tu tienda en minutos. Gastronomía, moda, accesorios y más en un solo lugar, con diseños diseñados para convertir.
          </p>
          <Link 
            href="/registro" 
            className="inline-flex items-center justify-center bg-emerald-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]"
          >
            Crear mi tienda gratis →
          </Link>
        </div>
      </section>

      {/* Features rápidas */}
      <section className="py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl border border-slate-700/50">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Rápido y fácil</h3>
            <p className="text-slate-400">Configurá tu tienda en menos de 5 minutos con nuestro formulario inteligente.</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl border border-slate-700/50">🎨</div>
            <h3 className="text-xl font-bold text-white mb-3">Diseños Premium</h3>
            <p className="text-slate-400">Elegí entre plantillas exclusivas diseñadas por expertos para cada rubro.</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl border border-slate-700/50">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">Analíticas en Vivo</h3>
            <p className="text-slate-400">Mirá cuántas personas visitan tu tienda y cuáles son los productos más vistos.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-slate-800/50 text-center text-slate-500 text-sm">
        <p>© 2026 ARAE. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}