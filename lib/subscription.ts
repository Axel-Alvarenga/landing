
export const PRO_PRICE = 70000;
export const TRIAL_DAYS = 7;
export const GRACE_DAYS = 2;

export type SubscriptionStatus =
  | "TRIAL"
  | "PRO"
  | "GRACE"
  | "EXPIRED";

export type SubscriptionInfo = {
  status: SubscriptionStatus;
  isActive: boolean;
  canManage: boolean;
  canReceiveOrders: boolean;
  daysRemaining: number;
  expiresAt: Date;
  graceEndsAt: Date;
};

// Tipo compatible con los datos de una tienda
type SubscriptionStore = {
  createdAt: Date;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
};

// Agregar días a una fecha
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Calcular días restantes
function getDaysRemaining(date: Date): number {
  const difference = date.getTime() - Date.now();

  return Math.max(
    0,
    Math.ceil(difference / (1000 * 60 * 60 * 24))
  );
}

// Calcular el vencimiento del próximo mes calendario
export function addOneMonth(date: Date): Date {
  const result = new Date(date);
  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + 1);

  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();

  result.setDate(Math.min(originalDay, lastDay));

  return result;
}

// Obtener estado de la suscripción de una tienda
export function getSubscriptionInfo(
  store: SubscriptionStore
): SubscriptionInfo {
  const now = new Date();

  // Si alguna vez se activó Pro, su vencimiento prevalece
  // sobre el vencimiento de la prueba gratuita.
  const isProSubscription = store.subscriptionEndsAt !== null;

  const expiresAt = isProSubscription
    ? store.subscriptionEndsAt!
    : store.trialEndsAt ?? addDays(store.createdAt, TRIAL_DAYS);

  const graceEndsAt = addDays(expiresAt, GRACE_DAYS);

  // PRO activo
  if (isProSubscription && now <= expiresAt) {
    return {
      status: "PRO",
      isActive: true,
      canManage: true,
      canReceiveOrders: true,
      daysRemaining: getDaysRemaining(expiresAt),
      expiresAt,
      graceEndsAt,
    };
  }

  // Prueba gratuita activa
  if (!isProSubscription && now <= expiresAt) {
    return {
      status: "TRIAL",
      isActive: true,
      canManage: true,
      canReceiveOrders: true,
      daysRemaining: getDaysRemaining(expiresAt),
      expiresAt,
      graceEndsAt,
    };
  }

  // Período de gracia (2 días)
  if (now <= graceEndsAt) {
    return {
      status: "GRACE",
      isActive: false,
      canManage: false,
      canReceiveOrders: true,
      daysRemaining: getDaysRemaining(graceEndsAt),
      expiresAt,
      graceEndsAt,
    };
  }

  // Suscripción completamente vencida
  return {
    status: "EXPIRED",
    isActive: false,
    canManage: false,
    canReceiveOrders: false,
    daysRemaining: 0,
    expiresAt,
    graceEndsAt,
  };
}
