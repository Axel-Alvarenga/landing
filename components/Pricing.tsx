const plans = [
  { name: "Starter", price: "Gratis", features: ["1 tienda", "10 productos", "Subdominio"], cta: "Empezar", highlight: false },
  { name: "Pro", price: "$9/mes", features: ["Dominio propio", "Productos ilimitados", "Sin branding", "Soporte"], cta: "Elegir Pro", highlight: true },
  { name: "Business", price: "$29/mes", features: ["Multi-tienda", "Analytics avanzado", "Comisiones bajas", "API"], cta: "Elegir Business", highlight: false },
];

export default function Pricing() {
  return (
    <section id="precios" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Planes simples</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl p-8 border-2 ${p.highlight ? "border-emerald-600 shadow-xl scale-105" : "border-slate-200"}`}>
              <h3 className="font-bold text-xl mb-2">{p.name}</h3>
              <div className="text-4xl font-bold mb-6">{p.price}</div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => <li key={f} className="text-slate-600">✓ {f}</li>)}
              </ul>
              <button className={`w-full py-3 rounded-lg font-medium ${p.highlight ? "bg-emerald-600 text-white" : "bg-slate-100"}`}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}