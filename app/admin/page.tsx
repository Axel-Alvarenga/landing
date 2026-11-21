
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  email: string;
  created_at: string;
};

type Store = {
  id: string;
  name: string;
  category: string;
  slug: string;
  userId: string | null;
  whatsapp: string;
  createdAt: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  planActivatedAt: string | null;
  products: any[];
};

type ConfirmAction = {
  type: "activate" | "extend_trial" | "delete_store";
  id: string;
  message: string;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState("usuarios");
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [confirmAction, setConfirmAction] =
    useState<ConfirmAction | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Estado de suscripción de una tienda
  const getStoreStatus = (store: Store) => {
    const now = new Date();
    const isPro = store.subscriptionEndsAt !== null;

    const expiresAt = isPro
      ? new Date(store.subscriptionEndsAt!)
      : store.trialEndsAt
        ? new Date(store.trialEndsAt)
        : new Date(
            new Date(store.createdAt).getTime() +
              7 * 24 * 60 * 60 * 1000
          );

    const graceEndsAt = new Date(expiresAt);
    graceEndsAt.setDate(graceEndsAt.getDate() + 2);

    if (now <= expiresAt) {
      return {
        label: isPro ? "Pro vigente" : "En prueba",
        color: isPro
          ? "bg-blue-500/10 text-blue-400"
          : "bg-emerald-500/10 text-emerald-400",
        expiresAt,
        isPro,
        isActive: true,
        canExtendTrial: !isPro,
      };
    }

    if (now <= graceEndsAt) {
      return {
        label: "En período de gracia",
        color: "bg-yellow-500/10 text-yellow-400",
        expiresAt,
        isPro,
        isActive: false,
        canExtendTrial: !isPro,
      };
    }

    return {
      label: isPro ? "Pro vencido" : "Prueba vencida",
      color: "bg-red-500/10 text-red-400",
      expiresAt,
      isPro,
      isActive: false,
      canExtendTrial: !isPro,
    };
  };

  // Detectar vencimientos dentro de los próximos 3 días calendario
  const isExpiringSoon = (expiresAt: Date) => {
    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const expirationDay = new Date(expiresAt);
    expirationDay.setHours(0, 0, 0, 0);

    const difference =
      expirationDay.getTime() - today.getTime();

    const threeDays = 3 * 24 * 60 * 60 * 1000;

    return difference >= 0 && difference <= threeDays;
  };

  // Preparar mensaje y enlace de WhatsApp
  const getWhatsAppReminderLink = (
    store: Store,
    expiresAt: Date
  ) => {
    let phone = (store.whatsapp || "").replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone = phone.substring(1);
    }

    if (!phone.startsWith("595")) {
      phone = "595" + phone;
    }

    const formattedDate = expiresAt.toLocaleDateString("es-PY");

    const message = `¡Hola! 👋 Te contactamos de ARAE para recordarte que la suscripción de tu tienda "${store.name}" está próxima a vencer el ${formattedDate}.

Para continuar disfrutando de todas las funciones de ARAE, puedes renovar tu plan Pro por Gs. 70.000 al mes.

Si ya realizaste el pago, puedes ignorar este mensaje.

¡Muchas gracias por confiar en ARAE! 🚀`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Cargar sesión existente
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) return;

      const token = session.access_token;
      setAccessToken(token);

      const authorized = await fetchData(token);

      if (authorized) {
        setIsAuthenticated(true);
      } else {
        await supabase.auth.signOut();
        setAccessToken("");
      }
    };

    checkSession();
  }, []);

  // Inicio de sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        showToast("Correo o contraseña incorrectos", "error");
        return;
      }

      const token = data.session.access_token;
      setAccessToken(token);

      const authorized = await fetchData(token);

      if (!authorized) {
        await supabase.auth.signOut();
        setAccessToken("");
        showToast(
          "Esta cuenta no tiene permisos de administrador",
          "error"
        );
        return;
      }

      setIsAuthenticated(true);
      setPassword("");
      showToast("Bienvenido al panel de administración");
    } catch {
      showToast("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios y tiendas
  const fetchData = async (token: string): Promise<boolean> => {
    setLoading(true);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [resUsers, resStores] = await Promise.all([
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/stores", { headers }),
      ]);

      if (resUsers.status === 401 || resStores.status === 401) {
        return false;
      }

      if (!resUsers.ok || !resStores.ok) {
        showToast("Error al cargar los datos", "error");
        return false;
      }

      const usersData = await resUsers.json();
      const storesData = await resStores.json();

      setUsers(
        usersData.sort(
          (a: User, b: User) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
      );

      setStores(storesData);

      return true;
    } catch {
      showToast("Error de conexión", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();

    setAccessToken("");
    setIsAuthenticated(false);
    setUsers([]);
    setStores([]);
    setSelectedUser(null);

    showToast("Sesión cerrada");
  };

  // Abrir las tiendas de un usuario específico
  const viewUserStores = (user: User) => {
    setSelectedUser(user);
    setActiveTab("tiendas");
    setSearchQuery("");
  };

  // Volver al listado general
  const viewAllStores = () => {
    setSelectedUser(null);
    setSearchQuery("");
  };

  // Ejecutar acciones administrativas
  const executeAction = async () => {
    if (!confirmAction || !accessToken) return;

    const { type, id } = confirmAction;
    setConfirmAction(null);

    try {
      if (type === "delete_store") {
        const res = await fetch(
          `/api/admin/stores?id=${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (res.ok) {
          showToast("Tienda eliminada correctamente");
          await fetchData(accessToken);
        } else {
          showToast("Error al eliminar tienda", "error");
        }

        return;
      }

      const res = await fetch("/api/admin/stores", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          storeId: id,
          action: type,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        showToast(result.message || "Suscripción actualizada");
        await fetchData(accessToken);
      } else {
        showToast(
          result.error || "Error al actualizar suscripción",
          "error"
        );
      }
    } catch {
      showToast("Error de conexión", "error");
    }
  };

  // Métricas
  const totalUsers = users.length;

  const activeProStores = stores.filter(
    (store) =>
      store.subscriptionEndsAt !== null &&
      new Date(store.subscriptionEndsAt) > new Date()
  ).length;

  const mrr = activeProStores * 70000;

  const totalProducts = stores.reduce(
    (acc, store) => acc + store.products.length,
    0
  );

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrar tiendas por usuario seleccionado
  const userStores = selectedUser
    ? stores.filter((store) => store.userId === selectedUser.id)
    : stores;

  const filteredStores = userStores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pantalla de inicio de sesión
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 font-sans relative">
        {toast && (
          <div
            className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border ${
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {toast.message}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="bg-[#15181e] border border-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">
              Admin ARAE
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Acceso restringido
            </p>
          </div>

          <input
            type="email"
            placeholder="Correo electrónico"
            required
            autoComplete="email"
            className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            required
            autoComplete="current-password"
            className="w-full bg-[#0f1115] border border-slate-700 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  // Panel principal
  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans relative">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {toast.message}
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="text-2xl mb-4">⚠️</div>

            <h3 className="text-lg font-bold text-white mb-2">
              Confirmar acción
            </h3>

            <p className="text-slate-400 text-sm mb-6">
              {confirmAction.message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 border border-slate-600 py-2.5 rounded-lg font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                onClick={executeAction}
                className="flex-1 bg-emerald-500 text-black py-2.5 rounded-lg font-bold hover:bg-emerald-400"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-[#15181e] border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white tracking-tighter">
            ARAE
          </span>

          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
            Admin Panel
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="text-red-400 text-sm font-medium hover:text-red-300"
        >
          Cerrar Sesión
        </button>
      </nav>

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">
              Usuarios Totales
            </p>
            <p className="text-4xl font-bold text-white">
              {totalUsers}
            </p>
          </div>

          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">
              Tiendas Creadas
            </p>
            <p className="text-4xl font-bold text-white">
              {stores.length}
            </p>
          </div>

          <div className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm mb-2 font-medium">
              Productos en Total
            </p>
            <p className="text-4xl font-bold text-white">
              {totalProducts}
            </p>
          </div>

          <div className="bg-[#15181e] border border-blue-500/30 p-6 rounded-2xl">
            <p className="text-blue-400 text-sm mb-2 font-medium">
              Ingresos mensuales estimados
            </p>
            <p className="text-3xl font-bold text-white">
              Gs. {mrr.toLocaleString("es-PY")}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {activeProStores} tiendas con Pro vigente
            </p>
          </div>
        </div>

        {/* PESTAÑAS */}
        <div className="flex gap-4 border-b border-slate-800 mb-6">
          <button
            onClick={() => {
              setActiveTab("usuarios");
              setSelectedUser(null);
              setSearchQuery("");
            }}
            className={`pb-3 px-2 font-medium text-sm ${
              activeTab === "usuarios"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Gestión de Usuarios
          </button>

          <button
            onClick={() => {
              setActiveTab("tiendas");
              setSelectedUser(null);
              setSearchQuery("");
            }}
            className={`pb-3 px-2 font-medium text-sm ${
              activeTab === "tiendas"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Gestión de Tiendas
          </button>
        </div>

        {/* USUARIOS */}
        {activeTab === "usuarios" && (
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between gap-4">
              <h2 className="text-xl font-bold text-white">
                Usuarios Registrados
              </h2>

              <input
                type="text"
                placeholder="Buscar por email..."
                className="bg-[#0f1115] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-slate-400">
                  Cargando usuarios...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  No se encontraron usuarios.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-[#1a1e26]">
                    <tr>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Registro</th>
                      <th className="px-6 py-4">Tiendas</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((user) => {
                      const count = stores.filter(
                        (store) => store.userId === user.id
                      ).length;

                      return (
                        <tr key={user.id}>
                          <td className="px-6 py-4 font-medium text-white">
                            {user.email}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {new Date(user.created_at).toLocaleDateString(
                              "es-PY"
                            )}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {count} tiendas
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => viewUserStores(user)}
                              disabled={count === 0}
                              className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Ver tiendas
                            </button>
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

        {/* TIENDAS */}
        {activeTab === "tiendas" && (
          <div className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedUser
                    ? "Tiendas del usuario"
                    : "Tiendas en la Plataforma"}
                </h2>

                {selectedUser && (
                  <div className="mt-2">
                    <p className="text-sm text-emerald-400">
                      {selectedUser.email}
                    </p>

                    <button
                      onClick={viewAllStores}
                      className="text-xs text-slate-400 hover:text-white underline mt-2"
                    >
                      ← Ver todas las tiendas
                    </button>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="bg-[#0f1115] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-slate-400">
                  Cargando tiendas...
                </div>
              ) : filteredStores.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  {selectedUser
                    ? "Este usuario no tiene tiendas registradas."
                    : "No se encontraron tiendas."}
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-[#1a1e26]">
                    <tr>
                      <th className="px-6 py-4">Tienda</th>
                      <th className="px-6 py-4">Rubro</th>
                      <th className="px-6 py-4">Propietario</th>
                      <th className="px-6 py-4">Productos</th>
                      <th className="px-6 py-4">Suscripción</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/50">
                    {filteredStores.map((store) => {
                      const status = getStoreStatus(store);
                      const expiringSoon = isExpiringSoon(status.expiresAt);

                      const owner = users.find(
                        (user) => user.id === store.userId
                      );

                      return (
                        <tr key={store.id}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-white">
                              {store.name}
                            </p>

                            <a
                              href={`/t/${store.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-emerald-400 hover:underline"
                            >
                              Ver tienda ↗
                            </a>
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {store.category}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {owner?.email || "Sin propietario"}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {store.products.length} items
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}
                            >
                              {status.label}
                            </span>

                            <p className="text-xs text-slate-500 mt-2">
                              Vence:{" "}
                              {status.expiresAt.toLocaleDateString("es-PY")}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end flex-wrap gap-2">
                              {expiringSoon &&
                                store.whatsapp?.trim() && (
                                  <a
                                    href={getWhatsAppReminderLink(
                                      store,
                                      status.expiresAt
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-green-500/10 text-green-400 px-3 py-1.5 rounded border border-green-500/20 hover:bg-green-500/20 transition"
                                  >
                                    <span className="mr-1">💬</span>
                                    Avisar por WhatsApp
                                  </a>
                                )}

                              <button
                                onClick={() =>
                                  setConfirmAction({
                                    type: "activate",
                                    id: store.id,
                                    message: `¿Activar o renovar Pro para la tienda "${store.name}" por un mes?`,
                                  })
                                }
                                className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded hover:bg-blue-500/30"
                              >
                                {status.isActive && status.isPro
                                  ? "Renovar Pro"
                                  : "Activar Pro"}
                              </button>

                              {status.canExtendTrial && (
                                <button
                                  onClick={() =>
                                    setConfirmAction({
                                      type: "extend_trial",
                                      id: store.id,
                                      message: `¿Agregar 3 días de prueba a "${store.name}"?`,
                                    })
                                  }
                                  className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded hover:bg-slate-600"
                                >
                                  +3 Días
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  setConfirmAction({
                                    type: "delete_store",
                                    id: store.id,
                                    message: `¿Eliminar la tienda "${store.name}"? También se borrarán sus productos y pedidos. Esta acción no se puede deshacer.`,
                                  })
                                }
                                className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded border border-red-500/20"
                              >
                                Eliminar
                              </button>
                            </div>
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
      </main>
    </div>
  );
}
