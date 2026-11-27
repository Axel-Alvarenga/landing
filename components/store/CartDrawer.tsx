"use client";

import type { CartItem } from "@/lib/store/types";
import { formatPrice } from "@/lib/store/format";
import { CartItemRow } from "./CartItemRow";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemove: (cartItemId: string) => void;
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  isCheckingOut: boolean;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  total,
  onUpdateQuantity,
  onRemove,
  customerName,
  onCustomerNameChange,
  paymentMethod,
  onPaymentMethodChange,
  isCheckingOut,
  onCheckout,
}: CartDrawerProps) {
  return (
    <aside
      className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white text-slate-900 z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-5 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold">Tu Carrito</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl font-bold p-2">
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-4xl mb-4">🛒</p>
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItemRow
              key={item.cartItemId}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-5 border-t bg-gray-50 space-y-4 overflow-y-auto">
          <h3 className="font-bold text-gray-800">Datos del pedido</h3>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del cliente</label>
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              maxLength={80}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Método de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia bancaria">Transferencia bancaria</option>
            </select>
          </div>

          <div className="flex justify-between items-center pt-3 border-t text-lg font-bold">
            <span>Total:</span>
            <span className="text-emerald-600">{formatPrice(total)}</span>
          </div>

          <button
            onClick={onCheckout}
            disabled={!customerName.trim() || isCheckingOut}
            className="w-full bg-[#25D366] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#20b858] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingOut ? "Registrando pedido..." : "Finalizar por WhatsApp"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Tu pedido será enviado directamente al WhatsApp de la tienda.
          </p>
        </div>
      )}
    </aside>
  );
}