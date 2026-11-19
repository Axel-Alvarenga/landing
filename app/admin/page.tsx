"use client";
import { useState } from "react";

type User = {
  id: string;
  email: string;
  created_at: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Contraseña maestra temporal (Luego la movemos al .env)
  const ADMIN_PASSWORD = "arae2026";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      alert("Contraseña incorrecta");
      return;
    }

    setIsAuthenticated(true);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        // Ordenamos por fecha de creación (más nuevos primero)
        const sortedUsers = data.sort((a: User, b: User) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setUsers(sortedUsers);
      } else {
        alert("Error al cargar usuarios. Revisá la Service Role Key.");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 font-sans">
        <form onSubmit={handleLogin} className="bg-[#15181e] border border-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Admin ARAE</h1>
            <p className="text-slate-400 text-sm mt-1">Acceso restringido</p>
          </div>
          <input
            type="password"
            placeholder="Contraseña maestra"
            className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold hover:bg-emerald-400 transition">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  // Calcular métricas
  const totalUsers = users.length;
  const activeTrialUsers = users.filter(u => {
    const days = Math.floor((new Date().getTime() - new Date(u.created_at).getTime()) / (1000 * 3600 * 24));
    return days <= 7;
  }).length;
  const expiredUsers = totalUsers - activeTrialUsers;

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans">
      
      {/* Navbar */}
      <nav className="bg-[#15181e] border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white tracking-tighter">ARAE</span>
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">Admin Panel</span>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-red-400 text-sm font-medium hover:text-red-300 transition">
          Cerrar Sesión
        </button>
      </nav>

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        
        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">Total Usuarios</p>
            <p className="text-4xl font-bold text-white">{totalUsers}</p>
          </div>
          <div className="bg-[#15181e] border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <p className="text-emerald-400 text-sm mb-2 font-medium">En Prueba (Activos)</p>
            <p className="text-4xl font-bold text-white">{activeTrialUsers}</p>
          </div>
          <div className="bg-[#15181e] border border-red-500/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <p className="text-red-400 text-sm mb-2 font-medium">Prueba Vencida</p>
            <p className="text-4xl font-bold text-white">{expiredUsers}</p>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white">Usuarios Registrados</h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-slate-400">Cargando usuarios...</div>
            ) : users.length === 0 ? (
              <div className="p-10 text-center text-slate-400">No hay usuarios registrados aún.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-400 uppercase bg-[#1a1e26]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Fecha de Registro</th>
                    <th className="px-6 py-4 font-medium">Días en Prueba</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {users.map((user) => {
                    const created = new Date(user.created_at);
                    const days = Math.floor((new Date().getTime() - created.getTime()) / (1000 * 3600 * 24));
                    const isExpired = days > 7;
                    
                    return (
                      <tr key={user.id} className="hover:bg-[#1a1e26]/50 transition">
                        <td className="px-6 py-4 font-medium text-white">{user.email}</td>
                        <td className="px-6 py-4 text-slate-400">
                          {created.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {isExpired ? "Vencido" : `${7 - days} días restantes`}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isExpired 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isExpired ? "Prueba Vencida" : "En Prueba"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}