"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "./useToast";

export type DashboardTab = "resumen" | "productos" | "campos" | "pedidos" | "ajustes";

// 👇 FUNCIÓN PARA REINTENTAR SI LA DB ESTÁ DORMIDA
async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      // Si es 500, puede ser la DB dormida, reintentamos
      if (!res.ok && res.status >= 500 && i < retries - 1) {
        console.log(`Reintentando fetch a ${url} (intento ${i + 1})...`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos
        continue;
      }
      return res;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error("No se pudo conectar");
}

export function useDashboard() {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("resumen");
  const { toast, showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const checkUserAndFetchStore = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (isMounted) window.location.href = "/login";
          return;
        }

        // 👇 Usamos fetchWithRetry
        const res = await fetchWithRetry("/api/stores/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          console.error("Error buscando tienda:", errorData);
          
          if (res.status === 401 || res.status === 403) {
            await supabase.auth.signOut();
            if (isMounted) window.location.href = "/login";
            return;
          }

          if (isMounted) {
            setStore(null);
            setProducts([]);
          }
          return;
        }

        const data = await res.json();
        localStorage.setItem("currentStoreSlug", data.slug);

        if (isMounted) {
          setStore(data);
          setProducts(data.products || []);

          if (data.subscription?.canManage) {
            // 👇 Usamos fetchWithRetry para los campos
            const fieldsRes = await fetchWithRetry("/api/custom-fields", {
              method: "GET",
              headers: { Authorization: `Bearer ${session.access_token}` },
              cache: "no-store",
            });
            if (fieldsRes.ok) {
              const fieldsData = await fieldsRes.json();
              setCustomFields(Array.isArray(fieldsData) ? fieldsData : []);
            }

            // 👇 Usamos fetchWithRetry para los pedidos
            const ordersRes = await fetchWithRetry("/api/orders", {
              method: "GET",
              headers: { Authorization: `Bearer ${session.access_token}` },
              cache: "no-store",
            });
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();
              setOrders(Array.isArray(ordersData) ? ordersData : []);
            }
          }
        }

      } catch (error) {
        console.error("Error cargando Dashboard:", error);
        if (isMounted) {
          setStore(null);
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false); 
      }
    };

    checkUserAndFetchStore();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("currentStoreSlug");
    window.location.href = "/login";
  };

  const handleCopyStoreLink = async () => {
    if (!store) return;
    const storeUrl = `${window.location.origin}/t/${store.slug}`;
    try {
      await navigator.clipboard.writeText(storeUrl);
      showToast("¡Enlace de tu tienda copiado!");
    } catch (error) {
      console.error("No se pudo copiar el enlace:", error);
      showToast("No se pudo copiar el enlace. Intentá nuevamente.", "error");
    }
  };

  return {
    store,
    setStore,
    products,
    setProducts,
    orders,
    setOrders,
    customFields,
    setCustomFields,
    loading,
    activeTab,
    setActiveTab,
    toast,
    showToast,
    handleLogout,
    handleCopyStoreLink,
  };
}