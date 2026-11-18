const steps = [
  { n: "1", title: "Completá el formulario", desc: "Nombre, categoría y datos básicos. 5 minutos." },
  { n: "2", title: "Elegí tu diseño", desc: "Seleccioná un template listo para tu rubro." },
  { n: "3", title: "¡A vender!", desc: "Tu tienda online activa con pagos integrados." },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}