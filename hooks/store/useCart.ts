"use client";

import { useEffect, useState } from "react";
import type { CartItem, Product, SelectedOption } from "@/lib/store/types";

export function useCart(slug: string) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const savedCart = localStorage.getItem(`cart_${slug}`);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem(`cart_${slug}`);
      }
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
    }
  }, [cart, slug]);

  const addToCart = (product: Product, selectedOptions: SelectedOption[]) => {
    setCart((prev) => {
      // Creamos una firma única basada en las opciones elegidas
      const optionString = selectedOptions.map((o) => `${o.fieldId}:${o.value}`).join("-");
      const cartItemId = `${product.id}-${optionString}`;

      const existing = prev.find((item) => item.cartItemId === cartItemId);

      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      if (product.stock <= 0) return prev;
      return [...prev, { ...product, quantity: 1, cartItemId, selectedOptions }];
    });

    if (product.stock > 0) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return item;
          if (newQuantity > item.stock) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    if (slug) localStorage.removeItem(`cart_${slug}`);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return { cart, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeFromCart, clearCart, total, totalItems };
}