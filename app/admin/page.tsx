"use client";
import { useState, useEffect } from "react";

type User = { id: string; email: string; created_at: string; user_metadata?: { plan?: string } };
type Store = { id: string; name: string; category: string; slug: string; products: any[] };

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("usuarios"); // "usuarios" | "tiendas"
  
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- SISTEMA DE NOTIFICACIONES Y MODALES ---
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [confirmAction, setConfirmAction] = useState<{ type: "activate" | "extend_trial" | "delete_store", id: string, message: string } | null>(null);

  const ADMIN_PASSWORD = "arae2026";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      showToast("Contraseña incorrecta", "error");
      return;
    }
    setIsAuthenticated(true);
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Usuarios
      const resUsers = await fetch("/api/admin/users");
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data.sort((a: User, b: User) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
      // Fetch Tiendas
      const resStores = await fetch("/api/admin/stores");
      if (resStores.ok) {
        const data = await resStores.json();
        setStores(data);
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    setConfirmAction(null);

    try {
      if (type === "delete_store") {
        const res = await fetch(`/api/admin/stores?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Tienda eliminada correctamente");
          fetchData();
        } else {
          showToast("Error al eliminar tienda", "error");
        }
      } else {
        // Acciones de usuario
        const res = await fetch("/api/admin/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, action: type })
        });
        if (res.ok) {
          showToast(type === "activate" ? "Usuario activado como Pro" : "Prueba extendida");
          fetchData();
        } else {
          showToast("Error al actualizar usuario", "error");
        }
      }
    } catch (error) {
      showToast("Error de conexión", "error");
    }
  };

  // Métricas
  const totalUsers = users.length;
  const proUsers = users.filter(u => u.user_metadata?.plan === "pro").length;
  const mrr = proUsers * 9;
  const totalProducts = stores.reduce((acc, store) => acc + store.products.length, 0);

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredStores = stores.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 font-sans relative">
        {toast && <div className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}><span className="text-xl">{toast.type === 'success' ? '✅' : '❌'}</span><p className="font-medium">{toast.message}</p></div>}
        
        <form onSubmit={handleLogin} className="bg-[#15181e] border border-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Admin ARAE</h1>
            <p className="text-slate-400 text-sm mt-1">Acceso restringido</p>
          </div>
          <input type="password" placeholder="Contraseña maestra" className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-emerald-500" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold hover:bg-emerald-400 transition">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans relative">
      {toast && <div className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-5 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}><span className="text-xl">{toast.type === 'success' ? '✅' : '❌'}</span><p className="font-medium">{toast.message}</p></div>}

      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Confirmar acción</h3>
            <p className="text-slate-400 text-sm mb-6">{confirmAction.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 border border-slate-600 py-2.5 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition">Cancelar</button>
              <button onClick={executeAction} className="flex-1 bg-emerald-500 text-black py-2.5 rounded-lg font-bold hover:bg-emerald-400 transition">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-[#15181e] border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white tracking-tighter">ARAE</span>
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">Admin Panel</span>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-red-400 text-sm font-medium hover:text-red-300 transition">Cerrar Sesión</button>
      </nav>

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        
        {/* MÉTRICAS GLOBALES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">Usuarios Totales</p>
            <p className="text-4xl font-bold text-white">{totalUsers}</p>
          </div>
          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">Tiendas Creadas</p>
            <p className="text-4xl font-bold text-white">{stores.length}</p>
          </div>
          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">Productos en Total</p>
            <p className="text-4xl font-bold text-white">{totalProducts}</p>
          </div>
          <div className="bg-[#15181e] border border-blue-500/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <p className="text-blue-400 text-sm mb-2 font-medium">Ingresos (MRR)</p>
            <p className="text-4xl font-bold text-white">${mrr}</p>
          </div>
        </div>

        {/* PESTAÑAS */}
        <div className="flex gap-4 border-b border-slate-800 mb-6">
          <button 
            onClick={() => { setActiveTab("usuarios"); setSearchQuery(""); }}
            className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === "usuarios" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-white"}`}
          >
            Gestión de Usuarios
          </button>
          <button 
            onClick={() => { setActiveTab("tiendas"); setSearchQuery(""); }}
            className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === "tiendas" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-white"}`}
          >
            Gestión de Tiendas
          </button>
        </div>

        {/* CONTENIDO: USUARIOS */}
        {activeTab === "usuarios" && (
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold text-white">Usuarios Registrados</h2>
              <div className="relative w-full md:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                <input type="text" placeholder="Buscar por email..." className="w-full bg-[#0f1115] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? <div className="p-10 text-center text-slate-400">Cargando usuarios...</div> : filteredUsers.length === 0 ? <div className="p-10 text-center text-slate-400">No se encontraron usuarios.</div> : (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-[#1a1e26]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Registro</th>
                      <th className="px-6 py-4 font-medium">Estado</th>
                      <th className="px-6 py-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((user) => {
                      const created = new Date(user.created_at);
                      const days = Math.floor((new Date().getTime() - created.getTime()) / (1000 * 3600 * 24));
                      const isPro = user.user_metadata?.plan === "pro";
                      const isExpired = days > 7 && !isPro;
                      
                      return (
                        <tr key={user.id} className="hover:bg-[#1a1e26]/50 transition">
                          <td className="px-6 py-4 font-medium text-white">{user.email}</td>
                          <td className="px-6 py-4 text-slate-400">{created.toLocaleDateString('es-AR')}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPro ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : isExpired ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                              {isPro ? "Plan Pro" : isExpired ? "Prueba Vencida" : "En Prueba"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            {!isPro && (
                              <>
                                <button onClick={() => setConfirmAction({ type: "extend_trial", id: user.id, message: `¿Darle 3 días más de prueba a ${user.email}?` })} className="text-xs font-medium bg-slate-700 text-white px-3 py-1.5 rounded hover:bg-slate-600 transition">+3 Días</button>
                                <button onClick={() => setConfirmAction({ type: "activate", id: user.id, message: `¿Activar Plan Pro para ${user.email}?` })} className="text-xs font-medium bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded hover:bg-blue-500/30 transition border border-blue-500/20">Activar Pro</button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO: TIENDAS */}
        {activeTab === "tiendas" && (
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold text-white">Tiendas en la Plataforma</h2>
              <div className="relative w-full md:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                <input type="text" placeholder="Buscar por nombre..." className="w-full bg-[#0f1115] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? <div className="p-10 text-center text-slate-400">Cargando tiendas...</div> : filteredStores.length === 0 ? <div className="p-10 text-center text-slate-400">No se encontraron tiendas.</div> : (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-[#1a1e26]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Tienda</th>
                      <th className="px-6 py-4 font-medium">Rubro</th>
                      <th className="px-6 py-4 font-medium">Productos</th>
                      <th className="px-6 py-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredStores.map((store) => (
                      <tr key={store.id} className="hover:bg-[#1a1e26]/50 transition">
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{store.name}</p>
                          <a href={`/t/${store.slug}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline">
                            Ver tienda ↗
                          </a>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          <span className="bg-slate-800 px-2.5 py-1 rounded-md text-xs">{store.category}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{store.products.length} items</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setConfirmAction({ type: "delete_store", id: store.id, message: `¿Estás seguro de eliminar la tienda "${store.name}"? Esta acción borrará todos sus productos y no se puede deshacer.` })}
                            className="text-xs font-medium bg-red-500/10 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20 transition border border-red-500/20"
                          >
                            Eliminar Tienda
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}