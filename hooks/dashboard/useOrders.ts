
"use client";

import { useState, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { useDialog } from "@/lib/dialog-context";
import type { ToastType } from "./useToast";
import type { DashboardTab } from "./useDashboard";

type ShowToast = (message: string, type?: ToastType) => void;

interface UseOrdersArgs {
  orders: any[];
  setOrders: Dispatch<SetStateAction<any[]>>;
  setProducts: Dispatch<SetStateAction<any[]>>;
  showToast: ShowToast;
  activeTab: DashboardTab;
}

export function useOrders({
  orders,
  setOrders,
  setProducts,
  showToast,
  activeTab,
}: UseOrdersArgs) {
  const { showConfirm, showAlert } = useDialog();

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Recordar cantidad de pedidos pendientes
  const prevPendingCount = useRef<number | null>(null);

  // Mantener actualizada la pestaña activa
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // ==========================================
  // ACTUALIZAR PEDIDOS
  // ==========================================

  const refreshOrders = async (silent = false) => {
    if (!silent) setLoadingOrders(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (!silent) {
          showToast(
            "Tu sesión expiró. Volvé a iniciar sesión.",
            "error"
          );
        }
        return;
      }

      const res = await fetch("/api/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || "No se pudieron cargar los pedidos."
        );
      }

      const fetchedOrders = Array.isArray(data) ? data : [];

      setOrders(fetchedOrders);

      // Detectar pedidos nuevos
      const currentPendingCount = fetchedOrders.filter(
        (order) => order.status === "PENDING"
      ).length;

      if (
        prevPendingCount.current !== null &&
        currentPendingCount > prevPendingCount.current
      ) {
        if (activeTabRef.current !== "pedidos") {
          showToast("¡Tenés un pedido nuevo! 🛎️", "success");
        }
      }

      prevPendingCount.current = currentPendingCount;

    } catch (error) {
      console.error("Error al actualizar pedidos:", error);

      if (!silent) {
        showToast(
          error instanceof Error
            ? error.message
            : "Error al cargar pedidos.",
          "error"
        );
      }
    } finally {
      if (!silent) {
        setLoadingOrders(false);
      }
    }
  };

  // ==========================================
  // AUTO-REFRESCO CADA 15 SEGUNDOS
  // ==========================================

  useEffect(() => {
    refreshOrders(true);

    const interval = setInterval(() => {
      refreshOrders(true);
    }, 15000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // CONFIRMAR O CANCELAR PEDIDOS
  // ==========================================

  const handleOrderAction = (
    orderId: string,
    action: "confirm" | "cancel"
  ) => {
    const isConfirming = action === "confirm";

    showConfirm({
      title: isConfirming
        ? "¿Confirmar pedido?"
        : "¿Cancelar pedido?",

      message: isConfirming
        ? "El pedido pasará a estado vendido y se descontará el stock de los productos."
        : "El pedido será cancelado. Si ya estaba vendido, se devolverá el stock correspondiente.",

      confirmText: isConfirming
        ? "Sí, confirmar"
        : "Sí, cancelar",

      cancelText: "Volver",

      onConfirm: async () => {
        setProcessingOrderId(orderId);

        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            throw new Error(
              "Tu sesión expiró. Volvé a iniciar sesión."
            );
          }

          // Actualizar pedido en el backend
          const res = await fetch("/api/orders", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              orderId,
              action,
            }),
          });

          const data = await res.json().catch(() => null);

          if (!res.ok) {
            throw new Error(
              data?.error || "No se pudo actualizar el pedido."
            );
          }

          // Actualizar pedido en pantalla
          setOrders((previous) =>
            previous.map((order) =>
              order.id === orderId ? data : order
            )
          );

          // Actualizar contador de pedidos pendientes
          if (prevPendingCount.current !== null) {
            prevPendingCount.current = Math.max(
              0,
              prevPendingCount.current - 1
            );
          }

          // Obtener stock actualizado
          const storeRes = await fetch("/api/stores/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          });

          if (storeRes.ok) {
            const storeData = await storeRes.json();
            setProducts(storeData.products || []);
          }

          // Notificación de éxito
          showToast(
            isConfirming
              ? "Pedido confirmado. Stock actualizado."
              : "Pedido cancelado. Stock actualizado si correspondía.",
            "success"
          );

        } catch (error) {
          console.error(
            "Error al procesar pedido:",
            error
          );

          // Alert personalizado
          showAlert(
            "No se pudo procesar el pedido",
            error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado."
          );

          await refreshOrders();

        } finally {
          setProcessingOrderId(null);
        }
      },
    });
  };

  return {
    loadingOrders,
    processingOrderId,
    refreshOrders,
    handleOrderAction,
  };
}
