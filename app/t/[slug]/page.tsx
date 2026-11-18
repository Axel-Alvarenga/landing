"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Tipos de datos
type Product = { id: string; name: string; price: number; stock: number };
type Store = { id: string; name: string; category: string; template: string; whatsapp: string; slug: string };
type CartItem = Product & { quantity: number };

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");

  // Estados del Carrito
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar la tienda y el carrito guardado
  useEffect(() => {
    params.then(async (p) => {
      setSlug(p.slug);
      
      const res = await fetch(`/api/stores/${p.slug}`);
      if (res.ok) {
        const storeData = await res.json();
        setStore(storeData);
        setProducts(storeData.products || []);
      }
      
      // Cargar carrito desde localStorage
      const savedCart = localStorage.getItem(`cart_${p.slug}`);
      if (savedCart) setCart(JSON.parse(savedCart));
      
      setLoading(false);
    });
  }, [params]);

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    if (slug) {
      localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
    }
  }, [cart, slug]);

  // Funciones del carrito
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
    setIsCartOpen(true); // Abrir el carrito automáticamente
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

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Función para enviar pedido por WhatsApp
  const handleCheckout = () => {
    if (!store || cart.length === 0) return;

    const phone = store.whatsapp.replace(/\D/g, ''); // Limpiar caracteres raros
    let message = `¡Hola *${store.name}*! 👋\nQuiero hacer el siguiente pedido:\n\n`;
    
    cart.forEach((item) => {
      message += `▪️ ${item.quantity}x ${item.name} - $${item.price * item.quantity}\n`;
    });
    
    message += `\n*Total:* $${total}\n\n¿Me confirmás disponibilidad?`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  if (loading) return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-white">Cargando tienda...</div>;

  if (!store) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-3xl font-bold mb-4">Tienda no encontrada</h1>
        <p className="text-slate-400 mb-8">No pudimos encontrar la tienda "{slug}".</p>
        <Link href="/registro" className="bg-emerald-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-emerald-400 transition">
          Crear una tienda
        </Link>
      </div>
    );
  }

  // Mapeo de colores según el template
  const templateColors: Record<string, { bg: string, text: string, accent: string, card: string }> = {
    g1: { bg: "bg-zinc-900", text: "text-white", accent: "text-amber-400", card: "bg-zinc-800" },
    g2: { bg: "bg-emerald-50", text: "text-emerald-950", accent: "text-emerald-600", card: "bg-white" },
    g3: { bg: "bg-red-500", text: "text-white", accent: "text-white", card: "bg-red-600" },
    g4: { bg: "bg-orange-100", text: "text-orange-950", accent: "text-orange-600", card: "bg-white" },
    r1: { bg: "bg-slate-900", text: "text-white", accent: "text-blue-400", card: "bg-slate-800" },
    r2: { bg: "bg-stone-100", text: "text-stone-900", accent: "text-stone-600", card: "bg-white" },
    r3: { bg: "bg-amber-200", text: "text-amber-950", accent: "text-amber-700", card: "bg-amber-100" },
    r4: { bg: "bg-blue-600", text: "text-white", accent: "text-blue-200", card: "bg-blue-700" },
    rl1: { bg: "bg-black", text: "text-white", accent: "text-yellow-500", card: "bg-zinc-900" },
    rl2: { bg: "bg-slate-200", text: "text-slate-900", accent: "text-slate-600", card: "bg-white" },
    rl3: { bg: "bg-blue-900", text: "text-white", accent: "text-blue-300", card: "bg-blue-800" },
    rl4: { bg: "bg-stone-800", text: "text-stone-100", accent: "text-stone-400", card: "bg-stone-700" },
    z1: { bg: "bg-white", text: "text-black", accent: "text-slate-500", card: "bg-slate-50" },
    z2: { bg: "bg-slate-800", text: "text-white", accent: "text-slate-300", card: "bg-slate-700" },
    z3: { bg: "bg-lime-400", text: "text-black", accent: "text-lime-800", card: "bg-lime-300" },
    z4: { bg: "bg-amber-800", text: "text-amber-50", accent: "text-amber-300", card: "bg-amber-900" },
    ri1: { bg: "bg-rose-100", text: "text-rose-950", accent: "text-rose-600", card: "bg-white" },
    ri2: { bg: "bg-slate-100", text: "text-slate-900", accent: "text-slate-500", card: "bg-white" },
    ri3: { bg: "bg-black", text: "text-white", accent: "text-rose-500", card: "bg-zinc-900" },
    ri4: { bg: "bg-teal-600", text: "text-white", accent: "text-teal-200", card: "bg-teal-700" },
    default: { bg: "bg-[#0f1115]", text: "text-white", accent: "text-emerald-500", card: "bg-[#15181e]" }
  };

  const theme = templateColors[store.template] || templateColors.default;
  const isLightTheme = ["g2", "g4", "r2", "r3", "rl2", "z1", "ri1", "ri2"].includes(store.template);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg} ${theme.text} font-sans relative overflow-x-hidden`}>
      
      {/* Navbar */}
      <nav className={`w-full border-b ${isLightTheme ? 'border-black/10' : 'border-white/10'} backdrop-blur-md sticky top-0 z-40`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-xl">{store.name}</span>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:opacity-70 transition hidden sm:block">
              Contacto
            </a>
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition hover:opacity-80 ${isLightTheme ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              🛒 Carrito ({totalItems})
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-16 px-4 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Bienvenido a {store.name}</h1>
        <p className="text-lg md:text-xl opacity-80 mb-8">
          Descubrí los mejores productos de {store.category.toLowerCase()}. Calidad garantizada.
        </p>
      </header>

      {/* Grilla de Productos */}
      <main className="max-w-6xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold mb-8 border-b pb-4 border-current/20">Nuestros Productos</h2>
        {products.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <p className="text-xl">Próximamente habrá productos disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className={`${theme.card} rounded-2xl overflow-hidden shadow-lg border border-black/5 group flex flex-col`}>
                <div className={`h-48 w-full ${theme.bg} opacity-50 flex items-center justify-center`}>
                  <span className="text-4xl">🛍️</span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                    <p className="text-xs opacity-70 mb-4">{p.stock > 0 ? `${p.stock} disponibles` : "Sin stock"}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-xl font-bold ${theme.accent}`}>${p.price}</span>
                    <button 
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition ${isLightTheme ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
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

      {/* Footer */}
      <footer className={`py-10 text-center border-t ${isLightTheme ? 'border-black/10' : 'border-white/10'} opacity-60 text-sm`}>
        <p>© 2026 {store.name}. Creado con ARAE.</p>
      </footer>

      {/* --- CARRITO LATERAL (DRAWER) --- */}
      {/* Fondo oscuro */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Panel del carrito */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white text-slate-900 z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">Tu Carrito</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-black text-2xl font-bold p-2">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p className="text-4xl mb-4">🛒</p>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl">🛍️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{item.name}</h4>
                  <p className="text-emerald-600 font-bold">${item.price}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100">-</button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100">+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-sm p-2">
                  🗑️
                </button>
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
            <button 
              onClick={handleCheckout}
              className="w-full bg-[#25D366] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#20b858] transition"
            >
              <span className="text-xl">📱</span> Finalizar por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}