"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { resizeImage } from "@/lib/resizeImage";
import type { ToastType } from "./useToast";

type ShowToast = (message: string, type?: ToastType) => void;

interface UseStoreSettingsArgs {
  store: any;
  setStore: React.Dispatch<React.SetStateAction<any>>;
  showToast: ShowToast;
}

export function useStoreSettings({ store, setStore, showToast }: UseStoreSettingsArgs) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(store?.template || "");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const handleUploadLogo = async () => {
    if (!logoFile || !store) return;
    setIsUploadingLogo(true);

    try {
      const resizedBlob = await resizeImage(logoFile, 500, 500);
      const filePath = `${store.id}/logo-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, resizedBlob, { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetch(`/api/stores/${store.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ logoUrl: publicUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Error guardando logo:", errorData);
        throw new Error("Error al guardar el logo");
      }

      const updatedStore = await res.json();
      setStore(updatedStore);
      setLogoFile(null);
      showToast("Logo actualizado correctamente");
    } catch (error) {
      console.error(error);
      showToast("Error al subir el logo", "error");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!previewTemplate || !store) return;
    setIsSavingTemplate(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Tu sesión expiró. Volvé a iniciar sesión.", "error");
        return;
      }

      const res = await fetch(`/api/stores/${store.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ template: previewTemplate.id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Error guardando diseño:", errorData);
        throw new Error("Error al guardar el diseño");
      }

      const updatedStore = await res.json();
      setStore(updatedStore);
      setSelectedTemplate(updatedStore.template);
      setPreviewTemplate(null);
      showToast("Diseño aplicado correctamente");
    } catch (error) {
      console.error(error);
      showToast("Error al aplicar el diseño", "error");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return {
    logoFile,
    setLogoFile,
    isUploadingLogo,
    handleUploadLogo,
    selectedTemplate,
    setSelectedTemplate,
    previewTemplate,
    setPreviewTemplate,
    isSavingTemplate,
    handleApplyTemplate,
  };
}