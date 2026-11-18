export const templatesData: Record<string, any[]> = {
  "Gastronomía": [
    { id: "g1", name: "Menú Oscuro", color: "bg-zinc-900", textColor: "text-amber-400" },
    { id: "g2", name: "Orgánico", color: "bg-emerald-50", textColor: "text-emerald-800" },
    { id: "g3", name: "Fast Food", color: "bg-red-500", textColor: "text-white" },
    { id: "g4", name: "Cafetería", color: "bg-orange-100", textColor: "text-orange-900" },
  ],
  "Remeras y Jeans": [
    { id: "r1", name: "Streetwear", color: "bg-slate-900", textColor: "text-white" },
    { id: "r2", name: "Minimalista", color: "bg-stone-100", textColor: "text-stone-900" },
    { id: "r3", name: "Vintage", color: "bg-amber-200", textColor: "text-amber-900" },
    { id: "r4", name: "Urbano", color: "bg-blue-600", textColor: "text-white" },
  ],
  "Relojes": [
    { id: "rl1", name: "Lujo Clásico", color: "bg-black", textColor: "text-yellow-500" },
    { id: "rl2", name: "Moderno", color: "bg-slate-200", textColor: "text-slate-900" },
    { id: "rl3", name: "Deportivo", color: "bg-blue-900", textColor: "text-white" },
    { id: "rl4", name: "Elegante", color: "bg-stone-800", textColor: "text-stone-200" },
  ],
  "Zapatos": [
    { id: "z1", name: "Sneakers", color: "bg-white border-slate-200", textColor: "text-black" },
    { id: "z2", name: "Formal", color: "bg-slate-800", textColor: "text-white" },
    { id: "z3", name: "Deportivo", color: "bg-lime-400", textColor: "text-black" },
    { id: "z4", name: "Casual", color: "bg-amber-800", textColor: "text-amber-50" },
  ],
  "Ropa Interior": [
    { id: "ri1", name: "Lencería", color: "bg-rose-100", textColor: "text-rose-900" },
    { id: "ri2", name: "Básicos", color: "bg-slate-100", textColor: "text-slate-600" },
    { id: "ri3", name: "Seducción", color: "bg-black", textColor: "text-rose-500" },
    { id: "ri4", name: "Deportivo", color: "bg-teal-600", textColor: "text-white" },
  ]
};

// Un template por defecto por si eligen una categoría que no está en la lista
export const defaultTemplates = [
  { id: "d1", name: "Clásico", color: "bg-slate-200", textColor: "text-slate-900" },
  { id: "d2", name: "Oscuro", color: "bg-slate-800", textColor: "text-white" },
  { id: "d3", name: "Moderno", color: "bg-indigo-500", textColor: "text-white" },
  { id: "d4", name: "Elegante", color: "bg-stone-100", textColor: "text-stone-900" },
];