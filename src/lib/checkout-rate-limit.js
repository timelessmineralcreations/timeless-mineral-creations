import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const checkoutRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),

  limiter: Ratelimit.slidingWindow(
    10,
    "1 m"
  ),

  prefix: "tmc:checkout",
});
