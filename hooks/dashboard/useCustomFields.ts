
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useDialog } from "@/lib/dialog-context";
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
  const { showConfirm, showAlert } = useDialog();

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState(EMPTY_FIELD_FORM);
  const [savingField, setSavingField] = useState(false);

  // ==========================================
  // REINICIAR FORMULARIO
  // ==========================================

  const resetFieldForm = () => {
    setEditingFieldId(null);
    setFieldForm(EMPTY_FIELD_FORM);
  };

  // ==========================================
  // CREAR / ACTUALIZAR CAMPO
  // ==========================================

  const handleSaveCustomField = async (e: React.FormEvent) => {
    e.preventDefault();

    if (savingField) return;

    if (!store) {
      showAlert("Error", "No se pudo identificar tu tienda.");
      return;
    }

    if (!fieldForm.name.trim()) {
      showAlert(
        "Nombre requerido",
        "Ingresá un nombre para el campo personalizado."
      );
      return;
    }

    const options =
      fieldForm.type === "SELECT"
        ? fieldForm.options
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean)
        : [];

    if (fieldForm.type === "SELECT" && options.length === 0) {
      showAlert(
        "Faltan opciones",
        "Agregá al menos una opción separada por comas."
      );
      return;
    }

    setSavingField(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Tu sesión expiró. Volvé a iniciar sesión."
        );
      }

      const isEditing = Boolean(editingFieldId);

      const res = await fetch(
        isEditing
          ? `/api/custom-fields/${editingFieldId}`
          : "/api/custom-fields",
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

      if (!res.ok) {
        throw new Error(
          result?.error || "No se pudo guardar el campo."
        );
      }

      if (isEditing) {
        setCustomFields((previous) =>
          previous.map((field) =>
            field.id === result.id ? result : field
          )
        );
      } else {
        setCustomFields((previous) =>
          [...previous, result].sort(
            (a, b) => a.sortOrder - b.sortOrder
          )
        );
      }

      resetFieldForm();

      showToast(
        isEditing
          ? "Campo actualizado correctamente."
          : "Campo creado correctamente.",
        "success"
      );

    } catch (error) {
      console.error("Error al guardar campo:", error);

      showAlert(
        "Error al guardar campo",
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );

    } finally {
      setSavingField(false);
    }
  };

  // ==========================================
  // EDITAR CAMPO
  // ==========================================

  const handleEditCustomField = (field: any) => {
    setEditingFieldId(field.id);

    setFieldForm({
      name: field.name,
      type: field.type,
      options: (field.options || []).join(", "),
      required: Boolean(field.required),
      showInStore: Boolean(field.showInStore),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // ELIMINAR CAMPO
  // ==========================================

  const handleDeleteCustomField = (
    id: string,
    onDeleted?: (id: string) => void
  ) => {
    showConfirm({
      title: "¿Eliminar campo?",
      message:
        "Si el campo tiene valores asignados en productos, el sistema no permitirá eliminarlo para evitar la pérdida de datos.",

      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",

      onConfirm: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            throw new Error(
              "Tu sesión expiró. Volvé a iniciar sesión."
            );
          }

          const res = await fetch(
            `/api/custom-fields/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          const result = await res.json().catch(() => null);

          if (!res.ok) {
            throw new Error(
              result?.error || "No se pudo eliminar el campo."
            );
          }

          // Actualizar lista
          setCustomFields((previous) =>
            previous.filter((field) => field.id !== id)
          );

          // Ejecutar callback opcional
          onDeleted?.(id);

          // Si se estaba editando este campo, limpiar formulario
          if (editingFieldId === id) {
            resetFieldForm();
          }

          showToast(
            "Campo eliminado correctamente.",
            "success"
          );

        } catch (error) {
          console.error("Error al eliminar campo:", error);

          showAlert(
            "No se pudo eliminar el campo",
            error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado."
          );
        }
      },
    });
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
