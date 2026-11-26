"use client";

import type { CustomField } from "@/lib/store/types";
import { CustomSelect } from "./CustomSelect";

interface StoreFiltersProps {
  isLightTheme: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoriesList: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  filterableFields: CustomField[];
  customFilters: Record<string, string>;
  onCustomFilterChange: (fieldId: string, value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
}

export function StoreFilters({
  isLightTheme,
  searchQuery,
  onSearchChange,
  categoriesList,
  selectedCategory,
  onCategoryChange,
  filterableFields,
  customFilters,
  onCustomFilterChange,
  sortBy,
  onSortChange,
  sortOptions,
}: StoreFiltersProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Buscador móvil */}
      <div className="md:hidden relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar productos..."
          className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition ${
            isLightTheme
              ? "bg-black/5 border-black/10 focus:border-black/30 placeholder-black/50"
              : "bg-white/5 border-white/10 focus:border-white/30 placeholder-white/50"
          }`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Categorías */}
      {categoriesList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => onCategoryChange("Todos")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
              selectedCategory === "Todos"
                ? isLightTheme
                  ? "bg-black text-white"
                  : "bg-white text-black"
                : `border ${
                    isLightTheme
                      ? "border-black/20 hover:border-black"
                      : "border-white/20 hover:border-white"
                  } opacity-70 hover:opacity-100`
            }`}
          >
            Todos
          </button>

          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? isLightTheme
                    ? "bg-black text-white"
                    : "bg-white text-black"
                  : `border ${
                      isLightTheme
                        ? "border-black/20 hover:border-black"
                        : "border-white/20 hover:border-white"
                    } opacity-70 hover:opacity-100`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Filtros por custom fields + orden */}
      <div className="flex flex-wrap gap-4 items-end">
        {filterableFields.map((field) => {
          const value = customFilters[field.id] || "";
          const options =
            field.type === "SELECT" ? field.options : ["true", "false"];

          const formattedOptions = [
            { value: "", label: "Todos" },
            ...options.map((opt) => ({
              value: opt,
              label:
                field.type === "CHECKBOX"
                  ? opt === "true"
                    ? "Sí"
                    : "No"
                  : opt,
            })),
          ];

          return (
            <div key={field.id} className="w-full sm:w-auto min-w-[140px]">
              <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1.5">
                {field.name}
              </label>
              <CustomSelect
                value={value}
                onChange={(val) => onCustomFilterChange(field.id, val)}
                options={formattedOptions}
                isLightTheme={isLightTheme}
              />
            </div>
          );
        })}

        <div className="w-full sm:w-auto sm:ml-auto min-w-[160px]">
          <label className="block text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1.5">
            Ordenar por
          </label>
          <CustomSelect
            value={sortBy}
            onChange={onSortChange}
            options={sortOptions}
            isLightTheme={isLightTheme}
          />
        </div>
      </div>
    </div>
  );
}