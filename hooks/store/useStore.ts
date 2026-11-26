"use client";

import { useEffect, useState } from "react";
import type { Product, Store } from "@/lib/store/types";

export function useStore(params: Promise<{ slug: string }>) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    let active = true;

    const loadStore = async () => {
      try {
        const p = await params;
        if (!active) return;
        setSlug(p.slug);

        const res = await fetch(`/api/stores/${p.slug}`);
        if (!res.ok) {
          setStore(null);
          return;
        }

        const storeData = await res.json();
        if (!active) return;

        setStore(storeData);
        setProducts(storeData.products || []);
      } catch (error) {
        console.error("Error al cargar la tienda:", error);
        if (active) setStore(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStore();

    return () => {
      active = false;
    };
  }, [params]);

  return { store, products, loading, slug };
}