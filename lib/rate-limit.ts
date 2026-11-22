import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Creamos el limitador: 5 pedidos por minuto por IP (ventana deslizante)
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/orders",
});