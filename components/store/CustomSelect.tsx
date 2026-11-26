"use client";

import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  isLightTheme: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  isLightTheme,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative w-full" ref={ref}>
      {/* Botón que simula el select */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm outline-none border transition ${
          isLightTheme
            ? "bg-white text-black border-black/20 hover:border-black/40"
            : "bg-[#1a1e26] text-white border-white/20 hover:border-white/40"
        }`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <span className={`text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Lista desplegable personalizada */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-1 rounded-lg border shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto ${
            isLightTheme
              ? "bg-white border-black/10"
              : "bg-[#1a1e26] border-slate-700"
          }`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition ${
                value === opt.value
                  ? isLightTheme
                    ? "bg-black/5 font-semibold text-black"
                    : "bg-white/10 font-semibold text-white"
                  : isLightTheme
                  ? "text-slate-700 hover:bg-black/5"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}