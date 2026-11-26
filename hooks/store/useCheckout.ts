"use client";

import { useState } from "react";
import type { CartItem, Store } from "@/lib/store/types";

interface UseCheckoutArgs {
  store: Store | null;
  cart: CartItem[];
  total: number;
  onSuccess: () => void;
}

export function useCheckout({ store, cart, total, onSuccess }: UseCheckoutArgs) {
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!store || cart.length === 0 || isCheckingOut) return;

    if (!customerName.trim()) {
      alert("Por favor, ingresa tu nombre para continuar.");
      return;
    }

    try {
      setIsCheckingOut(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(data.error || "No se pudo registrar el pedido.");
      }

      // 👇 EL BACKEND NOS DA TODO LISTO Y SEGURO
      const { whatsappPhone, whatsappMessage } = data;

      if (!whatsappPhone) {
        throw new Error("El número de WhatsApp de esta tienda no es válido.");
      }

      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

      onSuccess(); // Limpia el carrito y localStorage
      window.location.href = whatsappUrl; // Redirige a WhatsApp

    } catch (error) {
      console.error("Error al finalizar pedido:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al registrar el pedido."
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