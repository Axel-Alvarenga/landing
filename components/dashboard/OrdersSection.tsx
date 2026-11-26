"use client";

interface OrdersSectionProps {
  orders: any[];
  loadingOrders: boolean;
  processingOrderId: string | null;
  onRefresh: () => void;
  onAction: (orderId: string, action: "confirm" | "cancel") => void;
}

export function OrdersSection({
  orders,
  loadingOrders,
  processingOrderId,
  onRefresh,
  onAction,
}: OrdersSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Pedidos recibidos
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Administrá los pedidos de tus clientes.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loadingOrders}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-50"
        >
          {loadingOrders ? "Actualizando..." : "↻ Actualizar"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Todos", value: orders.length },
          {
            label: "Pendientes",
            value: orders.filter((o) => o.status === "PENDING").length,
          },
          {
            label: "Vendidos",
            value: orders.filter((o) => o.status === "SOLD").length,
          },
          {
            label: "Cancelados",
            value: orders.filter((o) => o.status === "CANCELLED").length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-[#15181e] border border-slate-800 rounded-xl p-4"
          >
            <p className="text-xs text-slate-400">{item.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {loadingOrders ? (
        <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          Cargando pedidos...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h3 className="text-lg font-bold text-white mb-2">
            Todavía no recibiste pedidos
          </h3>
          <p className="text-slate-400 text-sm">
            Cuando un cliente realice un pedido, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#15181e] border border-slate-800 rounded-2xl overflow-hidden"
            >
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-white">
                      Pedido #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        order.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400"
                          : order.status === "SOLD"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {order.status === "PENDING"
                        ? "Pendiente"
                        : order.status === "SOLD"
                        ? "Vendido"
                        : "Cancelado"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Cliente: <strong>{order.customerName}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(order.createdAt).toLocaleString("es-PY")}
                  </p>
                </div>

                <div className="md:text-right">
                  <p className="text-xs text-slate-400">Total del pedido</p>
                  <p className="text-xl font-bold text-emerald-400">
                    Gs. {Number(order.total).toLocaleString("es-PY")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Pago: {order.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-3">
                  Productos
                </p>
                <div className="space-y-2">
                  {(order.items || []).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="text-slate-300">
                        {item.quantity} x {item.productName}
                      </span>
                      <span className="text-slate-400 whitespace-nowrap">
                        Gs. {Number(item.subtotal).toLocaleString("es-PY")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-800">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => onAction(order.id, "confirm")}
                      disabled={processingOrderId === order.id}
                      className="bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {processingOrderId === order.id
                        ? "Procesando..."
                        : "✓ Confirmar venta"}
                    </button>
                  )}
                  {order.status !== "CANCELLED" && (
                    <button
                      onClick={() => onAction(order.id, "cancel")}
                      disabled={processingOrderId === order.id}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}