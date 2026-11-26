"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { resizeImage } from "@/lib/resizeImage";
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
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  const resetForm = () => {
    setNewProduct(EMPTY_PRODUCT);
    setImageFile(null);
    setEditImageUrl("");
    setEditingProductId(null);
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
        showToast("Error al guardar", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error al procesar la imagen o guardar el producto", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
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
        showToast("No se pudo eliminar el producto", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error al eliminar el producto", "error");
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
  };
}