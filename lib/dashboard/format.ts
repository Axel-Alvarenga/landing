export const formatGs = (amount: number) =>
  `Gs. ${Number(amount || 0).toLocaleString("es-PY")}`;