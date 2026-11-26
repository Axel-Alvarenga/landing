
"use client";

import { useState } from "react";
import type { CartItem, Store } from "@/lib/store/types";
import { useDialog } from "@/lib/dialog-context";

interface UseCheckoutArgs {
  store: Store | null;
  cart: CartItem[];
  total: number;
  onSuccess: () => void;
}

export function useCheckout({
  store,
  cart,
  total,
  onSuccess,
}: UseCheckoutArgs) {
  const { showAlert } = useDialog();

  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!store || cart.length === 0 || isCheckingOut) return;

    // Validar nombre
    if (!customerName.trim()) {
      showAlert(
        "Falta el nombre",
        "Por favor, ingresa tu nombre para continuar."
      );
      return;
    }

    try {
      setIsCheckingOut(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeSlug: store.slug,
          customerName: customerName.trim(),
          paymentMethod,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo registrar el pedido."
        );
      }

      const { whatsappPhone, whatsappMessage } = data;

      // Validar número de WhatsApp recibido del backend
      if (!whatsappPhone) {
        throw new Error(
          "El número de WhatsApp de esta tienda no es válido."
        );
      }

      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      // Limpiar carrito
      onSuccess();

      // Redirigir a WhatsApp
      window.location.href = whatsappUrl;

    } catch (error) {
      console.error("Error al finalizar pedido:", error);

      showAlert(
        "Error al registrar pedido",
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return {
    customerName,
    setCustomerName,
    paymentMethod,
    setPaymentMethod,
    isCheckingOut,
    handleCheckout,
  };
}
