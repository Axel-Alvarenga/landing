const categories = [
  { emoji: "🍽️", title: "Gastronomía", desc: "Restaurantes, delivery, cafeterías" },
  { emoji: "👕", title: "Remeras y Jeans", desc: "Moda urbana y streetwear" },
  { emoji: "⌚", title: "Relojes", desc: "Accesorios y alta relojería" },
  { emoji: "👟", title: "Zapatos", desc: "Sneakers, formales y deportivos" },
  { emoji: "🩲", title: "Ropa Interior", desc: "Lencería y básicos" },
];

export default function Categories() {
  return (
    <section id="categorias" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Una plataforma, cinco rubros
        </h2>
        <p className="text-center text-slate-600 mb-12">Elegí tu categoría y empezá hoy</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <div key={c.title} className="border rounded-2xl p-6 text-center hover:shadow-lg hover:border-emerald-400 transition cursor-pointer">
              <div className="text-5xl mb-3">{c.emoji}</div>
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-sm text-slate-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}