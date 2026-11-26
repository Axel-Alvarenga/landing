"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ToastType } from "./useToast";

type ShowToast = (message: string, type?: ToastType) => void;

interface UseCustomFieldsArgs {
  store: any;
  customFields: any[];
  setCustomFields: React.Dispatch<React.SetStateAction<any[]>>;
  showToast: ShowToast;
}

const EMPTY_FIELD_FORM = {
  name: "",
  type: "TEXT",
  options: "",
  required: false,
  showInStore: false,
};

export function useCustomFields({
  store,
  customFields,
  setCustomFields,
  showToast,
}: UseCustomFieldsArgs) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState(EMPTY_FIELD_FORM);
  const [savingField, setSavingField] = useState(false);

  const resetFieldForm = () => {
    setEditingFieldId(null);
    setFieldForm(EMPTY_FIELD_FORM);
  };

  const handleSaveCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !fieldForm.name.trim()) return;

    const options =
      fieldForm.type === "SELECT"
        ? fieldForm.options
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean)
        : [];

    if (fieldForm.type === "SELECT" && options.length === 0) {
      showToast("Agregá al menos una opción separada por comas", "error");
      return;
    }

    setSavingField(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");

      const isEditing = Boolean(editingFieldId);
      const res = await fetch(
        isEditing ? `/api/custom-fields/${editingFieldId}` : "/api/custom-fields",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...(isEditing ? {} : { storeId: store.id }),
            name: fieldForm.name.trim(),
            type: fieldForm.type,
            options,
            required: fieldForm.required,
            showInStore: fieldForm.showInStore,
          }),
        }
      );

      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.error || "No se pudo guardar el campo");

      if (isEditing) {
        setCustomFields((previous) =>
          previous.map((field) => (field.id === result.id ? result : field))
        );
      } else {
        setCustomFields((previous) =>
          [...previous, result].sort((a, b) => a.sortOrder - b.sortOrder)
        );
      }

      resetFieldForm();
      showToast(isEditing ? "Campo actualizado" : "Campo creado");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error al guardar el campo",
        "error"
      );
    } finally {
      setSavingField(false);
    }
  };

  const handleEditCustomField = (field: any) => {
    setEditingFieldId(field.id);
    setFieldForm({
      name: field.name,
      type: field.type,
      options: (field.options || []).join(", "),
      required: Boolean(field.required),
      showInStore: Boolean(field.showInStore),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteCustomField = async (id: string, onDeleted?: (id: string) => void) => {
    if (
      !confirm(
        "¿Eliminar este campo? También se eliminarán sus valores guardados en los productos."
      )
    )
      return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");

      const res = await fetch(`/api/custom-fields/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.error || "No se pudo eliminar el campo");

      setCustomFields((previous) => previous.filter((field) => field.id !== id));
      onDeleted?.(id);
      if (editingFieldId === id) resetFieldForm();
      showToast("Campo eliminado");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error al eliminar el campo",
        "error"
      );
    }
  };

  return {
    editingFieldId,
    fieldForm,
    setFieldForm,
    savingField,
    resetFieldForm,
    handleSaveCustomField,
    handleEditCustomField,
    handleDeleteCustomField,
  };
}