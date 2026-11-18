"use client";
import { useState } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // CONTRASEÑA PROVISORIA (Luego la cambiás por algo más seguro)
  const ADMIN_PASSWORD = "arae2026"; 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchUsers();
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Llamamos a nuestra API segura
      const res = await fetch('/api/admin/users');
      
      if (!res.ok) {
        throw new Error("Error al cargar usuarios. Verificá la Service Role Key.");
      }
      
      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 font-sans">
        <form onSubmit={handleLogin} className="bg-[#15181e] p-8 rounded-2xl border border-slate-800 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin ARAE</h1>
          <input
            type="password"
            placeholder="Contraseña de Admin"
            className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Panel de Administración</h1>
        
        {loading ? (
          <p className="text-center text-slate-400">Cargando usuarios...</p>
        ) : (
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#1a1e26] text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Fecha de Registro</th>
                  <th className="px-6 py-4">Días de Prueba</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((user) => {
                  const created = new Date(user.created_at);
                  const days = Math.floor((new Date().getTime() - created.getTime()) / (1000 * 3600 * 24));
                  const isExpired = days > 7;
                  
                  return (
                    <tr key={user.id} className="hover:bg-[#1a1e26]/50">
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{created.toLocaleDateString()}</td>
                      <td className="px-6 py-4">{days} días</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isExpired ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {isExpired ? "Vencido" : "En Prueba"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}