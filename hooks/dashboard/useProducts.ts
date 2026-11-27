"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { resizeImage } from "@/lib/resizeImage";
import { useDialog } from "@/lib/dialog-context";
import type { ToastType } from "./useToast";

type ShowToast = (message: string, type?: ToastType) => void;

interface UseProductsArgs {
  store: any;
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  customFields: any[];
  showToast: ShowToast;
}

const EMPTY_PRODUCT = { name: "", price: "", stock: "", category: "" };

export function useProducts({
  store,
  products,
  setProducts,
  customFields,
  showToast,
}: UseProductsArgs) {
  const { showConfirm } = useDialog();
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  
  const [isUpdatingStock, setIsUpdatingStock] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const resetForm = () => {
    setNewProduct(EMPTY_PRODUCT);
    setImageFile(null);
    setEditImageUrl("");
    setEditingProductId(null); // 👈 Aseguramos que se limpie
    setCustomFieldValues({});
    setIsAdding(false);
  };

  const handleEditClick = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
    });
    setEditImageUrl(product.imageUrl || "");
    setImageFile(null);
    const existingValues: Record<string, string> = {};
    (product.customFieldValues || []).forEach((item: any) => {
      existingValues[item.fieldId] = item.value ?? "";
    });
    setCustomFieldValues(existingValues);
    setIsAdding(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !store) return;

    setIsUploading(true);
    let finalImageUrl = editingProductId ? editImageUrl : "";

    try {
      if (imageFile) {
        const resizedBlob = await resizeImage(imageFile, 800, 800);
        const filePath = `${store.id}/${Math.random()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, resizedBlob, { contentType: "image/jpeg" });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath);
        finalImageUrl = publicUrl;
      }

      const isEditing = !!editingProductId;
      // 👇 Construcción segura de la URL y el método
      const url = isEditing ? `/api/products/${editingProductId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          storeId: store.id,
          name: newProduct.name,
          price: newProduct.price,
          stock: newProduct.stock || 0,
          imageUrl: finalImageUrl,
          category:
            newProduct.category.trim() !== ""
              ? newProduct.category.trim()
              : "General",
          customFieldValues: customFields.map((field) => ({
            fieldId: field.id,
            value: customFieldValues[field.id] ?? "",
          })),
        }),
      });

      if (res.ok) {
        const savedProduct = await res.json();
        if (isEditing) {
          setProducts(
            products.map((p) => (p.id === editingProductId ? savedProduct : p))
          );
          showToast("Producto actualizado");
        } else {
          setProducts([savedProduct, ...products]);
          showToast("Producto creado");
        }
        resetForm();
      } else {
        const errorData = await res.json().catch(() => null);
        console.error("Error guardando producto:", errorData);
        showToast(errorData?.error || "Error al guardar", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error al procesar la imagen o guardar el producto", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    showConfirm({
      title: "¿Eliminar producto?",
      message: "Esta acción no se puede deshacer. El producto desaparecerá de tu catálogo.",
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
            return;
          }

          const res = await fetch(`/api/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (res.ok) {
            setProducts(products.filter((p) => p.id !== id));
            showToast("Producto eliminado");
          } else {
            const errorData = await res.json().catch(() => null);
            showToast(errorData?.error || "No se pudo eliminar el producto", "error");
          }
        } catch (error) {
          console.error(error);
          showToast("Error al eliminar el producto", "error");
        }
      }
    });
  };

  const handleQuickStockUpdate = async (productId: string, delta: number) => {
    setIsUpdatingStock(productId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada");

      const res = await fetch(`/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ delta })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar stock");

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: data.stock } : p))
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Error al actualizar stock", "error");
    } finally {
      setIsUpdatingStock(null);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      
      const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
      const headers = lines[0].toLowerCase().split(",");
      
      const nameIndex = headers.findIndex(h => h.includes("nombre"));
      const priceIndex = headers.findIndex(h => h.includes("precio"));
      const stockIndex = headers.findIndex(h => h.includes("stock"));
      const catIndex = headers.findIndex(h => h.includes("categoria"));

      if (nameIndex === -1 || priceIndex === -1) {
        throw new Error("El CSV debe tener al menos las columnas 'nombre' y 'precio'.");
      }

      const newProducts = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        
        if (!cols[nameIndex] || !cols[priceIndex]) continue;

        const productData: any = {
          name: cols[nameIndex].replace(/^"|"$/g, '').trim(),
          price: Number(cols[priceIndex].replace(/[^0-9.-]+/g, "")),
          stock: stockIndex !== -1 ? Number(cols[stockIndex]) || 0 : 0,
          category: catIndex !== -1 ? cols[catIndex].replace(/^"|"$/g, '').trim() : "General",
          customFields: {}
        };

        headers.forEach((header, index) => {
          if (["nombre", "precio", "stock", "categoria"].includes(header)) return;
          
          if (cols[index]) {
            productData.customFields[header.trim()] = cols[index].replace(/^"|"$/g, '').trim();
          }
        });

        newProducts.push(productData);
      }

      if (newProducts.length === 0) throw new Error("No se encontraron productos válidos en el archivo.");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada");

      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ storeId: store.id, products: newProducts })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al importar");

      const storeRes = await fetch("/api/stores/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store"
      });
      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setProducts(storeData.products || []);
      }

      showToast(`¡${data.count} productos importados con éxito!`);
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al procesar el CSV", "error");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  return {
    newProduct,
    setNewProduct,
    imageFile,
    setImageFile,
    isUploading,
    isAdding,
    setIsAdding,
    editingProductId,
    editImageUrl,
    customFieldValues,
    setCustomFieldValues,
    resetForm,
    handleEditClick,
    handleSaveProduct,
    handleDeleteProduct,
    handleQuickStockUpdate,
    isUpdatingStock,
    handleImportCSV,
    isImporting
  };
}