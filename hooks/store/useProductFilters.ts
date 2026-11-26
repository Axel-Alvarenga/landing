"use client";

import { useMemo, useState } from "react";
import type { CustomField, Product, Store } from "@/lib/store/types";

// Solo lo usamos para ordenar por custom field NUMBER
function getNumberFieldValue(
  product: Product,
  fieldId: string
): number | null {
  const cfv = (product.customFieldValues || []).find(
    (v) => v.fieldId === fieldId
  );
  if (!cfv || cfv.value.trim() === "") return null;
  const n = Number(cfv.value);
  return Number.isFinite(n) ? n : null;
}

export function useProductFilters(products: Product[], store: Store | null) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [customFilters, setCustomFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("relevance");

  const categoriesList = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.category || "General"))
      ).filter(Boolean) as string[],
    [products]
  );

  const filterableFields = useMemo<CustomField[]>(() => {
    if (!store) return [];
    return store.customFields.filter(
      (f) => f.type === "SELECT" || f.type === "CHECKBOX"
    );
  }, [store]);

  const numberFields = useMemo<CustomField[]>(() => {
    if (!store) return [];
    return store.customFields.filter((f) => f.type === "NUMBER");
  }, [store]);

  const sortOptions = useMemo(() => {
    const base = [
      { value: "relevance", label: "Relevancia" },
      { value: "price-asc", label: "Precio: menor a mayor" },
      { value: "price-desc", label: "Precio: mayor a menor" },
      { value: "name-asc", label: "Nombre: A–Z" },
      { value: "name-desc", label: "Nombre: Z–A" },
    ];

    const customNumberOptions = numberFields.flatMap((f) => [
      { value: `num-${f.id}-asc`, label: `${f.name}: menor a mayor` },
      { value: `num-${f.id}-desc`, label: `${f.name}: mayor a menor` },
    ]);

    return [...base, ...customNumberOptions];
  }, [numberFields]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesCategory =
        selectedCategory === "Todos" ||
        (p.category || "General") === selectedCategory;

      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCustomFields = Object.entries(customFilters).every(
        ([fieldId, filterValue]) => {
          if (!filterValue) return true;
          const cfv = (p.customFieldValues || []).find(
            (v) => v.fieldId === fieldId
          );
          return cfv?.value === filterValue;
        }
      );

      return matchesCategory && matchesSearch && matchesCustomFields;
    });

    const sorted = [...filtered];

    if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
    } else if (sortBy === "name-desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name, "es"));
    } else if (sortBy.startsWith("num-")) {
      const rest = sortBy.slice(4);
      const direction = rest.endsWith("-desc") ? "desc" : "asc";
      const fieldId = rest.slice(0, rest.lastIndexOf("-"));
      sorted.sort((a, b) => {
        const va = getNumberFieldValue(a, fieldId);
        const vb = getNumberFieldValue(b, fieldId);
        if (va === null && vb === null) return 0;
        if (va === null) return 1;
        if (vb === null) return -1;
        return direction === "asc" ? va - vb : vb - va;
      });
    }

    return sorted;
  }, [
    products,
    selectedCategory,
    searchQuery,
    customFilters,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
    setCustomFilters({});
    setSortBy("relevance");
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    customFilters,
    setCustomFilters,
    sortBy,
    setSortBy,
    categoriesList,
    filterableFields,
    numberFields,
    sortOptions,
    filteredProducts,
    resetFilters,
  };
}