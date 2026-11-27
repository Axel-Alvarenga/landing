"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { ToastType } from "./useToast";
import type { DashboardTab } from "./useDashboard";

type ShowToast = (message: string, type?: ToastType) => void;

interface UseOrdersArgs {
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  showToast: ShowToast;
  activeTab: DashboardTab;
}

// 👇 Función para reintentar si la DB está dormida
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

export function useOrders({ 
  orders, 
  setOrders, 
  setProducts, 
  showToast,
  activeTab
}: UseOrdersArgs) {
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  
  const prevPendingCount = useRef<number | null>(null);
  const hasExpiredRef = useRef(false); // 👈 Evita seguir consultando si la sesión expiró

  const refreshOrders = async (silent = false) => {
    if (hasExpiredRef.current) return; // Si ya sabemos que expiró, no hacemos nada

    if (!silent) setLoadingOrders(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        hasExpiredRef.current = true;
        if (!silent) showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetchWithRetry("/api/orders", {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });

      // 👇 Si la API dice 401, silenciamos el error y marcamos como expirado
      if (res.status === 401) {
        hasExpiredRef.current = true;
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "No se pudieron cargar los pedidos");

      const fetchedOrders = Array.isArray(data) ? data : [];
      setOrders(fetchedOrders);

      const currentPendingCount = fetchedOrders.filter((o) => o.status === "PENDING").length;

      if (prevPendingCount.current !== null && currentPendingCount > prevPendingCount.current) {
        if (activeTab !== "pedidos") {
          showToast("¡Tenés un pedido nuevo! 🛎️", "success");
        }
      }
      
      prevPendingCount.current = currentPendingCount;

    } catch (error) {
      console.error(error);
      if (!silent) showToast(error instanceof Error ? error.message : "Error al cargar pedidos", "error");
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  };

  // 👇 AUTO-REFRESCO INTELIGENTE
  useEffect(() => {
    refreshOrders(true);

    const interval = setInterval(() => {
      refreshOrders(true);
    }, 15000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOrderAction = async (orderId: string, action: "confirm" | "cancel") => {
    const confirmation =
      action === "confirm"
        ? "¿Confirmar este pedido como vendido? Se descontará el stock."
        : "¿Cancelar este pedido? Si ya estaba vendido, se devolverá el stock.";

    if (!confirm(confirmation)) return;

    setProcessingOrderId(orderId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");

      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orderId, action }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar el pedido");

      setOrders((previous) =>
        previous.map((order) => (order.id === orderId ? data : order))
      );

      // Actualizamos la ref manualmente al confirmar/cancelar para que no salte el toast
      if (prevPendingCount.current !== null) {
        prevPendingCount.current = Math.max(0, prevPendingCount.current - 1);
      }

      // Actualizar productos para reflejar el stock nuevo
      const storeRes = await fetch("/api/stores/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setProducts(storeData.products || []);
      }

      showToast(
        action === "confirm"
          ? "Pedido confirmado. Stock actualizado."
          : "Pedido cancelado. Stock actualizado si correspondía."
      );
    } catch (error) {
      console.error("Error al procesar pedido:", error);
      showToast(
        error instanceof Error ? error.message : "Error al procesar pedido",
        "error"
      );
      await refreshOrders();
    } finally {
      setProcessingOrderId(null);
    }
  };

  return {
    loadingOrders,
    processingOrderId,
    refreshOrders,
    handleOrderAction,
  };
}