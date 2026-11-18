"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const checkUserAndFetchStore = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      // --- LÓGICA DE PRUEBA GRATIS (7 DÍAS) ---
      const userCreatedAt = new Date(session.user.created_at);
      const today = new Date();
      const diffInDays = Math.floor((today.getTime() - userCreatedAt.getTime()) / (1000 * 3600 * 24));

      if (diffInDays > 7) {
        window.location.href = "/upgrade"; 
        return;
      }
      // ----------------------------------------

      const slug = localStorage.getItem("currentStoreSlug");
      if (slug) {
        const res = await fetch(`/api/stores/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setStore(data);
          setProducts(data.products || []);
        }
      }
      setLoading(false);
    };

    checkUserAndFetchStore();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !store) return;

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeId: store.id,
        name: newProduct.name,
        price: newProduct.price,
        stock: newProduct.stock || 0
      })
    });

    if (res.ok) {
      const addedProduct = await res.json();
      setProducts([addedProduct, ...products]);
      setNewProduct({ name: "", price: "", stock: "" });
      setIsAdding(false);
    } else {
      alert("Error al crear el producto");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("currentStoreSlug");
    window.location.href = "/login";
  };

  if (loading) return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-white">Cargando panel...</div>;

  if (!store) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-3xl font-bold mb-4">No tenés una tienda activa</h1>
        <p className="text-slate-400 mb-8">Creá tu tienda para acceder al panel o iniciá sesión con otra cuenta.</p>
        <div className="flex gap-4">
          <Link href="/registro" className="bg-emerald-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-emerald-400 transition">
            Crear mi tienda
          </Link>
          <button onClick={handleLogout} className="bg-slate-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-600 transition">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-[#15181e] border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white tracking-tighter">ARAE</h2>
          <p className="text-xs text-slate-500 mt-1">Panel de Control</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 bg-emerald-500/10 text-emerald-400 px-4 py-3 rounded-lg font-medium transition">
            <span>📊</span> Resumen
          </button>
          <button className="w-full flex items-center gap-3 hover:bg-[#1a1e26] text-slate-400 px-4 py-3 rounded-lg font-medium transition">
            <span>📦</span> Productos
          </button>
          <button className="w-full flex items-center gap-3 hover:bg-[#1a1e26] text-slate-400 px-4 py-3 rounded-lg font-medium transition">
            <span>🛒</span> Pedidos
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/" className="w-full flex items-center justify-center gap-2 bg-[#0f1115] border border-slate-700 text-slate-300 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
            ← Salir al inicio
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 py-2.5 rounded-lg text-sm font-medium hover:bg-red-500/20 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Hola, {store.name} 👋</h1>
            <p className="text-slate-400 mt-1">Acá tenés el resumen de tu tienda hoy.</p>
          </div>
          <Link 
            href={`/t/${store.slug}`} 
            target="_blank"
            className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition inline-flex items-center gap-2 text-sm shadow-lg w-fit"
          >
            Ver mi tienda ↗
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">Ventas de hoy</p>
            <p className="text-3xl font-bold text-white">$0.00</p>
            <p className="text-xs text-emerald-500 mt-2">Empieza a vender para ver datos</p>
          </div>
          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">Visitas</p>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-xs text-slate-500 mt-2">Compartí tu tienda en redes</p>
          </div>
          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">Productos Activos</p>
            <p className="text-3xl font-bold text-white">{products.length}</p>
            <p className="text-xs text-slate-500 mt-2">En tu catálogo</p>
          </div>
        </div>

        <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Tus Productos</h2>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400 transition"
            >
              {isAdding ? "Cancelar" : "+ Agregar Producto"}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddProduct} className="p-6 bg-[#0f1115] border-b border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del producto</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Ej: Remera Negra"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Precio (en números)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Ej: 2500"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stock</label>
                <input
                  type="number"
                  className="w-full bg-[#15181e] border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Ej: 10"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </div>
              <button 
                type="submit"
                className="bg-white text-black p-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 transition"
              >
                Guardar Producto
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No tenés productos aún. Agregá tu primer producto arriba.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-400 uppercase bg-[#1a1e26]">
                  <tr>
                    <th className="px-6 py-3 font-medium">Producto</th>
                    <th className="px-6 py-3 font-medium">Precio</th>
                    <th className="px-6 py-3 font-medium">Stock</th>
                    <th className="px-6 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#1a1e26]/50 transition">
                      <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                      <td className="px-6 py-4 text-emerald-400 font-medium">${p.price}</td>
                      <td className="px-6 py-4 text-slate-400">{p.stock} unidades</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-red-400 hover:text-red-300 font-medium text-xs bg-red-400/10 px-3 py-1.5 rounded transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}