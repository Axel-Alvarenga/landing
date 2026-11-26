export const isSameDay = (value: string | Date, date: Date) => {
  const parsed = new Date(value);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getFullYear() === date.getFullYear() &&
    parsed.getMonth() === date.getMonth() &&
    parsed.getDate() === date.getDate()
  );
};

export const getDashboardStats = (orders: any[], products: any[]) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const soldOrders = orders.filter((order) => order.status === "SOLD");
  const todayOrders = orders.filter((order) => isSameDay(order.createdAt, today));
  const todaySales = soldOrders
    .filter((order) => isSameDay(order.createdAt, today))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const lowStockProducts = products.filter(
    (product) =>
      product.stock !== null &&
      product.stock !== undefined &&
      Number(product.stock) <= 5
  );

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfToday);
    date.setDate(startOfToday.getDate() - (6 - index));
    const total = soldOrders
      .filter((order) => isSameDay(order.createdAt, date))
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    return {
      date,
      label: date.toLocaleDateString("es-PY", { weekday: "short" }).replace(".", ""),
      total,
    };
  });
  const maxDailySales = Math.max(...lastSevenDays.map((day) => day.total), 1);

  const bestSellingProducts = Object.values(
    soldOrders.reduce(
      (acc: Record<string, { name: string; quantity: number }>, order) => {
        (order.items || []).forEach((item: any) => {
          const name = item.productName || "Producto";
          if (!acc[name]) acc[name] = { name, quantity: 0 };
          acc[name].quantity += Number(item.quantity || 0);
        });
        return acc;
      },
      {}
    )
  )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return {
    todayOrders,
    todaySales,
    lowStockProducts,
    lastSevenDays,
    maxDailySales,
    bestSellingProducts,
    recentOrders,
  };
};