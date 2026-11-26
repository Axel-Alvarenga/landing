export type CustomFieldType = "TEXT" | "NUMBER" | "SELECT" | "DATE" | "CHECKBOX";

export type CustomField = {
  id: string;
  name: string;
  type: CustomFieldType;
  options: string[];
  required: boolean;
  sortOrder: number;
};

export type CustomFieldValue = {
  fieldId: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string | null;
  customFieldValues: CustomFieldValue[];
};

export type Store = {
  id: string;
  name: string;
  category: string;
  template: string;
  whatsapp: string;
  slug: string;
  logoUrl: string | null;
  customFields: CustomField[];
};

export type CartItem = Product & { quantity: number };

export type TemplateTheme = {
  bg: string;
  text: string;
  accent: string;
  card: string;
  nav: string;
};