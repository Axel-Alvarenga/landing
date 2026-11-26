import type { CustomField } from "./types";

export const formatPrice = (price: number) =>
  `Gs. ${Number(price || 0).toLocaleString("es-PY")}`;

export function formatCustomFieldValue(
  field: CustomField,
  value: string
): string {
  if (!value) return "";
  switch (field.type) {
    case "CHECKBOX":
      return value === "true" ? "Sí" : "No";
    case "DATE": {
      const d = new Date(value);
      return Number.isNaN(d.getTime())
        ? value
        : d.toLocaleDateString("es-PY");
    }
    default:
      return value;
  }
}