"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "./useToast";

export type DashboardTab = "resumen" | "productos" | "campos" | "pedidos" | "ajustes";

export function useDashboard() {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("resumen");
  const { toast, showToast } = useToast();

  useEffect(() => {
    const checkUserAndFetchStore = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch("/api/stores/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error buscando tienda:", errorData);
          setStore(null);
          setProducts([]);
          return;
        }

        const data = await res.json();
        localStorage.setItem("currentStoreSlug", data.slug);

        setStore(data);
        setProducts(data.products || []);

        if (!data.subscription?.canManage) return;

        const fieldsRes = await fetch("/api/custom-fields", {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        if (fieldsRes.ok) {
          const fieldsData = await fieldsRes.json();
          setCustomFields(Array.isArray(fieldsData) ? fieldsData : []);
        } else {
          console.error(
            "Error cargando campos personalizados:",
            await fieldsRes.json().catch(() => null)
          );
        }

        const ordersRes = await fetch("/api/orders", {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } else {
          console.error(
            "Error cargando pedidos:",
            await ordersRes.json().catch(() => null)
          );
        }
      } catch (error) {
        console.error("Error cargando Dashboard:", error);
        setStore(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchStore();
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