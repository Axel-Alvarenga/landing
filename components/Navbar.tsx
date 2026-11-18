"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">TiendaFácil</Link>

        {/* Desktop */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="#categorias">Categorías</Link>
          <Link href="#precios">Precios</Link>
          <Link href="/login">Ingresar</Link>
          <Link href="/registro" className="bg-black text-white px-4 py-2 rounded-lg">
            Crear tienda
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4">
          <Link href="#categorias" onClick={() => setOpen(false)}>Categorías</Link>
          <Link href="#precios" onClick={() => setOpen(false)}>Precios</Link>
          <Link href="/login">Ingresar</Link>
          <Link href="/registro" className="bg-black text-white text-center py-2 rounded-lg">
            Crear tienda
          </Link>
        </div>
      )}
    </nav>
  );
}