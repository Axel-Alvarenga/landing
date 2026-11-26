"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ToastType } from "./useToast";

type ShowToast = (message: string, type?: ToastType) => void;

interface UseOrdersArgs {
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  showToast: ShowToast;
}

export function useOrders({ orders, setOrders, setProducts, showToast }: UseOrdersArgs) {
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  const refreshOrders = async () => {
    setLoadingOrders(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "No se pudieron cargar los pedidos");

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error ? error.message : "Error al cargar pedidos",
        "error"
      );
    } finally {
      setLoadingOrders(false);
    }
  };

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