"use client";

import { formatGs } from "@/lib/dashboard/format";
import { getDashboardStats } from "@/lib/dashboard/stats";
import type { DashboardTab } from "@/hooks/dashboard/useDashboard";

interface DashboardOverviewProps {
  orders: any[];
  products: any[];
  onChangeTab: (tab: DashboardTab) => void;
}

export function DashboardOverview({ orders, products, onChangeTab }: DashboardOverviewProps) {
  const {
    todayOrders,
    todaySales,
    lowStockProducts,
    lastSevenDays,
    maxDailySales,
    bestSellingProducts,
    recentOrders,
  } = getDashboardStats(orders, products);

  return (
    <div className="space-y-6">
      {/* INDICADORES PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#15181e] border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Ventas de hoy</p>
          <p className="text-2xl md:text-3xl font-bold text-emerald-400">
            {formatGs(todaySales)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Solo ventas confirmadas</p>
        </div>
        <div className="bg-[#15181e] border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Pedidos de hoy</p>
          <p className="text-3xl font-bold text-white">{todayOrders.length}</p>
          <p className="text-xs text-slate-500 mt-2">Pedidos recibidos hoy</p>
        </div>
        <div className="bg-[#15181e] border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Productos activos</p>
          <p className="text-3xl font-bold text-white">{products.length}</p>
          <p className="text-xs text-slate-500 mt-2">En tu catálogo</p>
        </div>
        <div className="bg-[#15181e] border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Stock bajo</p>
          <p
            className={`text-3xl font-bold ${
              lowStockProducts.length ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {lowStockProducts.length}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Productos con 5 unidades o menos
          </p>
        </div>
      </div>

      {/* VENTAS DE LOS ÚLTIMOS 7 DÍAS */}
      <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">
              Ventas de los últimos 7 días
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ingresos de pedidos confirmados
            </p>
          </div>
          <span className="text-sm text-emerald-400 font-semibold">
            {formatGs(lastSevenDays.reduce((sum, day) => sum + day.total, 0))}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2 md:gap-4 items-end h-44">
          {lastSevenDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className="h-full flex flex-col items-center justify-end gap-2 min-w-0"
            >
              <span className="text-[9px] md:text-[10px] text-slate-500 truncate max-w-full">
                {day.total > 0 ? day.total.toLocaleString("es-PY") : "—"}
              </span>
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md bg-emerald-500/80 min-h-[3px] transition-all"
                  style={{
                    height: `${
                      day.total > 0
                        ? Math.max((day.total / maxDailySales) * 100, 5)
                        : 2
                    }%`,
                  }}
                  title={formatGs(day.total)}
                />
              </div>
              <span className="text-[10px] text-slate-400 capitalize">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* PEDIDOS RECIENTES */}
        <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Pedidos recientes</h2>
            <button
              onClick={() => onChangeTab("pedidos")}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              Ver todos →
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Todavía no hay pedidos.
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-800/70 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {order.customerName || "Cliente"}
                    </p>
                    <p className="text-xs text-slate-500">
                      #{String(order.id).slice(-8).toUpperCase()} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("es-PY")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white">
                      {formatGs(Number(order.total || 0))}
                    </p>
                    <span
                      className={`text-[10px] font-bold ${
                        order.status === "SOLD"
                          ? "text-emerald-400"
                          : order.status === "PENDING"
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {order.status === "SOLD"
                        ? "Vendido"
                        : order.status === "PENDING"
                        ? "Pendiente"
                        : "Cancelado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCTOS MÁS VENDIDOS */}
        <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-white mb-4">
            Productos más vendidos
          </h2>
          {bestSellingProducts.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Todavía no hay ventas confirmadas.
            </p>
          ) : (
            <div className="space-y-4">
              {bestSellingProducts.map((product, index) => (
                <div key={product.name}>
                  <div className="flex justify-between gap-3 text-sm mb-2">
                    <span className="text-slate-200 truncate">
                      {index + 1}. {product.name}
                    </span>
                    <span className="text-emerald-400 font-semibold shrink-0">
                      {product.quantity} u.
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${
                          (product.quantity / bestSellingProducts[0].quantity) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ALERTAS DE STOCK */}
      <div className="bg-[#15181e] border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Alertas de inventario
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Productos que necesitan reposición
            </p>
          </div>
          <button
            onClick={() => onChangeTab("productos")}
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            Ir a productos →
          </button>
        </div>
        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-emerald-400">
            ✓ No hay productos con stock bajo.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center gap-3 bg-[#0f1115] rounded-lg p-3"
              >
                <span className="text-sm text-slate-200 truncate">
                  {product.name}
                </span>
                <span className="text-xs font-bold text-amber-400 shrink-0">
                  {Number(product.stock)} u.
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}