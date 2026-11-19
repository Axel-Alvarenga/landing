"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type Product = { id: string; name: string; price: number; stock: number; imageUrl?: string; category?: string };
type Store = { id: string; name: string; category: string; template: string; whatsapp: string; slug: string; logoUrl?: string };
type CartItem = Product & { quantity: number };

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    params.then(async (p) => {
      setSlug(p.slug);
      const res = await fetch(`/api/stores/${p.slug}`);
      if (res.ok) {
        const storeData = await res.json();
        setStore(storeData);
        setProducts(storeData.products || []);
      }
      const savedCart = localStorage.getItem(`cart_${p.slug}`);
      if (savedCart) setCart(JSON.parse(savedCart));
      setLoading(false);
    });
  }, [params]);

  useEffect(() => {
    if (slug) localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
  }, [cart, slug]);

  // --- LÓGICA DEL CARRITO Y FILTROS ---
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const categoriesList = Array.from(new Set(products.map(p => p.category || "General"))).filter(Boolean);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === "Todos" || (p.category || "General") === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (!store || cart.length === 0) return;
    const phone = store.whatsapp.replace(/\D/g, '');
    let message = `¡Hola *${store.name}*! 👋\nQuiero hacer el siguiente pedido:\n\n`;
    cart.forEach((item) => {
      message += `▪️ ${item.quantity}x ${item.name} - $${item.price * item.quantity}\n`;
    });
    message += `\n*Total:* $${total}\n\n¿Me confirmás disponibilidad?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- RETURNS CONDICIONALES ---
  if (loading) return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-white">Cargando tienda...</div>;

  if (!store) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-3xl font-bold mb-4">Tienda no encontrada</h1>
        <Link href="/registro" className="bg-emerald-500 text-black px-6 py-3 rounded-lg font-bold">Crear una tienda</Link>
      </div>
    );
  }

  // --- VARIABLES DE DISEÑO ---
  const templateColors: Record<string, { bg: string, text: string, accent: string, card: string, nav: string }> = {
    g1: { bg: "bg-zinc-900", text: "text-white", accent: "text-amber-400", card: "bg-zinc-800", nav: "bg-zinc-900/80" },
    g2: { bg: "bg-emerald-50", text: "text-emerald-950", accent: "text-emerald-600", card: "bg-white", nav: "bg-emerald-50/80" },
    g3: { bg: "bg-red-500", text: "text-white", accent: "text-white", card: "bg-red-600", nav: "bg-red-500/80" },
    g4: { bg: "bg-orange-100", text: "text-orange-950", accent: "text-orange-600", card: "bg-white", nav: "bg-orange-100/80" },
    r1: { bg: "bg-slate-900", text: "text-white", accent: "text-blue-400", card: "bg-slate-800", nav: "bg-slate-900/80" },
    r2: { bg: "bg-stone-100", text: "text-stone-900", accent: "text-stone-600", card: "bg-white", nav: "bg-stone-100/80" },
    r3: { bg: "bg-amber-200", text: "text-amber-950", accent: "text-amber-700", card: "bg-amber-100", nav: "bg-amber-200/80" },
    r4: { bg: "bg-blue-600", text: "text-white", accent: "text-blue-200", card: "bg-blue-700", nav: "bg-blue-600/80" },
    rl1: { bg: "bg-black", text: "text-white", accent: "text-yellow-500", card: "bg-zinc-900", nav: "bg-black/80" },
    rl2: { bg: "bg-slate-200", text: "text-slate-900", accent: "text-slate-600", card: "bg-white", nav: "bg-slate-200/80" },
    rl3: { bg: "bg-blue-900", text: "text-white", accent: "text-blue-300", card: "bg-blue-800", nav: "bg-blue-900/80" },
    rl4: { bg: "bg-stone-800", text: "text-stone-100", accent: "text-stone-400", card: "bg-stone-700", nav: "bg-stone-800/80" },
    z1: { bg: "bg-white", text: "text-black", accent: "text-slate-500", card: "bg-slate-50", nav: "bg-white/80" },
    z2: { bg: "bg-slate-800", text: "text-white", accent: "text-slate-300", card: "bg-slate-700", nav: "bg-slate-800/80" },
    z3: { bg: "bg-lime-400", text: "text-black", accent: "text-lime-800", card: "bg-lime-300", nav: "bg-lime-400/80" },
    z4: { bg: "bg-amber-800", text: "text-amber-50", accent: "text-amber-300", card: "bg-amber-900", nav: "bg-amber-800/80" },
    ri1: { bg: "bg-rose-100", text: "text-rose-950", accent: "text-rose-600", card: "bg-white", nav: "bg-rose-100/80" },
    ri2: { bg: "bg-slate-100", text: "text-slate-900", accent: "text-slate-500", card: "bg-white", nav: "bg-slate-100/80" },
    ri3: { bg: "bg-black", text: "text-white", accent: "text-rose-500", card: "bg-zinc-900", nav: "bg-black/80" },
    ri4: { bg: "bg-teal-600", text: "text-white", accent: "text-teal-200", card: "bg-teal-700", nav: "bg-teal-600/80" },
    n1: { bg: "bg-cyan-600", text: "text-white", accent: "text-cyan-200", card: "bg-cyan-700", nav: "bg-cyan-600/80" },
    n2: { bg: "bg-green-800", text: "text-green-50", accent: "text-green-300", card: "bg-green-900", nav: "bg-green-800/80" },
    n3: { bg: "bg-gradient-to-br from-orange-400 to-rose-500", text: "text-white", accent: "text-orange-200", card: "bg-white/10", nav: "bg-orange-400/80" },
    n4: { bg: "bg-slate-50", text: "text-slate-800", accent: "text-indigo-600", card: "bg-white", nav: "bg-slate-50/80" },
    n5: { bg: "bg-fuchsia-900", text: "text-fuchsia-400", accent: "text-fuchsia-400", card: "bg-fuchsia-950", nav: "bg-fuchsia-900/80" },
    n6: { bg: "bg-amber-100", text: "text-amber-900", accent: "text-amber-700", card: "bg-white", nav: "bg-amber-100/80" },
    default: { bg: "bg-[#0f1115]", text: "text-white", accent: "text-emerald-500", card: "bg-[#15181e]", nav: "bg-[#0f1115]/80" }
  };

  const theme = templateColors[store.template] || templateColors.default;
  const isLightTheme = ["g2", "g4", "r2", "r3", "rl2", "z1", "ri1", "ri2", "n4", "n6"].includes(store.template);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg} ${theme.text} font-sans relative overflow-x-hidden`}>
      
      <nav className={`w-full ${theme.nav} backdrop-blur-md border-b ${isLightTheme ? 'border-black/10' : 'border-white/10'} sticky top-0 z-40`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* LOGO Y NOMBRE */}
          <div className="flex items-center gap-3 shrink-0">
            {store.logoUrl && (
              <img 
                src={store.logoUrl} 
                alt={store.name} 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shadow-sm border border-black/10 bg-white/50" 
              />
            )}
            <span className="font-bold text-lg md:text-xl truncate">{store.name}</span>
          </div>
          
          {/* BUSCADOR DESKTOP */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className={`w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none transition ${isLightTheme ? 'bg-black/5 focus:bg-black/10 placeholder-black/50' : 'bg-white/10 focus:bg-white/20 placeholder-white/50'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4 text-sm font-medium shrink-0">
            <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:opacity-70 transition hidden lg:block">
              Contacto
            </a>
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`px-3 md:px-4 py-2 rounded-full font-bold flex items-center gap-2 transition hover:opacity-80 ${isLightTheme ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              🛒 <span className="hidden md:inline">Carrito</span> ({totalItems})
            </button>
          </div>
        </div>
      </nav>

      <header className="py-8 md:py-12 px-4 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">Catálogo de {store.name}</h1>
        <p className="text-base md:text-lg opacity-70">
          Los mejores productos de {store.category.toLowerCase()}.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        
        <div className="flex flex-col gap-4 mb-8">
          <div className="md:hidden relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition ${isLightTheme ? 'bg-black/5 border-black/10 focus:border-black/30 placeholder-black/50' : 'bg-white/5 border-white/10 focus:border-white/30 placeholder-white/50'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {categoriesList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setSelectedCategory("Todos")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  selectedCategory === "Todos" 
                    ? (isLightTheme ? 'bg-black text-white' : 'bg-white text-black') 
                    : `border ${isLightTheme ? 'border-black/20 hover:border-black' : 'border-white/20 hover:border-white'} opacity-70 hover:opacity-100`
                }`}
              >
                Todos
              </button>
              {categoriesList.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                    selectedCategory === cat 
                      ? (isLightTheme ? 'bg-black text-white' : 'bg-white text-black') 
                      : `border ${isLightTheme ? 'border-black/20 hover:border-black' : 'border-white/20 hover:border-white'} opacity-70 hover:opacity-100`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <p className="text-xl">Próximamente habrá productos disponibles.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <p className="text-xl">No se encontraron productos con esa búsqueda.</p>
            <button onClick={() => { setSearchQuery(""); setSelectedCategory("Todos"); }} className="mt-4 underline font-bold">Limpiar filtros</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className={`${theme.card} rounded-2xl overflow-hidden shadow-sm border ${isLightTheme ? 'border-black/5' : 'border-white/5'} group flex flex-col`}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="h-40 md:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className={`h-40 md:h-48 w-full ${theme.bg} opacity-30 flex items-center justify-center`}>
                    <span className="text-4xl">🛍️</span>
                  </div>
                )}
                
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1 block">{p.category || "General"}</span>
                    <h3 className="font-bold text-sm md:text-base mb-1 leading-tight line-clamp-2">{p.name}</h3>
                    <p className="text-xs opacity-70 mb-3">{p.stock > 0 ? `${p.stock} disponibles` : "Sin stock"}</p>
                  </div>
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 mt-auto">
                    <span className={`text-lg font-bold ${theme.accent}`}>${p.price}</span>
                    <button 
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      className={`w-full xl:w-auto px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition ${isLightTheme ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className={`py-8 text-center border-t ${isLightTheme ? 'border-black/10' : 'border-white/10'} opacity-60 text-xs`}>
        <p>© 2026 {store.name}. Creado con ARAE.</p>
      </footer>

      {/* CARRITO LATERAL */}
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartOpen(false)} />
      <aside className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white text-slate-900 z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">Tu Carrito</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-black text-2xl font-bold p-2">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10"><p className="text-4xl mb-4">🛒</p><p>Tu carrito está vacío</p></div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-xl">🛍️</span>}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-emerald-600 font-bold">${item.price}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100">-</button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100">+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-sm p-2">🗑️</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span>Total:</span>
              <span>${total}</span>
            </div>
            <button onClick={handleCheckout} className="w-full bg-[#25D366] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#20b858] transition">
              <span className="text-xl">📱</span> Finalizar por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}