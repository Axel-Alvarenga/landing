
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

const EMPTY_PRODUCT = {
  name: "",
  price: "",
  stock: "",
  category: "",
};

export function useProducts({
  store,
  products,
  setProducts,
  customFields,
  showToast,
}: UseProductsArgs) {
  const { showConfirm, showAlert } = useDialog();

  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});

  // ==========================================
  // REINICIAR FORMULARIO
  // ==========================================

  const resetForm = () => {
    setNewProduct(EMPTY_PRODUCT);
    setImageFile(null);
    setEditImageUrl("");
    setEditingProductId(null);
    setCustomFieldValues({});
    setIsAdding(false);
  };

  // ==========================================
  // EDITAR PRODUCTO
  // ==========================================

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

  // ==========================================
  // CREAR / ACTUALIZAR PRODUCTO
  // ==========================================

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploading) return;

    if (!store) {
      showAlert(
        "Error",
        "No se pudo identificar tu tienda."
      );
      return;
    }

    if (!newProduct.name.trim() || !newProduct.price) {
      showAlert(
        "Datos incompletos",
        "Ingresá el nombre y el precio del producto."
      );
      return;
    }

    setIsUploading(true);

    let finalImageUrl = editingProductId ? editImageUrl : "";

    try {
      // Subir imagen si existe
      if (imageFile) {
        const resizedBlob = await resizeImage(
          imageFile,
          800,
          800
        );

        const filePath = `${store.id}/${Math.random()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, resizedBlob, {
            contentType: "image/jpeg",
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const isEditing = !!editingProductId;

      const url = isEditing
        ? `/api/products/${editingProductId}`
        : "/api/products";

      const method = isEditing ? "PUT" : "POST";

      // Obtener sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showAlert(
          "Sesión expirada",
          "Tu sesión expiró. Volvé a iniciar sesión para continuar."
        );
        return;
      }

      // Enviar producto al backend
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

      const errorData = !res.ok
        ? await res.json().catch(() => null)
        : null;

      if (!res.ok) {
        throw new Error(
          errorData?.error || "No se pudo guardar el producto."
        );
      }

      const savedProduct = await res.json();

      // Actualizar productos sin utilizar estado desactualizado
      if (isEditing) {
        setProducts((previous) =>
          previous.map((p) =>
            p.id === editingProductId ? savedProduct : p
          )
        );

        showToast("Producto actualizado correctamente.", "success");
      } else {
        setProducts((previous) => [
          savedProduct,
          ...previous,
        ]);

        showToast("Producto creado correctamente.", "success");
      }

      resetForm();

    } catch (error) {
      console.error("Error guardando producto:", error);

      showAlert(
        "Error al guardar producto",
        error instanceof Error
          ? error.message
          : "Ocurrió un error al procesar la imagen o guardar el producto."
      );

    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================

  const handleDeleteProduct = (id: string) => {
    showConfirm({
      title: "¿Eliminar producto?",

      message:
        "Esta acción no se puede deshacer. El producto desaparecerá de tu catálogo.",

      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",

      onConfirm: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            showAlert(
              "Sesión expirada",
              "Tu sesión expiró. Volvé a iniciar sesión."
            );
            return;
          }

          const res = await fetch(`/api/products/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          const data = await res.json().catch(() => null);

          if (!res.ok) {
            throw new Error(
              data?.error || "No se pudo eliminar el producto."
            );
          }

          // Eliminar de la lista sin utilizar estado desactualizado
          setProducts((previous) =>
            previous.filter((p) => p.id !== id)
          );

          showToast("Producto eliminado correctamente.", "success");

        } catch (error) {
          console.error("Error al eliminar producto:", error);

          showAlert(
            "Error al eliminar producto",
            error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado."
          );
        }
      },
    });
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
